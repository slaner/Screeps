var CreepController = require('creep.controller');
var Settings = require('core.settings');
var Utils = require('core.utils');

module.exports = {
    run: function(creep) {
        // 크립의 역할이 일꾼일 경우 작업 명령을 수행한다.
        if (creep.memory.role === Settings.WorkerRole) {
            CreepController.work(creep);
        }
    },
};