<template>
  <div class="form-control form-control-sm rounded-0 rounded-end wf">
    <input
      type="file"
      accept=".json"
      :id="`importFile${lobby}`"
      class="form-file-input d-none"
      ref="inp"
      @change="onChange"
    />
    <label :for="`importFile${lobby}`" class="w-100">
      <span>Import</span>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useStore } from '@/store';
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
              store.commit(MutationTypes.SET_BALANCER_OPTIONS, data.balancerOptions);
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

    return { inp, onChange };
  },
});
</script>

<style lang="scss" scoped>
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';

.wf {
  width: 4rem;
}

.form-control {
  background-color: $gray-200;
}
</style>