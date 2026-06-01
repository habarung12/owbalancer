<template>
  <div @dragover="allowDrop" @drop="drop" class="delete-player">
    <div class="delete-icon">🗑️</div>
    <div class="delete-title">Удалить игрока</div>
    <div class="delete-hint">Перетащи игрока сюда</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';
import { LobbyType } from '@/objects/player';

export default defineComponent({
  name: 'DeletePlayer',
  props: {
    lobby: {
      type: String as PropType<LobbyType>,
      default: 'players'
    }
  },
  setup(props) {
    const store = useStore();

    const allowDrop = (ev: DragEvent) => {
      ev.preventDefault();
    };

    const drop = (ev: DragEvent) => {
      ev.preventDefault();
      const playerId = ev?.dataTransfer?.getData('playerTag');
      const teamUuid = ev?.dataTransfer?.getData('team');

      if (playerId === undefined) return;

      store.commit(MutationTypes.DELETE_PLAYER, { playerId, lobby: props.lobby });

      if (teamUuid) {
        store.commit(MutationTypes.REMOVE_FROM_TEAM, {
          teamUuid,
          playerId,
        });
      }
    };

    return {
      drop,
      allowDrop,
    };
  },
});
</script>

<style lang="scss" scoped>
.delete-player {
  height: 5rem;
  border: 2px dashed rgba(239,68,68,0.3);
  border-radius: 12px;
  background: rgba(239,68,68,0.05);
  color: #f87171;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: 0.15s ease;
  cursor: pointer;
}
.delete-player:hover {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.5);
  transform: translateY(-1px);
}
.delete-icon { font-size: 1.2rem; line-height: 1; }
.delete-title { font-weight: 700; text-transform: uppercase; font-size: 0.85rem; }
.delete-hint { font-size: 0.75rem; opacity: 0.7; }
</style>
