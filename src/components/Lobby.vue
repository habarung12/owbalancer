<template>
  <div class="w-100 h-100 lobby-panel">
    <h3 class="mb-2">{{ t.lobby }}</h3>

    <add-player class="mb-2" />

    <player-list />

    <delete-player class="mt-2" />
    <edit-player />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { t } from '@/i18n';

import AddPlayer from '@/components/Lobby/AddPlayer.vue';
import PlayerList from '@/components/Lobby/PlayerList.vue';
import DeletePlayer from '@/components/Lobby/DeletePlayer.vue';
import EditPlayer from '@/components/Lobby/EditPlayer.vue';

export default defineComponent({
  name: 'Lobby',
  components: {
    AddPlayer,
    PlayerList,
    DeletePlayer,
    EditPlayer,
  },
  setup() {
    return { t };
  },
});
</script>

<style scoped>
.lobby-panel {
  display: flex;
  flex-direction: column;
}

:global(.lobby-panel .row),
:global(.lobby-panel .g-1),
:global(.lobby-panel .g-2),
:global(.lobby-panel .g-3) {
  --bs-gutter-x: 0.35rem !important;
  --bs-gutter-y: 0.35rem !important;
}
</style>