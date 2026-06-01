<template>
  <div class="add-row">
    <input
      v-model.trim="playerTag"
      @keyup.enter="addPlayer"
      type="text"
      class="player-input"
      :placeholder="t.playerPlaceholder"
    />
    <button @click="addPlayer" class="add-btn">{{ t.addPlayer }}</button>
    <generate-randoms v-if="enableRandoms" class="gen-btn" />
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
    enableRandoms: { type: Boolean, default: true },
    lobby: { type: String as PropType<LobbyType>, default: 'players' },
  },
  setup(props) {
    const store = useStore();
    const playerTag = ref('');

    function addPlayer() {
      const player = PlayerEditor.createDefaultPlayer(playerTag.value);
      store.commit(MutationTypes.ADD_PLAYER, { player, lobby: props.lobby });
      store.commit(MutationTypes.EDIT_PLAYER, { playerId: player.identity.uuid, lobby: props.lobby });
      playerTag.value = '';
    }

    return { addPlayer, playerTag, t };
  },
});
</script>

<style scoped>
.add-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.player-input {
  flex: 1;
  min-width: 0;
  height: 42px;
  padding: 0 14px;
}
.add-btn {
  height: 42px;
  padding: 0 16px;
  flex-shrink: 0;
  white-space: nowrap;
  font-family: var(--font);
}
.gen-btn {
  flex-shrink: 0;
}
/* Override child generate-randoms button */
:global(.gen-btn button),
:global(.gen-btn .btn) {
  width: 42px !important;
  height: 42px !important;
  border-radius: 11px !important;
  background: #1c1f26 !important;
  border: 1px solid rgba(255,255,255,.07) !important;
  color: #a4a9b4 !important;
  display: grid !important;
  place-items: center !important;
  transition: .16s !important;
  padding: 0 !important;
}
:global(.gen-btn button:hover),
:global(.gen-btn .btn:hover) {
  border-color: rgba(255,255,255,.12) !important;
  color: #f99e1a !important;
  background: #16181d !important;
}
</style>
