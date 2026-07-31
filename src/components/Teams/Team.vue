<template>
  <div class="team-card">
    <div class="team-header">
      <div class="team-title">
        <button class="remove-btn" @click="removeTeam" title="Remove">×</button>
        <span class="team-number">#{{ teamId }}</span>
        <input type="text" class="team-name" :value="mTeam.name" @input="updateTeam" />
      </div>
      <button class="view-btn" :title="t.viewTeam" @click="$emit('view', teamUuid)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <div class="team-average">
        {{ teamAverage }}
        <small>AVG SR</small>
      </div>
    </div>

    <div class="team-body">
      <div class="role-group">
        <div class="role-section-label tank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/></svg>
          {{ t.teamTank }}
        </div>
        <ul class="role-slots">
          <team-roles :members="tanks" rtype="tank" :teamUuid="teamUuid" />
        </ul>
      </div>

      <div class="role-group">
        <div class="role-section-label dps">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg>
          {{ t.teamDamage }}
        </div>
        <ul class="role-slots">
          <team-roles :members="dps" rtype="dps" :teamUuid="teamUuid" />
        </ul>
      </div>

      <div class="role-group">
        <div class="role-section-label support">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          {{ t.teamSupport }}
        </div>
        <ul class="role-slots">
          <team-roles :members="supports" rtype="support" :teamUuid="teamUuid" />
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { Team } from '@/objects/team';
import { t } from '@/i18n';
import { useStore } from '@/store';
import debounce from 'lodash/debounce';

import TeamRoles from '@/components/Teams/TeamRoles.vue';
import MutationTypes from '@/store/mutation-types';

export default defineComponent({
  name: 'Team',
  props: { teamId: Number, team: Object as PropType<Team> },
  components: { TeamRoles },
  emits: ['view'],

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

    return { tanks, dps, supports, teamUuid, mTeam, teamAverage, updateTeam, removeTeam, t };
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
  gap: 14px;
  padding: 12px 14px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
}

.team-title {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
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

.view-btn {
  border: 1px solid var(--border);
  background: var(--surface-3);
  color: var(--text-muted);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  flex-shrink: 0;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: .15s;
  svg { width: 14px; height: 14px; }
}
.view-btn:hover { border-color: var(--border-strong); color: var(--accent); background: var(--accent-soft); }

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
  padding: 6px 10px;
  border-radius: 8px;
  color: var(--text);
  font-size: .95rem;
  font-weight: 700;
  letter-spacing: -.02em;
  font-family: var(--font);
  outline: none;
  transition: background .14s;
}
.team-name:focus {
  color: var(--accent);
  background: var(--accent-soft);
}

.team-average {
  font-family: var(--mono);
  font-size: .95rem;
  font-weight: 700;
  flex-shrink: 0;
  background: var(--surface-3);
  padding: 7px 14px;
  border-radius: 9px;
  border: 1px solid var(--border);
  color: var(--text);
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
  white-space: nowrap;

  small {
    font-size: .58rem;
    color: var(--text-dim);
    display: block;
    text-align: center;
    letter-spacing: .05em;
    font-family: var(--font);
    font-weight: 600;
    text-transform: uppercase;
  }
}

.team-body { padding: 8px 8px 12px; }

.role-group { margin: 2px 0; }

.role-slots {
  list-style: none;
  padding: 0 4px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

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

</style>
