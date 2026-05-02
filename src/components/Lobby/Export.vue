<template>
  <button @click="onClick" class="utility-btn">
    Export
  </button>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
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
    }
  },
  setup(props) {
    const store = useStore();
    const players = computed(() => store.state[props.lobby]);

    const onClick = () => {
      const exportData: ExportData = {
        format: 'xv-1',
        players: players.value,
      };

      Utils.download(
        `${props.lobby}-${new Date().toLocaleString('ru-RU')}.json`,
        JSON.stringify(exportData)
      );
    };

    return { onClick };
  },
});
</script>

<style scoped>
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

:global(body.dark-mode) .utility-btn {
  background: #374151;
}
</style>