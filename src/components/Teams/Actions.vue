<template>
  <div class="team-actions">
    <button class="action-btn neutral" @click="addNew">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      {{ t.new }}
    </button>
    <button class="action-btn primary" @click="balance">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      {{ t.balance }}
    </button>
    <button class="action-btn danger" @click="clear">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
      {{ t.clear }}
    </button>
    <button class="action-btn warning" v-if="canChange" @click="select">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
      {{ t.chooseBalance }}
    </button>
    <button class="action-btn warning-outline icon" v-if="canChange" @click="clearSelect">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
    </button>
    <button class="action-btn neutral" @click="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M2 12h20"/></svg>
      {{ t.empty }}
    </button>
    <import-teams />
    <export-teams />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';

import TObj from '@/objects/team';

import ExportTeams from '@/components/Teams/ExportTeams.vue';
import ImportTeams from '@/components/Teams/ImportTeams.vue';
import { t } from '@/i18n';

export default defineComponent({
  name: 'Actions',
  components: { ExportTeams, ImportTeams },
  setup() {
    const store = useStore();

    const canChange = computed(() => store.state.balancerResults.length > 1);

    const balance = () => {
      store.commit(MutationTypes.TOGGLE_BALANCE, undefined);
    };

    const clear = () => {
      store.commit(MutationTypes.CLEAR_TEAMS, undefined);
    };

    const addNew = () => {
      const newTeam = TObj.createEmptyTeam();

      if (store.state.teams.length <= 0) {
        const playerIds = Object.keys(store.state.players);
        store.commit(MutationTypes.RESERVE_PLAYERS, playerIds);
      }

      store.commit(MutationTypes.ADD_TEAM, newTeam);
    };

    const empty = () => {
      store.commit(MutationTypes.EMPTY_TEAMS, undefined);
    };

    const select = () => {
      store.commit(MutationTypes.TOGGLE_SELECTION, undefined);
    };

    const clearSelect = () => {
      store.commit(MutationTypes.CLEAR_TEAMS, undefined);
      store.commit(MutationTypes.SET_RESULTS, []);
    };

    return {
      empty,
      clear,
      select,
      addNew,
      balance,
      canChange,
      clearSelect,
      t,
    };
  },
});
</script>

<style scoped>
.team-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 15px;
  border-radius: 10px;
  font-size: .84rem;
  font-weight: 600;
  font-family: var(--font);
  line-height: 1;
  cursor: pointer;
  transition: all .15s ease;
  white-space: nowrap;
  svg { width: 15px; height: 15px; flex-shrink: 0; }
}
.action-btn:hover { transform: translateY(-1px); }
.action-btn.icon { width: 38px; padding: 0; justify-content: center; flex-shrink: 0; }

.primary {
  background: var(--accent);
  border: 1px solid transparent;
  color: #ffffff;
  &:hover { background: var(--accent-hover); }
  svg, path { stroke: #ffffff !important; }
}
.neutral {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  &:hover { border-color: var(--border-strong); color: var(--text); }
}
.danger {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  &:hover { background: var(--danger-soft); border-color: var(--danger); color: var(--danger); }
}
.warning {
  background: var(--accent-soft);
  border: 1px solid rgba(35,128,177,.3);
  color: var(--accent);
  &:hover { background: rgba(35,128,177,.2); }
}
.warning-outline {
  background: var(--surface-2);
  border: 1px solid rgba(35,128,177,.25);
  color: var(--accent);
  &:hover { background: var(--accent-soft); }
}
</style>
