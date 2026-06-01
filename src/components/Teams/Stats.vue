<template>
  <div class="stats-grid mt-3">
    <div class="stat-card">
      <div class="stat-label">Players</div>
      <div class="stat-value">{{ playerCount }}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Teams</div>
      <div class="stat-value">{{ teamCount }}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Avg SR</div>
      <div class="stat-value accent">{{ avgSr }}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Balance Δ</div>
      <div class="stat-value">{{ maxSr - minSr }}<span class="stat-suffix">sr</span></div>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from '@/store';
import { computed, defineComponent } from 'vue';

import { Team as TeamType } from '@/objects/team';
import PObj, { Players } from '@/objects/player';

export default defineComponent({
  name: 'Stats',
  setup() {
    const store = useStore();

    const calcTeamAvg = (team: TeamType, players: Players): number => {
      return !store.state.showBalancerSR
        ? team.members.reduce(
            (acc, member) => acc + players[member.uuid].stats.classes[member.role].rank,
            0
          ) / team.members.length
        : team.avgSr;
    };

    const maxSr = computed(() =>
      Math.floor(
        store.state.teams.reduce(
          (acc, team) =>
            acc < calcTeamAvg(team, store.state.players)
              ? calcTeamAvg(team, store.state.players)
              : acc,
          0
        )
      )
    );

    const minSr = computed(() =>
      Math.floor(
        store.state.teams.reduce(
          (acc, team) =>
            acc > calcTeamAvg(team, store.state.players)
              ? calcTeamAvg(team, store.state.players)
              : acc,
          10000
        )
      )
    );

    const avgSr = computed(() =>
      Math.floor(
        store.state.teams.reduce((acc, team) => acc + calcTeamAvg(team, store.state.players), 0) /
          store.state.teams.length
      )
    );

    const playerCount = computed(() => Object.keys(store.state.players).length);
    const teamCount = computed(() => store.state.teams.length);

    return { maxSr, minSr, avgSr, playerCount, teamCount };
  },
});
</script>
