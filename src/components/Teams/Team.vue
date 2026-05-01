<template>
  <div class="team-card">
    <div class="team-header">
      <div class="team-title">
        <button class="remove-btn" @click="removeTeam" title="Удалить команду">×</button>
        <span class="team-number">#{{ teamId }}</span>
       <input
  type="text"
  class="team-name"
  :value="mTeam.name"
  @input="updateTeam"
/>
      </div>

      <span class="team-average">{{ teamAverage }}</span>
    </div>

    <div class="team-body">
      <ul class="list-group list-group-flush">
        <team-roles :members="tanks" rtype="tank" :teamUuid="teamUuid" />
        <team-roles :members="dps" rtype="dps" :teamUuid="teamUuid" />
        <team-roles :members="supports" rtype="support" :teamUuid="teamUuid" />
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { Team } from '@/objects/team';
import { useStore } from '@/store';
import debounce from 'lodash/debounce';

import TeamRoles from '@/components/Teams/TeamRoles.vue';
import MutationTypes from '@/store/mutation-types';

export default defineComponent({
  name: 'Team',
  props: {
    teamId: Number,
    team: Object as PropType<Team>,
  },
  components: { TeamRoles },

  setup(props) {
    const store = useStore();
    const players = computed(() => store.state.players);
    const teamUuid = computed(() => props.team?.uuid);

    const teamAverage = computed(() => {
      if (!props.team || props.team.members.length === 0) return 0;

      if (!store.state.showBalancerSR) {
        return Math.round(
          props.team.members.reduce(
            (acc, member) =>
              acc + store.state.players[member.uuid].stats.classes[member.role].rank,
            0
          ) / props.team.members.length
        );
      }

      return Math.round(props.team.avgSr || 0);
    });

    const cTeam = computed(() =>
      store.state.teams.find(team => team.uuid === teamUuid.value)
    );

    const mTeam = ref(cTeam);

    const tanks = computed(() =>
      mTeam.value?.members.filter(member => member.role === 'tank')
    );

    const dps = computed(() =>
      mTeam.value?.members.filter(member => member.role === 'dps')
    );

    const supports = computed(() =>
      mTeam.value?.members.filter(member => member.role === 'support')
    );

    const updateTeam = debounce((e: Event) => {
      const teamName = (e.target as HTMLInputElement).value;

      if (cTeam.value && teamName) {
        store.commit(MutationTypes.UPDATE_TEAM_NAME, {
          teamUuid: cTeam.value.uuid,
          teamName,
        });
      }
    }, 1000);

    const removeTeam = () => {
      if (!cTeam.value) return;
      store.commit(MutationTypes.REMOVE_TEAM, cTeam.value.uuid);
    };

    return {
      tanks,
      dps,
      supports,
      players,
      teamUuid,
      mTeam,
      teamAverage,
      updateTeam,
      removeTeam,
    };
  },
});
</script>

<style lang="scss" scoped>
.team-card {
  width: 320px;
  max-height: 300px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  transition: 0.15s ease;
}

.team-card:hover {
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.09);
  transform: translateY(-1px);
}

.team-header {
  min-height: 36px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-title {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  padding: 0 0.45rem;
}

.remove-btn {
  border: none;
  background: transparent;
  color: #adb5bd;
  font-size: 1rem;
  line-height: 1;
  padding: 0 0.25rem;
  cursor: pointer;
}

.remove-btn:hover {
  color: #dc3545;
}

.team-number {
  font-weight: 700;
  margin: 0 0.35rem;
  color: #212529;
  white-space: nowrap;
}

.team-name {
  border: none;
  background: transparent;
  width: 100%;
  min-width: 0;
  padding: 0;
  color: #343a40;
}

.team-name:focus {
  outline: none;
  box-shadow: none;
}

.team-average {
  align-self: stretch;
  min-width: 60px;
  background: #6c757d;
  color: #ffffff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-body {
  font-size: 0.9rem;
}

.team-body :deep(.list-group-item) {
  border-color: #edf0f2;
}

/* DARK MODE */
:global(body.dark-mode) .team-card {
  background: #1e1e1e !important;
  border-color: #333 !important;
}

:global(body.dark-mode) .team-header {
  background: #242424 !important;
  border-bottom-color: #333 !important;
}

:global(body.dark-mode) .team-number {
  color: #94a3b8 !important;
}

:global(body.dark-mode) .team-name {
  background: transparent !important;
  color: #f8fafc !important;
  border: none !important;
  box-shadow: none !important;
}

:global(body.dark-mode) .team-name:focus {
  outline: none !important;
  box-shadow: none !important;
}

:global(body.dark-mode) .team-title {
  background: transparent !important;
}

:global(body.dark-mode) .team-average {
  background: #475569 !important;
}

:global(body.dark-mode) .team-body :deep(.list-group-item) {
  background: #1e1e1e !important;
  border-color: #333 !important;
}
</style>