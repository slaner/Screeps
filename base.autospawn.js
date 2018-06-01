var coreSettings = require('core.settings');
var coreUtils = require('core.utils');

var baseAutoSpawn = {
    spawnIfAvailable: function() {
        var creepName = coreSettings.WorkerPrefix + Game.time;
        if (coreUtils.canSpawn(coreSettings.SpawnerName, creepName) && coreUtils.getCreepCount() < coreSettings.NumberOfWorkers) {
            // Spawn
            Game.spawns[coreSettings.SpawnerName].spawnCreep([WORK, CARRY, MOVE], creepName, {memory: {role: coreSettings.WorkerRole}});
        }
    }
}

module.exports = baseAutoSpawn;