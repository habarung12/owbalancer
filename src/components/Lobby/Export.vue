<template>
  <div class="export-wrap">
    <button type="button" class="utility-btn export-main-btn" @click="toggleMenu">
      Export ▾
    </button>

    <div v-if="isOpen" class="export-menu">
      <button type="button" class="export-menu-item" @click="exportOld">
        Old JSON
      </button>

      <button type="button" class="export-menu-item new-item" @click="exportNew">
        New JSON
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useStore } from '@/store';
import { LobbyType, Players } from '@/objects/player';
import Utils from '@/utils';

type ExportData = {
  format: string;
  players: Players;
};

export default defineComponent({
  name: 'Export',

  props: {
    lobby: {
      type: String as PropType<LobbyType>,
      default: 'players',
    },
  },

  setup(props) {
    const store = useStore();
    const players = computed(() => store.state[props.lobby]);
    const isOpen = ref(false);

    const closeMenu = () => {
      isOpen.value = false;
    };

    const toggleMenu = () => {
      isOpen.value = !isOpen.value;
    };

    const getOldPlayers = (source: Players): Players => {
      const result: Players = {};

      Object.entries(source).forEach(([id, player]) => {
        result[id] = {
          ...player,
          stats: {
            ...player.stats,
            classes: {
              dps: {
                rank: player.stats.classes.dps.rank,
                playHours: player.stats.classes.dps.playHours,
                priority: player.stats.classes.dps.priority,
                primary: player.stats.classes.dps.primary,
                isActive: player.stats.classes.dps.isActive,
                secondary: player.stats.classes.dps.secondary,
              },
              tank: {
                rank: player.stats.classes.tank.rank,
                playHours: player.stats.classes.tank.playHours,
                priority: player.stats.classes.tank.priority,
                primary: player.stats.classes.tank.primary,
                isActive: player.stats.classes.tank.isActive,
                secondary: player.stats.classes.tank.secondary,
              },
              support: {
                rank: player.stats.classes.support.rank,
                playHours: player.stats.classes.support.playHours,
                priority: player.stats.classes.support.priority,
                primary: player.stats.classes.support.primary,
                isActive: player.stats.classes.support.isActive,
                secondary: player.stats.classes.support.secondary,
              },
            },
          },
        };
      });

      return result;
    };

    const exportOld = () => {
      const exportData: ExportData = {
        format: 'xv-1',
        players: getOldPlayers(players.value),
      };

      Utils.download(
        `${props.lobby}-old-${new Date().toLocaleString('ru-RU')}.json`,
        JSON.stringify(exportData, null, 2)
      );

      closeMenu();
    };

    const exportNew = () => {
      const exportData: ExportData = {
        format: 'xv-2',
        players: players.value,
      };

      Utils.download(
        `${props.lobby}-new-${new Date().toLocaleString('ru-RU')}.json`,
        JSON.stringify(exportData, null, 2)
      );

      closeMenu();
    };

    return {
      isOpen,
      toggleMenu,
      exportOld,
      exportNew,
    };
  },
});
</script>

<style scoped>
.export-wrap {
  position: relative;
  display: inline-flex;
}

.utility-btn {
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: #6b7280;
  color: white;
  font-size: 13px;
  font-weight: 700;
  transition: 0.15s ease;
}

.utility-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.export-main-btn {
  min-width: 78px;
}

.export-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 50;
  min-width: 130px;
  padding: 6px;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
}

.export-menu-item {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #111827;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.export-menu-item:hover {
  background: #f3f4f6;
}

.new-item {
  color: #2563eb;
}

:global(body.dark-mode) .utility-btn {
  background: #374151;
}

:global(body.dark-mode) .export-menu {
  background: #242424;
  border-color: #3a3a3a;
}

:global(body.dark-mode) .export-menu-item {
  color: #f8fafc;
}

:global(body.dark-mode) .export-menu-item:hover {
  background: #333333;
}

:global(body.dark-mode) .new-item {
  color: #60a5fa;
}
</style>