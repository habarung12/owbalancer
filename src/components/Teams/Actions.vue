<template>
  <div class="team-actions">
    <button class="action-btn neutral" @click="addNew">New</button>

    <button class="action-btn primary" @click="balance">
      Balance
    </button>

    <button class="action-btn danger" @click="clear">
      Clear
    </button>

    <button
      class="action-btn warning"
      v-if="canChange"
      @click="select"
    >
      Choose balance
    </button>

    <button
      class="action-btn icon warning-outline"
      v-if="canChange"
      @click="clearSelect"
    >
      <bin-icon />
    </button>

    <button class="action-btn neutral" @click="empty">
      Empty
    </button>

    <export-teams />

    <button class="action-btn icon primary" @click="archive">
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
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  min-height: 32px;
  padding: 6px 12px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  transition: 0.15s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.action-btn.icon {
  width: 34px;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.primary {
  background: #2563eb;
  color: white;
}

.neutral {
  background: #6b7280;
  color: white;
}

.danger {
  background: #dc3545;
  color: white;
}

.warning {
  background: #facc15;
  color: #111827;
}

.warning-outline {
  background: #fff7cc;
  color: #111827;
  border: 1px solid #facc15;
}

:global(body.dark-mode) .neutral {
  background: #374151;
}

:global(body.dark-mode) .warning-outline {
  background: #3a3215;
  color: #fde68a;
  border-color: #facc15;
}
</style>
