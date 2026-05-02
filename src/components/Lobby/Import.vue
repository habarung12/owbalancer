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
import { LobbyType } from '@/objects/player';

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
        const data = JSON.parse(source);
        clearInput();

        if (data.format === 'xv-1') {
          if (data.players) {
            store.commit(MutationTypes.IMPORT_PLAYERS, {
              players: data.players,
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