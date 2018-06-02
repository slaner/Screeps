var Settings = require('core.settings');
var Utils = require('core.utils');

module.exports = {
    spawnIfAvailable: function() {
        var creepName = Settings.WorkerPrefix + Game.time;
        if (Utils.canSpawn(Settings.SpawnerName, Settings.CreepBody, creepName) && Utils.getCreepCount() < Settings.NumberOfWorkers) {
            // Spawn
            Game.spawns[Settings.SpawnerName].spawnCreep(
                Settings.CreepBody,
                creepName,
                {
                    memory: {
                        role: Settings.WorkerRole,
                        job: Settings.JobHarvest,
                    }
                });
        }
    }
}