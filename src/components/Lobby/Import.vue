<template>
  <label class="import-button">
    {{ t.import }}

    <input
      type="file"
      accept=".json"
      class="d-none"
      ref="inp"
      @change="onChange"
    />
  </label>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useStore } from '@/store';
import { t } from '@/i18n';

import MutationTypes from '@/store/mutation-types';
import { ClassType, LobbyType, Players } from '@/objects/player';

type ImportData = {
  format?: string;
  players?: Players;
  teams?: unknown[];
  reservedPlayers?: string[];
  balancerOptions?: unknown;
  format_version?: number;
  format_type?: string;
};

const normalizeClass = (classData: Partial<ClassType>): ClassType => {
  const rank = classData.rank || 0;

  return {
    rank,
    registrationRank: classData.registrationRank ?? rank,
    highestSeenRank: classData.highestSeenRank ?? rank,
    manualRank: classData.manualRank ?? 0,
    needsCheck: classData.needsCheck ?? false,
    rankNote: classData.rankNote ?? '',

    playHours: classData.playHours ?? 0,
    priority: classData.priority ?? 0,
    primary: classData.primary ?? false,
    isActive: classData.isActive ?? false,
    secondary: classData.secondary ?? false,
  };
};

const normalizePlayers = (players: Players): Players => {
  const result: Players = {};

  Object.entries(players).forEach(([id, player]) => {
    result[id] = {
      ...player,
      stats: {
        ...player.stats,
        classes: {
          dps: normalizeClass(player.stats.classes.dps),
          tank: normalizeClass(player.stats.classes.tank),
          support: normalizeClass(player.stats.classes.support),
        },
      },
    };
  });

  return result;
};

export default defineComponent({
  name: 'Import',

  props: {
    lobby: {
      type: String as PropType<LobbyType>,
      default: 'players',
    },
  },

  setup(props) {
    const store = useStore();
    const inp = ref<HTMLInputElement | null>(null);

    const clearInput = () => {
      if (inp.value) {
        inp.value.value = '';
      }
    };

    const onReaderLoad = (event: ProgressEvent<FileReader>) => {
      if (!event.target) return;

      const source = event.target.result as string;

      try {
        const data = JSON.parse(source) as ImportData;
        clearInput();

        if (data.format === 'xv-1' || data.format === 'xv-2') {
          if (data.players) {
            store.commit(MutationTypes.IMPORT_PLAYERS, {
              players: normalizePlayers(data.players),
              lobby: props.lobby,
            });
          }

          if (props.lobby === 'players') {
            if (Array.isArray(data.teams)) {
              store.commit(MutationTypes.ADD_TEAMS, data.teams);
            }

            if (Array.isArray(data.reservedPlayers)) {
              store.commit(MutationTypes.RESERVE_PLAYERS, data.reservedPlayers);
            }

            if (data.balancerOptions) {
              store.commit(
                MutationTypes.SET_BALANCER_OPTIONS,
                data.balancerOptions
              );
            }
          }

          return;
        }

        if (data.format_version === 9 && data.format_type === 'tournament') {
          store.commit(MutationTypes.IMPORT_PLAYERS_OLD, source);
          return;
        }

        throw new Error('Incorrect players export format');
      } catch (e) {
        alert(`Format error: ${(e as Error).message}`);
      }
    };

    const onChange = (event: Event) => {
      const reader = new FileReader();
      const { files } = event.target as HTMLInputElement;

      if (files !== null && files.length) {
        reader.onload = onReaderLoad;
        reader.readAsText(files[0]);
      }
    };

    return {
      inp,
      onChange,
      t,
    };
  },
});
</script>

<style scoped>
.import-button {
  height: 32px;
  padding: 0 12px;
  margin: 0;
  border-radius: 10px;
  background: #6b7280;
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.15s ease;
}

.import-button:hover {
  filter: brightness(1.05);
}

:global(body.dark-mode) .import-button {
  background: #374151;
}
</style>