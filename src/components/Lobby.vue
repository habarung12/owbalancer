<template>
  <div class="w-100 h-100 lobby-panel">
    <div class="panel-head">
      <h2>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        {{ t.lobby }}
      </h2>
      <span class="count-chip">{{ playerCount }}</span>
    </div>

    <add-player class="mb-3" @sort="onSort" />
    <player-list ref="playerListRef" />
    <delete-player class="mt-3" />
    <edit-player />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { t } from '@/i18n';
import { useStore } from '@/store';

import AddPlayer from '@/components/Lobby/AddPlayer.vue';
import PlayerList from '@/components/Lobby/PlayerList.vue';
import DeletePlayer from '@/components/Lobby/DeletePlayer.vue';
import EditPlayer from '@/components/Lobby/EditPlayer.vue';

export default defineComponent({
  name: 'Lobby',
  components: { AddPlayer, PlayerList, DeletePlayer, EditPlayer },
  setup() {
    const store = useStore();
    const playerCount = computed(() => Object.keys(store.state.players).length);
    const playerListRef = ref<any>(null);

    const onSort = (rule: string, order: 'asc' | 'desc') => {
      playerListRef.value?.sort(rule, order);
    };

    return { t, playerCount, playerListRef, onSort };
  },
});
</script>

<style scoped>
.lobby-panel { display: flex; flex-direction: column; }
.panel-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.panel-head h2 { font-size: 1.02rem !important; font-weight: 700 !important; letter-spacing: -.02em !important; display: flex !important; align-items: center !important; gap: 9px !important; color: var(--text) !important; margin: 0 !important; }
.panel-head h2 svg { stroke: var(--accent); flex-shrink: 0; }
.count-chip { font-family: var(--mono); font-size: .72rem; font-weight: 600; background: var(--surface-3); color: var(--text-muted); padding: 3px 9px; border-radius: 7px; border: 1px solid var(--border); }
</style>
