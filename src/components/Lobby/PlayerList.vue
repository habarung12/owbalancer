<template>
  <div class="w-100">
    <div class="lobby-toolbar">
      <sort @sort="sort" />

      <assign v-if="enableExtra" />

      <export :lobby="lobby" />

      <import-file :lobby="lobby" />

      <delete-players :lobby="lobby" />
    </div>

    <stats :players="state.storePlayers" :currentCount="state.players.length" />
    <player-filter :players="state.storePlayers" @filter="filter" />

    <div
      class="player-cards overflow-auto"
      @dragover="allowDrop"
      @drop="drop"
    >
      <player-card
        class="player-card-item"
        :class="{
          'bg-locked': player.identity.isLocked,
          selected: !!marked[uuid],
          duplicate: duplicates.includes(player.identity.name),
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
import { computed, defineComponent, onMounted, PropType, reactive, watch } from 'vue';
import orderBy from 'lodash/orderBy';

import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';

import Sort from '@/components/Lobby/Sort.vue';
import Stats from '@/components/Lobby/Stats.vue';
import PlayerFilter from '@/components/Lobby/Filter.vue';
import Assign from '@/components/Lobby/Assign.vue';
import PlayerCard from '@/components/PlayerCard.vue';
import Export from '@/components/Lobby/Export.vue';
import ImportFile from '@/components/Lobby/Import.vue';
import DeletePlayers from '@/components/Lobby/DeletePlayers.vue';
import PObj, { Player, PlayerEntries, LobbyType } from '@/objects/player';

export default defineComponent({
  name: 'PlayerList',
  components: {
    Assign,
    Sort,
    Stats,
    PlayerFilter,
    PlayerCard,
    Export,
    ImportFile,
    DeletePlayers,
  },
  props: {
    enableExtra: {
      type: Boolean,
      default: true,
    },
    lobby: {
      type: String as PropType<LobbyType>,
      default: 'players',
    },
    showAll: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const store = useStore();
    const teamsLen = computed(() => store.state.teams.length);
    const lobby = computed<LobbyType>(() => props.lobby);

    const storePlayers = computed(() =>
      Object.entries(store.state[lobby.value]).filter(
        ([, p]) =>
          props.showAll ||
          (store.state.reservedPlayers.length > 0
            ? store.state.reservedPlayers.includes(p.identity.uuid)
            : teamsLen.value <= 0)
      )
    );

    const activeSort: { rule: string; order: 'asc' | 'desc' } = {
      rule: 'name',
      order: 'asc',
    };

    const state = reactive({
      activeSort,
      storePlayers,
      players: storePlayers.value,
    });

    const sort = (rule: string, order: 'asc' | 'desc', pl?: [string, Player][]) => {
      const mPlayers = pl || state.players;

      const sortedPlayers = orderBy(
        mPlayers,
        [
          ([, p]) => {
            if (rule === 'name') return p.identity.name.toLowerCase();
            if (rule === 'sr') return PObj.getTopRank(p);

            return new Date(p.createdAt).getTime();
          },
        ],
        order
      );

      state.activeSort.rule = rule;
      state.activeSort.order = order;
      state.players = sortedPlayers;
    };

    watch(
      () => state.storePlayers,
      () => {
        sort(state.activeSort.rule, state.activeSort.order, storePlayers.value);
      }
    );

    const filter = (filtered: PlayerEntries) => {
      sort(state.activeSort.rule, state.activeSort.order, filtered);
    };

    onMounted(() => {
      sort(state.activeSort.rule, state.activeSort.order);
    });

    const allowDrop = (ev: DragEvent) => {
      ev.preventDefault();
    };

    const drop = (ev: DragEvent) => {
      ev.preventDefault();

      const playerId = ev?.dataTransfer?.getData('playerTag');
      const teamUuid = ev?.dataTransfer?.getData('team');
      const from = ev?.dataTransfer?.getData('from') as LobbyType | undefined;

      if (!playerId) return;

      if (teamUuid && store.state.teams.length > 0) {
        store.commit(MutationTypes.ADD_RESERVE, playerId);
        store.commit(MutationTypes.REMOVE_FROM_TEAM, {
          teamUuid,
          playerId,
        });

        return;
      }

      if (from !== undefined) {
        const to = from === 'players' ? 'backup' : 'players';

        if (from === props.lobby) return;

        if (!store.state[to][playerId] && store.state[from][playerId]) {
          store.commit(MutationTypes.ADD_PLAYER, {
            player: store.state[from][playerId],
            lobby: to,
          });

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
        store.commit(MutationTypes.SELECT_PLAYERS, {
          playerIds: [uuid],
          lobby: props.lobby,
        });
      }
    };

    return { state, sort, filter, allowDrop, drop, click, marked, duplicates };
  },
});
</script>

<style lang="scss" scoped>
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins';

.lobby-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  margin-bottom: 6px;
}

.lobby-toolbar > * {
  margin: 0 !important;
  flex-shrink: 0;
}

:global(:root) {
  --card-bg: #ffffff;
  --cards-bg: #f8f9fa;
  --cards-border: #e9ecef;
  --card-border: #edf0f2;
  --card-text: #212529;
}

:global(body.dark-mode) {
  --card-bg: #242424;
  --cards-bg: #181818;
  --cards-border: #333333;
  --card-border: #3a3a3a;
  --card-text: #f1f1f1;
}

.player-cards {
  height: 40rem;
  background: var(--cards-bg) !important;
  border: 1px solid var(--cards-border) !important;
  border-radius: 14px;
  padding: 0.6rem;
}

.player-card-item {
  margin-bottom: 0.45rem;
  background-color: var(--card-bg) !important;
  color: var(--card-text) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 10px !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: 0.15s ease;
  overflow: hidden;
}

.player-card-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.1);
}

.player-card-item :deep(*) {
  color: inherit;
}

@include media-breakpoint-down(sm) {
  .player-cards {
    height: 30rem;
  }
}

.duplicate {
  background-color: #fff1f1 !important;
  border-left: 4px solid #dc3545 !important;
}

.selected {
  background-color: #eefaff !important;
  border-left: 4px solid #0dcaf0 !important;
}

.bg-locked {
  background-color: #fff8df !important;
  border-left: 4px solid #ffc107 !important;
}

:global(body.dark-mode) .duplicate {
  background-color: #3a1717 !important;
}

:global(body.dark-mode) .selected {
  background-color: #12313a !important;
}

:global(body.dark-mode) .bg-locked {
  background-color: #3a2f12 !important;
}
</style>