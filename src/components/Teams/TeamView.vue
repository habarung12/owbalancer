<template>
  <teleport to="body">
    <transition name="tv-fade">
      <div v-if="team" class="tv-overlay" @click.self="close">
        <div class="tv-modal">

          <!-- HEADER -->
          <div class="tv-header">
            <div class="tv-header-left">
              <div class="tv-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <h2 class="tv-title">{{ team.name }}</h2>
                <p class="tv-subtitle">{{ team.members.length }} {{ t.statPlayers }}</p>
              </div>
            </div>
            <div class="tv-avg">
              {{ teamAverage }}
              <small>AVG SR</small>
            </div>
            <button class="tv-close" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- BODY -->
          <div class="tv-body">
            <div class="tv-role-group" v-for="group in roleGroups" :key="group.role">
              <div class="tv-role-label" :class="group.role">
                <role-icon :rtype="group.role" />
                {{ group.label }}
              </div>
              <div class="tv-role-members">
                <player-card
                  v-for="member in group.members"
                  :key="member.uuid"
                  :player="players[member.uuid]"
                  :prefferedRank="member.rank"
                  :rankRole="showBalancerSR ? undefined : member.role"
                  :teamUuid="team.uuid"
                />
                <div v-if="group.members.length === 0" class="tv-empty">{{ t.emptySlot }}</div>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="tv-footer">
            <button class="tv-btn-close" @click="close">{{ t.close }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { t } from '@/i18n';
import { useStore } from '@/store';
import { Team } from '@/objects/team';

import RoleIcon from '@/components/svg/RoleIcon.vue';
import PlayerCard from '@/components/PlayerCard.vue';

export default defineComponent({
  name: 'TeamView',
  components: { RoleIcon, PlayerCard },
  props: {
    team: Object as PropType<Team | null>,
  },
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore();
    const players = computed(() => store.state.players);
    const showBalancerSR = computed(() => store.state.showBalancerSR);

    const teamAverage = computed(() => {
      if (!props.team || props.team.members.length === 0) return 0;
      if (!store.state.showBalancerSR) {
        return Math.round(
          props.team.members.reduce(
            (acc, member) => acc + (players.value[member.uuid]?.stats.classes[member.role].rank || 0),
            0
          ) / props.team.members.length
        );
      }
      return Math.round(props.team.avgSr || 0);
    });

    const roleGroups = computed(() => {
      const roles: { role: 'tank' | 'dps' | 'support'; label: string }[] = [
        { role: 'tank', label: t.value.teamTank },
        { role: 'dps', label: t.value.teamDamage },
        { role: 'support', label: t.value.teamSupport },
      ];
      return roles.map(r => ({
        ...r,
        members: props.team?.members.filter(m => m.role === r.role) || [],
      }));
    });

    const close = () => emit('close');

    return { players, showBalancerSR, teamAverage, roleGroups, close, t };
  },
});
</script>

<style lang="scss" scoped>
.tv-overlay {
  position: fixed; inset: 0; z-index: 1055;
  background: rgba(0,0,0,.65); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.tv-fade-enter-active, .tv-fade-leave-active { transition: opacity .2s, transform .2s; }
.tv-fade-enter-from, .tv-fade-leave-to { opacity: 0; transform: scale(.97) translateY(8px); }

.tv-modal {
  background: var(--surface-1); border: 1px solid var(--border-strong); border-radius: 20px;
  width: 100%; max-width: 640px; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,.7); overflow: hidden;
}

.tv-header { display: flex; align-items: center; gap: 14px; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.tv-header-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
.tv-icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(145deg, var(--accent), #18638c);
  box-shadow: 0 4px 14px rgba(35,128,177,.3);
  display: grid; place-items: center;
  svg { width: 20px; height: 20px; stroke: #ffffff; }
}
.tv-title { font-size: 1.2rem; font-weight: 800; letter-spacing: -.03em; color: var(--text); margin: 0; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tv-subtitle { font-size: .72rem; color: var(--text-dim); margin: 4px 0 0; text-transform: uppercase; letter-spacing: .04em; }
.tv-avg {
  font-family: var(--mono); font-size: 1.1rem; font-weight: 700; flex-shrink: 0;
  background: var(--surface-3); padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border);
  color: var(--text); display: flex; flex-direction: column; align-items: center; line-height: 1.2;
  small { font-size: .6rem; color: var(--text-dim); text-align: center; letter-spacing: .05em; font-weight: 600; text-transform: uppercase; }
}
.tv-close {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface-3); color: var(--text-muted); cursor: pointer; flex-shrink: 0;
  display: grid; place-items: center; transition: .14s;
  svg { width: 14px; height: 14px; }
  &:hover { border-color: var(--border-strong); color: var(--text); }
}

.tv-body { padding: 18px 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 18px; }
.tv-role-group { display: flex; flex-direction: column; gap: 8px; }
.tv-role-label {
  display: flex; align-items: center; gap: 8px;
  font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-dim);
  :deep(svg) { width: 15px; height: 15px; }
}
.tv-role-label.tank    { color: var(--tank); }
.tv-role-label.dps     { color: var(--dps); }
.tv-role-label.support { color: var(--support); }

.tv-role-members { display: flex; flex-direction: column; gap: 8px; }
.tv-role-members :deep(.player-card-item) {
  background: var(--surface-2) !important;
  border: 1px solid var(--border) !important;
  border-radius: 12px !important;
  padding: 14px 16px !important;
}
.tv-role-members :deep(.player-name) { font-size: 1.02rem !important; }
.tv-role-members :deep(.rank-badge) { width: 46px !important; height: 46px !important; }
.tv-role-members :deep(.badge-sr) { font-size: .92rem !important; }

.tv-empty {
  padding: 12px 14px; border: 1px dashed var(--border-strong); border-radius: 12px;
  color: var(--text-dim); font-size: .82rem; text-align: center;
}

.tv-footer { display: flex; align-items: center; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid var(--border); flex-shrink: 0; background: var(--surface-2); }
.tv-btn-close { height: 40px; padding: 0 20px; border-radius: 10px; background: var(--surface-3); border: 1px solid var(--border); color: var(--text-muted); font-family: var(--font); font-size: .86rem; font-weight: 600; cursor: pointer; transition: .15s; &:hover { border-color: var(--border-strong); color: var(--text); } }

@media (max-width: 480px) {
  .tv-header { flex-wrap: wrap; }
}
</style>
