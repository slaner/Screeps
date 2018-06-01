var coreSettings = require('core.settings');
var coreUtils = require('core.utils');

var roleWorker = {
    run: function(creep) {
        // 건설중이며 운반하고 있는 에너지가 없다면
        if (creep.memory.isBuilding && creep.carry.energy == 0) {
            // 자원을 채집하도록 명령한다.
            creep.memory = {
                role: coreSettings.WorkerRole,
                isBuilding: false,
                targetId: undefined,
            };
            creep.say('Harvest');
        }

        // 건설중이지 않고 운반할 수 있는 에너지의 양이 한도에 도달한 경우
        else if (!creep.memory.isBuilding && creep.carry.energy == creep.carryCapacity) {
            // 건설하도록 명령한다.
            creep.memory = {
                role: coreSettings.WorkerRole,
                isBuilding: true,
                targetId: undefined,
            };
            creep.say('Build');
        }
        
        // 건설중일 경우
        if (creep.memory.isBuilding) {
            // 건설할만한 곳을 찾은 경우
            if (coreUtils.buildClosestConstructionSite(creep)) {
                // 가장 가까운 위치를 찾은 경우 대상에 대한 작업을 수행한다.
                // 너무 멀어서 수행할 수 없는 경우 대상 위치까지 이동한다.
                var site = Game.getObjectById(creep.memory.targetId);
                if (!site) return;

                if (creep.build(site) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(site, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }

            // 건설할 곳을 찾지 못했다면 자원을 기지에 보관한다.
            else {
                // 범위 내에 없다면 기지로 이동한다.
                var result = creep.transfer(Game.spawns[coreSettings.SpawnerName], RESOURCE_ENERGY);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns[coreSettings.SpawnerName]);
                }

                // 자원 보관을 성공한 경우
                else if (result == OK) {

                }
            }
        }

        // 건설중이지 않을 경우 (자원 채집)
        else {
            if (coreUtils.harvestClosestSource(creep)) {
                // 가장 가까운 위치를 찾은 경우 대상에 대한 작업을 수행한다.
                // 너무 멀어서 수행할 수 없는 경우 대상 위치까지 이동한다.
                var source = Game.getObjectById(creep.memory.targetId);
                if (!source) return;

                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#00ffff'}});
                }
            }
        }
    }
};

module.exports = roleWorker;