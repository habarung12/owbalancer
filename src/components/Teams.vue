<template>
  <h3>Teams</h3>
  <div class="d-flex justify-content-between align-items-top">
    <actions />
    <mode-toggler />
  </div>
  <stats v-if="teams.length > 0" />
  <div class="teams overflow-auto mh-80vh">
    <team v-for="(team, i) in teams" :key="team.uuid" :team="team" :team-id="i + 1" />
  </div>
  <balance />
  <archive />
  <result-selection />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from '@/store';

import Archive from '@/components/Archive.vue';
import Balance from '@/components/Balance.vue';
import Team from '@/components/Teams/Team.vue';
import Stats from '@/components/Teams/Stats.vue';
import Actions from '@/components/Teams/Actions.vue';
import ModeToggler from '@/components/Teams/ModeToggler.vue';
import ResultSelection from '@/components/Teams/ResultSelection.vue';

export default defineComponent({
  name: 'Teams',
  components: { Archive, Team, Balance, Stats, Actions, ModeToggler, ResultSelection },
  setup() {
    const store = useStore();
    const storeTeams = computed(() => store.state.teams);

    return { teams: storeTeams };
  },
});
</script>

<style lang="scss" scoped>
.teams {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 320px));
  gap: 1rem;
  margin-top: 2rem;
  align-items: start;
}

.wf {
  width: 6rem;
}

.mh-80vh {
  max-height: 80vh;
}
</style>