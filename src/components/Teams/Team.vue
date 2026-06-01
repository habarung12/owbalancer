<template>
  <div class="team-card">
    <div class="team-header">
      <div class="team-title">
        <button class="remove-btn" @click="removeTeam" title="Remove">×</button>
        <span class="team-number">#{{ teamId }}</span>
        <input type="text" class="team-name" :value="mTeam.name" @input="updateTeam" />
      </div>
      <div class="team-average">
        {{ teamAverage }}
        <small>AVG SR</small>
      </div>
    </div>

    <div class="team-body">
      <div class="role-group">
        <div class="role-section-label tank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/></svg>
          Tank
        </div>
        <ul class="list-group list-group-flush">
          <team-roles :members="tanks" rtype="tank" :teamUuid="teamUuid" />
        </ul>
      </div>

      <div class="role-group">
        <div class="role-section-label dps">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg>
          Damage
        </div>
        <ul class="list-group list-group-flush">
          <team-roles :members="dps" rtype="dps" :teamUuid="teamUuid" />
        </ul>
      </div>

      <div class="role-group">
        <div class="role-section-label support">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Support
        </div>
        <ul class="list-group list-group-flush">
          <team-roles :members="supports" rtype="support" :teamUuid="teamUuid" />
        </ul>
      </div>
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
  props: { teamId: Number, team: Object as PropType<Team> },
  components: { TeamRoles },

  setup(props) {
    const store = useStore();
    const teamUuid = computed(() => props.team?.uuid);

    const teamAverage = computed(() => {
      if (!props.team || props.team.members.length === 0) return 0;
      if (!store.state.showBalancerSR) {
        return Math.round(
          props.team.members.reduce(
            (acc, member) => acc + store.state.players[member.uuid].stats.classes[member.role].rank,
            0
          ) / props.team.members.length
        );
      }
      return Math.round(props.team.avgSr || 0);
    });

    const cTeam = computed(() => store.state.teams.find(t => t.uuid === teamUuid.value));
    const mTeam = ref(cTeam);

    const tanks    = computed(() => mTeam.value?.members.filter(m => m.role === 'tank'));
    const dps      = computed(() => mTeam.value?.members.filter(m => m.role === 'dps'));
    const supports = computed(() => mTeam.value?.members.filter(m => m.role === 'support'));

    const updateTeam = debounce((e: Event) => {
      const teamName = (e.target as HTMLInputElement).value;
      if (cTeam.value && teamName) {
        store.commit(MutationTypes.UPDATE_TEAM_NAME, { teamUuid: cTeam.value.uuid, teamName });
      }
    }, 1000);

    const removeTeam = () => {
      if (!cTeam.value) return;
      store.commit(MutationTypes.REMOVE_TEAM, cTeam.value.uuid);
    };

    return { tanks, dps, supports, teamUuid, mTeam, teamAverage, updateTeam, removeTeam };
  },
});
</script>

<style lang="scss" scoped>
.team-card {
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: .18s;
}
.team-card:hover { border-color: var(--border-strong); }

.team-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}

.team-title {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  flex: 1;
}

.remove-btn {
  border: none;
  background: transparent;
  color: rgba(255,255,255,.2);
  font-size: 1rem;
  line-height: 1;
  padding: 0 2px;
  cursor: pointer;
  transition: .15s;
  flex-shrink: 0;
}
.remove-btn:hover { color: var(--danger); }

.team-number {
  font-family: var(--mono);
  font-size: .78rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 3px 8px;
  border-radius: 7px;
  white-space: nowrap;
  flex-shrink: 0;
}

.team-name {
  border: none;
  background: transparent;
  width: 100%;
  min-width: 0;
  padding: 0;
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -.02em;
  font-family: var(--font);
  outline: none;
}
.team-name:focus { color: var(--accent); }

.team-average {
  font-family: var(--mono);
  font-size: .92rem;
  font-weight: 600;
  flex-shrink: 0;
  background: var(--surface-3);
  padding: 5px 11px;
  border-radius: 9px;
  border: 1px solid var(--border);
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;

  small {
    font-size: .6rem;
    color: var(--text-dim);
    display: block;
    text-align: center;
    letter-spacing: .04em;
    font-family: var(--font);
    font-weight: 500;
  }
}

.team-body { padding: 8px; }

.role-group { margin: 4px 0; }

.role-section-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: .68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-dim);
  padding: 6px 8px 4px;

  svg { width: 13px; height: 13px; }
}
.role-section-label.tank    { color: var(--tank); }
.role-section-label.dps     { color: var(--dps); }
.role-section-label.support { color: var(--support); }

/* player cards inside team — transparent */
:deep(.player-card-item) {
  background: transparent !important;
  border-color: transparent !important;
}
:deep(.player-card-item:hover) {
  background: var(--surface-2) !important;
  border-color: var(--border) !important;
  transform: none !important;
}

:deep(.list-group-item) {
  background: transparent !important;
  border-color: var(--border) !important;
  padding: 0 !important;
}
</style>
