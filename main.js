var AutoSpawn = require('basic.autospawn');
var roleWorker = require('role.worker');
var Settings = require('core.settings');

module.exports.loop = function () {
    AutoSpawn.spawnIfAvailable();
    
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == Settings.WorkerRole) roleWorker.run(creep);
    }
};