<template>
  <div class="team-actions">
    <button class="action-btn neutral" @click="addNew">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      New
    </button>

    <button class="action-btn primary" @click="balance">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      Balance
    </button>

    <button class="action-btn danger" @click="clear">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
      Clear
    </button>

    <button class="action-btn warning" v-if="canChange" @click="select">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
      Choose
    </button>

    <button class="action-btn warning-outline icon" v-if="canChange" @click="clearSelect">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
    </button>

    <button class="action-btn neutral" @click="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M2 12h20"/></svg>
      Empty
    </button>

    <export-teams />

    <button class="action-btn neutral icon" @click="archive">
      <archive-icon />
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';

import TObj from '@/objects/team';

import BinIcon from '@/components/svg/BinIcon.vue';
import ArchiveIcon from '@/components/svg/ArchiveIcon.vue';
import ExportTeams from '@/components/Teams/ExportTeams.vue';

export default defineComponent({
  name: 'Actions',
  components: { BinIcon, ExportTeams, ArchiveIcon },
  setup() {
    const store = useStore();

    const canChange = computed(() => store.state.balancerResults.length > 1);

    const balance = () => {
      store.commit(MutationTypes.TOGGLE_BALANCE, undefined);
    };

    const archive = () => {
      store.commit(MutationTypes.TOGGLE_ARCHIVE, undefined);
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
      archive,
      balance,
      canChange,
      clearSelect,
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
  gap: 5px;
  height: 34px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.icon {
  width: 34px;
  padding: 0;
  justify-content: center;
  flex-shrink: 0;
}

.btn-icon {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}

.btn-svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.primary {
  background: #f59e0b;
  border-color: #f59e0b;
  color: #111;
}
.primary:hover { background: #fbbf24; border-color: #fbbf24; }

.neutral {
  background: #18181f;
  border-color: rgba(255,255,255,0.1);
  color: #94a3b8;
}
.neutral:hover {
  background: #22222c;
  border-color: rgba(255,255,255,0.18);
  color: #e2e8f0;
}

.danger {
  background: #18181f;
  border-color: rgba(255,255,255,0.1);
  color: #94a3b8;
}
.danger:hover {
  background: rgba(239,68,68,0.12);
  border-color: rgba(239,68,68,0.3);
  color: #f87171;
}

.warning {
  background: rgba(245,158,11,0.15);
  border-color: rgba(245,158,11,0.3);
  color: #f59e0b;
}
.warning:hover { background: rgba(245,158,11,0.22); }

.warning-outline {
  background: #18181f;
  border-color: rgba(245,158,11,0.25);
  color: #f59e0b;
}
.warning-outline:hover { background: rgba(245,158,11,0.12); }
</style>
