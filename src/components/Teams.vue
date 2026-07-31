<template>
  <div class="toolbar">
    <actions />
  </div>

  <stats v-if="teams.length > 0" />

  <div class="teams-grid overflow-auto">
    <team v-for="(team, i) in teams" :key="team.uuid" :team="team" :team-id="i + 1" @view="uuid => viewingTeamUuid = uuid" />
  </div>

  <balance />
  <result-selection />
  <team-view :team="viewingTeam" @close="viewingTeamUuid = ''" />
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
import TeamView from '@/components/Teams/TeamView.vue';

export default defineComponent({
  name: 'Teams',
  components: { Team, Balance, Stats, Actions, ResultSelection, TeamView },
  setup() {
    const store = useStore();
    const storeTeams = computed(() => store.state.teams);
    const viewingTeamUuid = ref('');
    const viewingTeam = computed(() => storeTeams.value.find(team => team.uuid === viewingTeamUuid.value) || null);
    return { teams: storeTeams, viewingTeamUuid, viewingTeam, t };
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
