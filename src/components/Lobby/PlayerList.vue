<template>
  <div class="w-100">

    <player-filter :players="state.storePlayers" @filter="filter" />

    <div
      class="player-list"
      @dragover="allowDrop"
      @drop="drop"
    >
      <player-card
        class="player-card-item"
        :class="{
          'is-locked':    player.identity.isLocked,
          'is-selected':  !!marked[uuid],
          'is-duplicate': duplicates.includes(player.identity.name),
        }"
        v-for="[uuid, player] in state.players"
        :player="player"
        :key="uuid"
        :lobby="lobby"
        @click="e => click(e, uuid)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from 'vue';
import orderBy from 'lodash/orderBy';

import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';

import PlayerFilter from '@/components/Lobby/Filter.vue';
import PlayerCard from '@/components/PlayerCard.vue';
import PObj, { Player, PlayerEntries, LobbyType } from '@/objects/player';

export default defineComponent({
  name: 'PlayerList',
  components: { PlayerFilter, PlayerCard },
  props: {
    enableExtra: { type: Boolean, default: true },
    lobby: { type: String as PropType<LobbyType>, default: 'players' },
    showAll: { type: Boolean, default: false },
  },
  setup(props) {
    const store = useStore();
    const teamsLen = computed(() => store.state.teams.length);
    const lobby = computed<LobbyType>(() => props.lobby);

    const teamMemberUuids = computed(() => {
      const set = new Set<string>();
      store.state.teams.forEach(team => team.members.forEach(m => set.add(m.uuid)));
      return set;
    });

    const storePlayers = computed(() =>
      Object.entries(store.state[lobby.value]).filter(
        ([, p]) => props.showAll || !teamMemberUuids.value.has(p.identity.uuid)
      )
    );

    const activeSort: { rule: string; order: 'asc' | 'desc' } = { rule: 'name', order: 'asc' };
    const state = reactive({ activeSort, storePlayers, players: storePlayers.value });

    const sort = (rule: string, order: 'asc' | 'desc', pl?: [string, Player][]) => {
      const mPlayers = pl || state.players;
      state.players = orderBy(mPlayers, [([, p]) => {
        if (rule === 'name') return p.identity.name.toLowerCase();
        if (rule === 'sr')   return PObj.getTopRank(p);
        return new Date(p.createdAt).getTime();
      }], order);
      state.activeSort.rule = rule;
      state.activeSort.order = order;
    };

    const filter = (filtered: PlayerEntries) => {
      sort(state.activeSort.rule, state.activeSort.order, filtered);
    };

    const allowDrop = (ev: DragEvent) => ev.preventDefault();

    const drop = (ev: DragEvent) => {
      ev.preventDefault();
      const playerId = ev?.dataTransfer?.getData('playerTag');
      const teamUuid = ev?.dataTransfer?.getData('team');
      const from = ev?.dataTransfer?.getData('from') as LobbyType | undefined;

      if (!playerId) return;

      if (teamUuid && store.state.teams.length > 0) {
        store.commit(MutationTypes.ADD_RESERVE, playerId);
        store.commit(MutationTypes.REMOVE_FROM_TEAM, { teamUuid, playerId });
        return;
      }

      if (from !== undefined) {
        const to = from === 'players' ? 'backup' : 'players';
        if (from === props.lobby) return;
        if (!store.state[to][playerId] && store.state[from][playerId]) {
          store.commit(MutationTypes.ADD_PLAYER, { player: store.state[from][playerId], lobby: to });
          if (to === 'players' && store.state.teams.length > 0) {
            store.commit(MutationTypes.ADD_RESERVE, playerId);
          }
        }
      }
    };

    const marked = computed(() => store.state.selectPlayers[props.lobby]);

    const duplicates = computed(() =>
      Object.entries(
        Object.values(store.state[props.lobby]).reduce(
          (acc: { [key: string]: number }, player) => ({
            ...acc,
            [player.identity.name]: (acc[player.identity.name] ?? 0) + 1,
          }),
          {}
        )
      )
        .filter(([, count]) => count > 1)
        .map(([name]) => name)
    );

    const click = (ev: MouseEvent, uuid: string) => {
      ev.preventDefault();
      if (ev.ctrlKey) {
        store.commit(MutationTypes.SELECT_PLAYERS, { playerIds: [uuid], lobby: props.lobby });
      }
    };

    return { state, sort, filter, allowDrop, drop, click, marked, duplicates };
  },
});
</script>

<style lang="scss" scoped>
/* Scrollable player list — matches reference */
.player-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-height: 62vh;
  overflow-y: auto;
  padding-right: 4px;
  padding-bottom: 2px;
}

/* Each direct child gets spacing — belt + suspenders */
.player-list > :deep(*) {
  flex-shrink: 0;
}

/* Card state overrides */
.player-card-item {
  transition: .14s ease;
  overflow: hidden;
  /* Ensure no margin collapses the gap */
  margin: 0 !important;
}

.is-duplicate {
  border-left: 3px solid var(--danger) !important;
  background: var(--danger-soft) !important;
}

.is-selected {
  border-left: 3px solid var(--tank) !important;
  background: rgba(106,163,224,.1) !important;
}

.is-locked {
  border-left: 3px solid rgba(35,128,177,.6) !important;
  background: var(--accent-soft) !important;
}
</style>
