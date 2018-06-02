var Utils = require('core.utils.js');

module.exports = {
    __postProcess(creep, target, result) {
        // 결과에 따라 다르게 처리한다.
        switch (result) {
            // 작업 성공
            case OK:
                creep.say('Job done');
                break;

            // 거리 내에 없다면 대상 위치로 이동시킨다.
            case ERR_NOT_IN_RANGE:
                creep.say('Not in range');
                creep.moveTo(target);
                break;

            // 기타 오류인 경우 출력하고 false를 반환한다.
            default:
                creep.say('Error: ' + result);
                return false;
        }
        return true;
    },

    handleTransferJob: function(creep, resourceType = RESOURCE_ENERGY) {
        // 운반하고 있는 에너지가 없다면 수행하지 않는다.
        if (!creep.carry) return false;

        // 대상이 설정되어 있지 않다면 수행한다.
        if (!creep.memory.target) {
            var result = Utils.setClosestStorageAsTarget(creep);
            if (!result) return false;
        }

        var target = Game.getObjectById(creep.memory.target);
        result = creep.transfer(target, resourceType);
        return this.__postProcess(creep, target, result);
    },

    handleBuildJob: function(creep) {
        // 운반하고 있는 에너지가 없다면 수행하지 않는다.
        if (!creep.carry) return false;
        
        // 대상이 설정되어 있지 않다면 수행한다.
        if (!creep.memory.target) {
            // 가장 가까운 객체를 대상으로 설정한다.
            var result = Utils.setClosestObjectAsTarget(creep, FIND_MY_CONSTRUCTION_SITES);

            // 건설할 수 있는 대상이 없다면 false를 반환한다.
            if (!result) return false;
        }

        // 대상 객체를 가져온다.
        var target = Game.getObjectById(creep.memory.target);

        // 건설을 시도한다.
        result = creep.build(target);
        return this.__postProcess(creep, target, result);
    },

    handleHarvestJob: function(creep) {
        // 이 크립이 운반하고 있는 에너지가 최대치에 도달한 경우
        // 반납 작업을 수행하도록 설정한다.
        if (creep.carry == creep.carryCapacity) {
            creep.memory.job = Settings.JobTransfer;
            return true;
        }
        
        // 대상이 설정되어 있지 않다면 수행한다.
        if (!creep.memory.target) {
            // 가장 가까운 객체를 대상으로 설정한다.
            var result = Utils.setClosestObjectAsTarget(creep, FIND_SOURCES_ACTIVE);

            // 채집할 수 있는 객체를 모두 시도한다.
            if (!result) result = Utils.setClosestObjectAsTarget(creep, FIND_DROPPED_ENERGY);
            if (!result) result = Utils.setClosestObjectAsTarget(creep, FIND_DROPPED_RESOURCES);

            // 채집할 수 있는 객체가 없다면 false를 반환한다.
            if (!result) return false;
        }
        
        // 대상 객체를 가져온다.
        var target = Game.getObjectById(creep.memory.target);

        // 채집을 시도한다.
        result = creep.harvest(target);
        return this.__postProcess(creep, target, result);
    },
};