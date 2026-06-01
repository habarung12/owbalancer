<template>
  <div
    class="player-card-item"
    draggable="true"
    v-if="player"
    @contextmenu="editPlayer"
    @dragstart="drag"
  >
    <!-- Rank badge -->
    <div class="rank-badge" :style="badgeStyle">
      <span class="badge-sr">{{ sr }}</span>
      <span class="badge-tier">{{ tierName }}</span>
    </div>

    <!-- Name + meta -->
    <div class="player-main">
      <div class="player-name">
        <span class="crown" v-if="player.identity.isCaptain">
          <crown-icon />
        </span>
        <span class="name-text">{{ player.identity.name }}</span>
        <lock-icon v-if="player.identity.isLocked" class="lock-ico" />
      </div>
      <div class="player-meta">
        {{ metaRoles }}
      </div>
    </div>

    <!-- Role icons -->
    <div class="player-role-icons">
      <span
        v-for="(role, index) in state.icons"
        :key="role"
        class="ri"
        :class="[role, { secondary: index > 0 }]"
      >
        <role-icon :rtype="role" />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, computed } from 'vue';

import { useStore } from '@/store';
import PObj, { LobbyType, Player } from '@/objects/player';
import MutationTypes from '@/store/mutation-types';

import LockIcon from '@/components/svg/LockIcon.vue';
import RoleIcon from '@/components/svg/RoleIcon.vue';
import CrownIcon from '@/components/svg/CrownIcon.vue';

function getTier(sr: number): { name: string; color: string; bg: string } {
  if (sr >= 4500) return { name: 'Champ', color: '#f2c94c', bg: 'rgba(242,201,76,.13)' };
  if (sr >= 4000) return { name: 'GM',    color: '#f2c94c', bg: 'rgba(242,201,76,.13)' };
  if (sr >= 3500) return { name: 'Master',color: '#e0685f', bg: 'rgba(224,104,95,.13)' };
  if (sr >= 3000) return { name: 'Dia',   color: '#a78bfa', bg: 'rgba(167,139,250,.13)' };
  if (sr >= 2500) return { name: 'Plat',  color: '#5fd3c4', bg: 'rgba(95,211,196,.13)' };
  if (sr >= 2000) return { name: 'Gold',  color: '#f99e1a', bg: 'rgba(249,158,26,.13)' };
  if (sr >= 1500) return { name: 'Silver',color: '#a4a9b4', bg: 'rgba(164,169,180,.13)' };
  if (sr > 0)     return { name: 'Bronze',color: '#cd7f5d', bg: 'rgba(205,127,93,.13)' };
  return { name: '—', color: '#6b7280', bg: 'rgba(107,114,128,.1)' };
}

export default defineComponent({
  name: 'PlayerCard',

  props: {
    teamUuid: String,
    player: Object as PropType<Player>,
    prefferedRole: String,
    prefferedRank: Number,
    rankRole: String,
    lobby: {
      type: String as PropType<LobbyType>,
      default: 'players',
    },
  },

  components: { RoleIcon, CrownIcon, LockIcon },

  setup(props) {
    const store = useStore();

    const drag = (ev: DragEvent) => {
      if (ev?.dataTransfer) {
        ev.dataTransfer.setData('playerTag', props.player?.identity.uuid || '');
        ev.dataTransfer.setData('team', props.teamUuid || '');
        ev.dataTransfer.setData('from', props.lobby || '');
      }
    };

    const editPlayer = (e: MouseEvent) => {
      e.preventDefault();
      if (props.player === undefined) return;
      store.commit(MutationTypes.EDIT_PLAYER, {
        playerId: props.player.identity.uuid,
        lobby: props.lobby,
      });
    };

    const icons = computed(() => {
      const classes = Object.entries(props.player?.stats.classes || {});
      return classes
        .filter(([, role]) => role.isActive)
        .sort(([, role], [, role2]) => role.priority - role2.priority)
        .map(([name]) => name);
    });

    const state = reactive({ icons });

    const sr = computed(() => {
      if (!props.player) return 0;
      if (props.rankRole) return PObj.getRole(props.player.stats.classes, props.rankRole).rank;
      if (props.prefferedRank) return props.prefferedRank;
      return PObj.getTopRank(props.player);
    });

    const tierData = computed(() => getTier(sr.value));
    const tierName = computed(() => tierData.value.name);
    const badgeStyle = computed(() => ({
      color: tierData.value.color,
      background: tierData.value.bg,
      borderColor: tierData.value.color + '33',
    }));

    const metaRoles = computed(() => {
      if (!props.player) return '';
      if (props.teamUuid) {
        return props.prefferedRole?.toUpperCase() || '';
      }
      return icons.value.join(' / ');
    });

    return { sr, drag, state, editPlayer, tierName, badgeStyle, metaRoles };
  },
});
</script>

<style lang="scss" scoped>
.player-card-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border-radius: 12px;
  cursor: grab;
  width: 100%;
  min-height: 0;
}
.player-card-item:active { cursor: grabbing; }

.rank-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  line-height: 1;
}
.badge-sr {
  font-family: var(--mono);
  font-size: .82rem;
  font-weight: 600;
}
.badge-tier {
  font-size: .48rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  opacity: .85;
  margin-top: 2px;
}

.player-main {
  flex: 1;
  min-width: 0;
}
.player-name {
  font-size: .92rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #f4f5f7;
}
.crown {
  color: #f99e1a;
  flex-shrink: 0;
  display: flex;
  :deep(svg) { width: 14px !important; height: 14px !important; fill: currentColor !important; }
}
.lock-ico {
  opacity: .5;
  flex-shrink: 0;
  :deep(svg) { width: 12px !important; height: 12px !important; }
}
.name-text {
  overflow: hidden;
  text-overflow: ellipsis;
}
.player-meta {
  font-size: .72rem;
  color: #6b7280;
  margin-top: 1px;
  text-transform: capitalize;
}

.player-role-icons {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}
.ri {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: #1c1f26;
  :deep(svg), :deep(img) {
    width: 14px !important;
    height: 14px !important;
  }
}
.ri.tank    { color: #6aa3e0; :deep(svg path), :deep(svg circle), :deep(svg) { stroke: currentColor !important; fill: none !important; } }
.ri.dps     { color: #e0685f; :deep(svg path), :deep(svg circle), :deep(svg) { stroke: currentColor !important; fill: none !important; } }
.ri.support { color: #6fc59a; :deep(svg path), :deep(svg circle), :deep(svg) { stroke: currentColor !important; fill: none !important; } }
.ri.secondary { opacity: .32; transform: scale(.85); }
</style>
