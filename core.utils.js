var Settings = require('core.settings');
module.exports = {
    /**
     * 크립의 수를 반환합니다.
     * @param excludeDead 죽은 크립도 계수하려면 false, 무시하려면 true 입니다.
     */
    getCreepCount: function(excludeDead = true) {
        var count = 0;
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (!creep.my) continue;

            count++;
            if (creep.hits <= 0 && excludeDead) count--;
        }
        return count;
    },

    /**
     * 크립을 생산할 수 있는지 확인합니다.
     * @param spawnerName 스포너의 이름입니다.
     */
    canSpawn: function(spawnerName) {
        return Game.spawns[spawnerName].spawnCreep([MOVE, WORK, CARRY], 'DUMMY_SPAWNER_NAME', {dryRun: true}) == OK;
    },

    /**
     * 지정된 대상에서 작업을 하는 크립의 수를 반환합니다.
     * @param target 작업 중인 크립의 수를 확인할 대상입니다.
     **/
    getWorkerCreeps: function(target) {
        var count = 0;

        // 대상이 유효하지 않으면 수행하지 않는다.
        if (!target) return count;
        for (var creepName in Game.creeps) {
            var creep = Game.creeps[creepName];

            // 작업 대상이 설정되지 않은 크립은 건너뛴다.
            if (!creep.memory.targetId) continue;

            // 대상 id와 작업 대상의 id가 같으면 카운트를 1 증가시킨다.
            if (creep.memory.targetId == target.id) count++;
        }

        // 반복이 끝나면 카운트를 반환한다.
        return count;
    },

    /**
     * 일꾼 크립의 메모리를 초기화합니다.
     * @param creep 메모리를 초기화할 크립입니다.
     */
    resetWorkerCreepMemory: function(creep) {
        creep.memory = {
            role: creep.memory.role,
            job: creep.memory.job,
        };
    },

    getDistance: function(obj1, obj2) {
        var dx = Math.abs(obj1.pos.x - obj2.pos.x);
        var dy = Math.abs(obj1.pos.y - obj2.pos.y);
        return Math.sqrt(dx + dy);
    },

    /**
     * 크립의 위치에서 지정된 객체들의 위치를 가까운 순으로 정렬한 목록을 가져옵니다.
     * @param creep 크립
     * @param objectType 형식
     **/
    getObjectsSorted: function(creep, objectType) {
        var objects = creep.room.find(objectType);
        objects.sort(function(a, b) {
            return module.exports.getDistance(creep, a) > module.exports.getDistance(creep, b);
        });
        return objects;
    },

    setControllerAsTarget: function(creep) {
        if (!creep) return false;
        if (!creep.room.controller) return false;
        
        creep.memory.target = creep.room.controller.id;
        return true;
    },

    /**
     * 지정된 크립에서 가장 가까우면서 에너지를 저장할 수 있는 저장소를 대상으로 설정합니다.
     * @param creep 작업을 수행할 크립
     * @returns 작업 대상이 설정된 경우 true, 그 외의 경우 false
     */
    setClosestStorageAsTarget: function(creep) {
        var objects = this.getObjectsSorted(creep, FIND_MY_STRUCTURES);
        for (var i in objects) {
            var object = objects[i];
            
            if (object.energy < object.energyCapacity) {
                creep.memory.target = object.id;
                return true;
            }

            // 이 건물의 형식이 저장소가 아니면 건너뛴다.
            if (object.structureType != STRUCTURE_CONTAINER) continue;

            // 저장소가 가득 차있는 경우에도 건너뛴다.
            if (object.store >= object.storeCapacity) continue;
            
            // 이 저장소를 대상으로 설정한다.
            creep.memory.target = object.id;
            return true;
        }

        return false;
    },

    /**
     * 지정된 크립에서 가장 가까우면서 작업 대상으로 설정할 수 있는 객체를 대상으로 설정합니다.
     * @param creep 작업을 수행할 크립
     * @param objectType 작업 대상 형식
     * @returns 작업 대상이 설정된 경우 true, 그 외의 경우 false
     **/
    setClosestObjectAsTarget: function(creep, objectType) {
        // 목록을 추려낸다.
        var objects = this.getObjectsSorted(creep, objectType);
        
        // 가장 가까운 객체부터 몇 개의 크립이 작업 대상으로 설정했는지 확인한다.
        for (var i in objects) {
            var object = objects[i];

            // 이 객체를 작업 대상으로 지정한 크립의 수를 구한다.
            var workers = this.getWorkerCreeps(object);

            // 작업 크립의 수보다 작을 경우, 작업 대상으로 선택한다.
            if (workers < Settings.CreepsPerObject) {
                creep.memory.target = object.id;
                return true;
            }
        }

        // 조건에 부합되는 대상을 찾지 못한 경우 false를 반환한다.
        return false;
    },
};