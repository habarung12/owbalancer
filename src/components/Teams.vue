<template>
  <div class="toolbar">
    <actions />
    <span class="spacer"></span>
    <div class="mode-toggle">
      <button
        class="mode-toggle-btn"
        :class="{ active: activeMode === 'full' }"
        @click="activeMode = 'full'"
      >Full</button>
      <button
        class="mode-toggle-btn"
        :class="{ active: activeMode === 'half' }"
        @click="activeMode = 'half'"
      >Half</button>
      <button
        class="mode-toggle-btn"
        :class="{ active: activeMode === 'final' }"
        @click="activeMode = 'final'"
      >Final</button>
    </div>
  </div>

  <stats v-if="teams.length > 0" />

  <div class="teams-grid overflow-auto">
    <team v-for="(team, i) in teams" :key="team.uuid" :team="team" :team-id="i + 1" />
  </div>

  <balance />
  <result-selection />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useStore } from '@/store';
import { t } from '@/i18n';

import Balance from '@/components/Balance.vue';
import Team from '@/components/Teams/Team.vue';
import Stats from '@/components/Teams/Stats.vue';
import Actions from '@/components/Teams/Actions.vue';
import ResultSelection from '@/components/Teams/ResultSelection.vue';

export default defineComponent({
  name: 'Teams',
  components: { Team, Balance, Stats, Actions, ResultSelection },
  setup() {
    const store = useStore();
    const storeTeams = computed(() => store.state.teams);
    const activeMode = ref('full');
    return { teams: storeTeams, t, activeMode };
  },
});
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}
.spacer { flex: 1; }
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
  margin-top: 16px;
  align-items: start;
  max-height: 80vh;
  overflow-y: auto;
}
</style>
