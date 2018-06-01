var coreSettings = require('core.settings');
var coreUtils = {
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
     * 크립의 위치에서 지정된 객체들의 위치를 가까운 순으로 정렬한 목록을 가져옵니다.
     * @param creep 크립
     * @param objectType 형식
     **/
    getObjectsSorted: function(creep, objectType) {
        var objects = creep.room.find(objectType);
        objects.sort(function(a, b) {
            var dx = Math.abs(creep.pos.x - a.pos.x);
            var dy = Math.abs(creep.pos.y - a.pos.y);
            var dA = Math.sqrt(dx + dy);

            dx = Math.abs(creep.pos.x - b.pos.x);
            dy = Math.abs(creep.pos.y - b.pos.y);
            var dB = Math.sqrt(dx + dy);

            return dA > dB;
        });
        return objects;
    },

    /**
     * 크립이 가장 가까운 소스를 채집하도록 명령합니다.
     * @param creep 채집 명령을 수행할 크립
     * @returns 채집 대상이 설정된 경우 true, 그 외의 경우 false
     **/
    harvestClosestSource: function(creep) {
        // 이미 크립에 대상이 할당된 경우 수행하지 않는다.
        if (creep.memory.harvesting) return true;

        // 가까운 소스 목록을 가져온다.
        var sources = this.getObjectsSorted(creep, FIND_SOURCES_ACTIVE);

        // 소스 목록을 순회한다.
        for (var i in sources) {
            // 소스를 가져온다.
            var source = sources[i];

            // 몇 개의 크립이 이 소스를 채집하고 있는지 확인한다.
            var harvesters = this.getWorkerCreeps(source);
            
            // 해당 소스를 채집하고 있는 크립의 수가 CreepsPerSource보다 낮은 경우
            // 크립보고 이 소스를 채집하라고 한다.
            if (harvesters < coreSettings.CreepsPerSource) {
                creep.memory.targetId = source.id;
                creep.memory.harvesting = true;
                return true;
            }

            // CreepsPerSource보다 크거나 같은 경우 건너뛴다.
            else continue;
        }

        return false;
    },

    /**
     * 크립이 가장 가까운 공사 현장을 건설하도록 명령합니다.
     * @param creep 건설 명령을 수행할 크립
     * @returns 건설 대상이 설정된 경우 true, 그 외의 경우 false
     **/
    buildClosestConstructionSite: function(creep) {
        if (creep.memory.constructing) return true;
        var constructionSites = this.getObjectsSorted(creep, FIND_MY_CONSTRUCTION_SITES);
        for (var i in constructionSites) {
            var constructionSite = constructionSites[i];
            var workers = this.getWorkerCreeps(constructionSite);
            if (workers < coreSettings.CreepsPerConstructionSite) {
                creep.memory.targetId = constructionSite.id;
                creep.memory.constructing = true;
                return true;
            }
            else continue;
        }

        return false;
    },
}

module.exports = coreUtils;