var Utils = require('core.utils');
var Settings = require('core.settings');
var FlowControl = require('core.flowcontrol');

module.exports = {
    __handleError: function(creep, target, result) {
        switch (result) {
            // 거리 내에 없다면 대상 위치로 이동시킨다.
            case ERR_NOT_IN_RANGE:
                creep.moveTo(target);
                break;

            // 잘못된 대상이면 대상을 초기화한다.
            case ERR_INVALID_TARGET:
                creep.memory.target = undefined;
                break;

            // 기타 오류인 경우 출력하고 false를 반환한다.
            default:
                creep.say('ERR: ' + result);
                return false;
        }
        return true;
    },

    __harvest: function(creep) {
        // 이 크립이 운반하고 있는 에너지가 최대치에 도달한 경우
        if (creep.carry.energy >= creep.carryCapacity) {
            // 자원 보관 작업을 수행하도록 설정한다.
            creep.memory.job = Settings.JobTransfer;
            return FlowControl.FLOW_CONTROL_RUN;
        }

        // 채집할 대상이 설정되어 있지 않은 경우
        if (!creep.memory.target) {
            // 떨어진 리소스를 먼저 찾고
            // 떨어진 리소스가 없다면 소스를 찾는다.
            // 소스도 없다면 채집 가능한 대상이 생길때까지 반복한다.
            var result = Utils.setClosestObjectAsTarget(creep, FIND_DROPPED_RESOURCES);
            if (!result) result = Utils.setClosestObjectAsTarget(creep, FIND_SOURCES_ACTIVE);
            if (!result) return FlowControl.FLOW_CONTROL_STOP;
        }

        // 채집할 대상을 구하고, 채집 작업을 수행한다.
        var target = Game.getObjectById(creep.memory.target);
        result = creep.harvest(target);
        this.__handleError(creep, target, result);

        // 채집 작업이 성공한 경우
        if (result == OK) {
            // 값이 설정되어 있다면 없앤다.
            if (creep.memory.RefreshCount) {
                creep.memory = {
                    role: creep.memory.role,
                    job: creep.memory.job,
                    target: creep.memory.target,
                };
            }
        }

        // 범위 내에 없는 경우
        else if (result == ERR_NOT_IN_RANGE) {
            // 크립과 소스의 거리를 계산한다.
            var distance = Utils.getDistance(creep, target);

            // 거리가 RetryUpdateHarvestSourceDistance이하일 경우
            if (distance <= Settings.RetryUpdateHarvestSourceDistance) {
                // RefreshCount가 설정되지 않은 경우 1로 설정한다.
                if (!creep.memory.RefreshCount) creep.memory.RefreshCount = 1;
                // 설정되어 있는 경우엔 1 증가시킨다.
                else creep.memory.RefreshCount = creep.memory.RefreshCount + 1;

                // RefreshCount값이 RetryUpdateHarvestSource와 같거나 크면 대상을 다시 설정하도록 메모리의 값을 비운다.
                if (creep.memory.RefreshCount >= Settings.RetryUpdateHarvestSource) {
                    Utils.resetWorkerCreepMemory(creep);
                }
            }
        }
        
        // 채집 작업을 수행할 수 없는 크립인 경우 작업을 바꾼다.
        else if (result == ERR_NO_BODYPART) {
            Utils.resetWorkerCreepMemory(creep);
            // TODO: 공격 또는 방어 등의 작업을 설정한다.
            return FlowControl.FLOW_CONTROL_RUN;
        }

        return FlowControl.FLOW_CONTROL_STOP;
    },
    __transfer: function(creep, resourceType = RESOURCE_ENERGY) {
        if (!creep.carry.energy) {
            creep.memory.job = Settings.JobHarvest;
            return FlowControl.FLOW_CONTROL_STOP;
        }
        if (!creep.memory.target) {
            // 가장 가까운 에너지 보관 장소를 대상으로 설정한다.
            var result = Utils.setClosestStorageAsTarget(creep);

            // 에너지를 보관할 장소를 찾지 못했다면 업그레이드 작업을 수행하도록 설정한다.
            if (!result) {
                creep.memory.job = Settings.Upgrade;
                return FlowControl.FLOW_CONTROL_RUN;
            }
        }

        var target = Game.getObjectById(creep.memory.target);
        result = creep.transfer(target, resourceType);
        this.__handleError(creep, target, result);
        
        if (result == ERR_NO_BODYPART) {
            Utils.resetWorkerCreepMemory(creep);
            // TODO: 공격 또는 방어 등의 작업을 설정한다.
            return FlowControl.FLOW_CONTROL_RUN;
        }

        return FlowControl.FLOW_CONTROL_STOP;
    },
    __upgrade: function(creep) {
        if (!creep.carry.energy) {
            creep.memory.job = Settings.JobHarvest;
            return FlowControl.FLOW_CONTROL_STOP;
        }
        if (!creep.memory.target) {
            // 컨트롤러를 대상으로 설정한다.
            var result = Utils.setControllerAsTarget(creep);

            // 컨트롤러를 찾지 못했다면 건설 작업을 수행하도록 설정한다.
            if (!result) {
                creep.memory.job = Settings.JobBuild;
                return FlowControl.FLOW_CONTROL_RUN;
            }
        }
        
        var target = Game.getObjectById(creep.memory.target);
        result = creep.upgradeController(target);
        this.__handleError(creep, target, result);
        
        if (result == ERR_NO_BODYPART) {
            Utils.resetWorkerCreepMemory(creep);
            // TODO: 공격 또는 방어 등의 작업을 설정한다.
            return FlowControl.FLOW_CONTROL_RUN;
        }

        return FlowControl.FLOW_CONTROL_STOP;
    },
    __build: function(creep) {
        if (!creep.carry.energy) {
            creep.memory.job = Settings.JobHarvest;
            return FlowControl.FLOW_CONTROL_STOP;
        }
        if (!creep.memory.target) {
            // 가장 가까운 객체를 대상으로 설정한다.
            var result = Utils.setClosestObjectAsTarget(creep, FIND_MY_CONSTRUCTION_SITES);

            // 건설할 수 있는 대상이 없다면 채집 작업을 수행하도록 설정한다.
            if (!result) {
                creep.memory.job = Settings.JobHarvest;
                return FlowControl.FLOW_CONTROL_RUN;
            }
        }

        var target = Game.getObjectById(creep.memory.target);
        result = creep.build(target);
        this.__handleError(creep, target, result);
        
        if (result == ERR_NO_BODYPART) {
            Utils.resetWorkerCreepMemory(creep);
            // TODO: 공격 또는 방어 등의 작업을 설정한다.
            return FlowControl.FLOW_CONTROL_RUN;
        }

        return FlowControl.FLOW_CONTROL_STOP;
    },
    /**
     * 크립에게 작업 명령을 내리는 함수
     * @param creep 작업 명령을 수행할 크립
     */
    work: function(creep) {
        // 크립이 해야할 작업이 정해지지 않았다면 채집 작업부터 수행하도록 명령한다.
        if (!creep.memory.job) creep.memory.job = Settings.JobHarvest;
        
        var workResult = 0;

        // 채집 작업
        if (creep.memory.job === Settings.JobHarvest) {
            workResult = this.__harvest(creep);
            if (workResult == FlowControl.FLOW_CONTROL_STOP) return;
        }

        // 운반 작업
        if (creep.memory.job === Settings.JobTransfer) {
            workResult = this.__transfer(creep);
            if (workResult == FlowControl.FLOW_CONTROL_STOP) return;
        }

        // 개조 작업
        if (creep.memory.job === Settings.JobUpgrade) {
            workResult = this.__upgrade(creep);
            if (workResult == FlowControl.FLOW_CONTROL_STOP) return;
        }

        // 건설 작업
        if (creep.memory.job === Settings.JobBuild) {
            workResult = this.__build(creep);
            if (workResult == FlowControl.FLOW_CONTROL_STOP) return;
        }


    },
};