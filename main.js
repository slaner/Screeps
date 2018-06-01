var baseAutoSpawn = require('base.autospawn');
var roleWorker = require('role.worker');
var coreUtils = require('core.utils');
var coreSettings = require('core.settings');

module.exports.loop = function () {
    baseAutoSpawn.spawnIfAvailable();
    
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == coreSettings.WorkerRole) roleWorker.run(creep);
    }
};