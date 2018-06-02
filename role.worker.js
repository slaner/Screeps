var CreepController = require('creep.controller');
var Settings = require('core.settings');
var Utils = require('core.utils');

module.exports = {
    run: function(creep) {
        // 크립에게 할당된 명령을 수행한다.
        if (creep.memory.job === Settings.JobHarvest) {
            var result = CreepController.handleHarvestJob(creep);
            if (!result) {
                creep.memory.target = undefined;
                creep.memory.job = Settings.JobBuild;
            }
        }

        if (creep.memory.job === Settings.JobBuild) {
            var result = CreepController.handleBuildJob(creep);
            if (!result) {
                creep.memory.target = undefined;
                creep.memory.job = Settings.JobTransfer;
            }
        }

        if (creep.memory.job === Settings.JobTransfer) {
            // 반납 작업을 수행한다.
            var result = CreepController.handleTransferJob(creep);
            if (!result) {
                creep.memory.target = undefined;
                creep.memory.job = Settings.JobHarvest;
            }
        }
    },
};