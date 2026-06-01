<template>
  <li
    v-for="i in teamSize[rtype ?? 'dps']"
    :key="i"
    @dragover="allowDrop"
    @drop="e => drop(e, i)"
    class="team-role-slot"
    :class="{ empty: !members[i - 1] }"
  >
    <player-card
      v-if="members[i - 1]"
      :player="players[members[i - 1].uuid]"
      :prefferedRank="members[i - 1].rank"
      :rankRole="showBalancerSR ? undefined : members[i - 1].role"
      :teamUuid="teamUuid"
    />
    <div v-else class="empty-slot">
      <div class="empty-dot"></div>
      <span class="empty-text">{{ t.emptySlot }}</span>
    </div>
  </li>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { t } from '@/i18n';

import PObj from '@/objects/player';
import { useStore } from '@/store';

import RoleIcon from '@/components/svg/RoleIcon.vue';
import PlayerCard from '@/components/PlayerCard.vue';
import MutationTypes from '@/store/mutation-types';

export default defineComponent({
  name: 'TeamRoles',
  props: {
    rtype: String as PropType<'dps' | 'tank' | 'support'>,
    teamUuid: String,
    members: Array as PropType<
      { uuid: string; name: string; primary: boolean; secondary: boolean }[]
    >,
  },
  components: { RoleIcon, PlayerCard },
  setup(props) {
    const store = useStore();
    const players = computed(() => store.state.players);

    const teamSize = {
      tank: 1,
      dps: 2,
      support: 2,
    };

    const allowDrop = (ev: DragEvent) => {
      ev.preventDefault();
    };
    const drop = (ev: DragEvent, index: number) => {
      ev.preventDefault();
      const i = index - 1;
      const playerId = ev?.dataTransfer?.getData('playerTag');
      const teamUuid = ev?.dataTransfer?.getData('team');
      const source = ev?.dataTransfer?.getData('from');

      if (!playerId || !props.rtype || !props.teamUuid || source === 'backup') return;

      const player = players.value[playerId];
      const role = PObj.getRole(player.stats.classes, props.rtype);

      if (!role.isActive) {
        return;
      }

      if (props.members) {
        const member = props.members[i];

        if (member && member.uuid === playerId) {
          return;
        }

        if (!teamUuid) {
          if (member) {
            store.commit(MutationTypes.REMOVE_FROM_TEAM, {
              teamUuid: props.teamUuid,
              playerId: member.uuid,
            });
            store.commit(MutationTypes.ADD_RESERVE, member.uuid);
          }
          store.commit(MutationTypes.REMOVE_FROM_RESERVE, playerId);
          store.commit(MutationTypes.ADD_TEAMPLAYER, {
            teamUuid: props.teamUuid,
            playerId,
            role,
            roleName: props.rtype,
            playerName: player.identity.name,
            primary: role.primary,
            secondary: role.secondary,
          });
        } else {
          const teamF = store.state.teams.findIndex(team => team.uuid === teamUuid);
          const swapCandidate = store.state.players[member.uuid];

          if (teamF >= 0 && swapCandidate) {
            const memF = store.state.teams[teamF].members.find(
              lmember => lmember.uuid === playerId
            );

            if (!memF) return;

            const sdRole = PObj.getRole(swapCandidate.stats.classes, memF.role);

            if (sdRole.isActive) {
              store.commit(MutationTypes.REMOVE_FROM_TEAM, {
                teamUuid: props.teamUuid,
                playerId: member.uuid,
              });
              store.commit(MutationTypes.REMOVE_FROM_TEAM, {
                teamUuid,
                playerId,
              });
              store.commit(MutationTypes.ADD_TEAMPLAYER, {
                teamUuid: props.teamUuid,
                playerId,
                role,
                roleName: props.rtype,
                playerName: player.identity.name,
                primary: role.primary,
                secondary: role.secondary,
              });
              store.commit(MutationTypes.ADD_TEAMPLAYER, {
                teamUuid,
                playerId: member.uuid,
                role: sdRole,
                roleName: memF.role,
                playerName: member.name,
                primary: member.primary,
                secondary: member.secondary,
              });
            }
          }
        }
      } else if (teamUuid) {
        store.commit(MutationTypes.REMOVE_FROM_TEAM, {
          teamUuid,
          playerId,
        });
        store.commit(MutationTypes.REMOVE_FROM_RESERVE, playerId);
        store.commit(MutationTypes.ADD_TEAMPLAYER, {
          teamUuid: props.teamUuid,
          playerId,
          role,
          roleName: props.rtype,
          playerName: player.identity.name,
          primary: role.primary,
          secondary: role.secondary,
        });
      }
    };

    const showBalancerSR = computed(() => store.state.showBalancerSR);

    return { players, allowDrop, drop, showBalancerSR, teamSize, t };
  },
});
</script>

<style lang="scss" scoped>
.team-role-slot {
  list-style: none;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 4px 0;
  border-radius: 10px;
  transition: background .14s;
}

.empty-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  min-height: 46px;
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  transition: border-color .14s, background .14s;
}
.team-role-slot.empty:hover .empty-slot {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.empty-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-strong);
  flex-shrink: 0;
}
.team-role-slot.empty:hover .empty-dot {
  background: var(--accent);
}

.empty-text {
  font-size: .75rem;
  color: var(--text-dim);
  font-weight: 500;
}
.team-role-slot.empty:hover .empty-text {
  color: var(--accent);
}
</style>