<template>
  <div class="add-player-wrap">
    <input
      v-model.trim="playerTag"
      @keyup.enter="addPlayer"
      type="text"
      class="player-input"
      :placeholder="t.playerPlaceholder"
    />

    <button @click="addPlayer" class="add-btn">
      {{ t.addPlayer }}
    </button>

    <generate-randoms v-if="enableRandoms" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { t } from '@/i18n';

import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';
import PlayerEditor, { LobbyType } from '@/objects/player';

import GenerateRandoms from '@/components/Lobby/GenerateRandoms.vue';

export default defineComponent({
  name: 'AddPlayer',
  components: { GenerateRandoms },

  props: {
    enableRandoms: {
      type: Boolean,
      default: true,
    },
    lobby: {
      type: String as PropType<LobbyType>,
      default: 'players',
    },
  },

  setup(props) {
    const store = useStore();
    const playerTag = ref('');

    function addPlayer() {
      const player = PlayerEditor.createDefaultPlayer(playerTag.value);

      store.commit(MutationTypes.ADD_PLAYER, {
        player,
        lobby: props.lobby,
      });

      store.commit(MutationTypes.EDIT_PLAYER, {
        playerId: player.identity.uuid,
        lobby: props.lobby,
      });

      playerTag.value = '';
    }

    return {
      addPlayer,
      playerTag,
      t,
    };
  },
});
</script>

<style scoped>
.add-player-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  width: 100%;
}

.player-input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: 0.15s ease;
}

.player-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,.15);
}

.add-btn {
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: #ef4444;
  color: white;
  font-weight: 700;
  white-space: nowrap;
  transition: 0.15s ease;
}

.add-btn:hover {
  filter: brightness(1.05);
}

:global(.add-player-wrap > *) {
  margin: 0 !important;
}

:global(body.dark-mode) .player-input {
  background: #1f2937;
  border-color: #374151;
  color: #f8fafc;
}

:global(body.dark-mode) .player-input::placeholder {
  color: #94a3b8;
}
</style>