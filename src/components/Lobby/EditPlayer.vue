<template>
  <modal
    :isActive="isActive"
    :title="player.identity.name"
    @close-modal="closeModal"
    @save-changes="saveChanges"
  >
    <fieldset class="EditPlayer-Block">
      <h3>{{ t.identity }}</h3>
      <edit-identity
        :identity="player.identity"
        @update-bnet-stats="updateBnetStats"
      />
    </fieldset>

    <fieldset class="EditPlayer-Block" :disabled="player.identity.isLocked">
      <h3>{{ t.stats }}</h3>
      <edit-stats
        :stats="player.stats"
        :uuid="player.identity.uuid"
        @update-rank="updateRank"
        @update-specialization="updateSpecialization"
        @update-stats="updateStats"
      />
    </fieldset>
  </modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { t } from '@/i18n';

import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';
import PlayerEditor, { Stats } from '@/objects/player';

import Modal from '@/components/Helpers/Modal.vue';
import EditStats from '@/components/Lobby/EditStats.vue';
import EditIdentity from '@/components/Lobby/EditIdentity.vue';

type BnetRole = {
  division?: string;
  tier?: number;
};

type BnetStats = {
  damage?: BnetRole;
  tank?: BnetRole;
  support?: BnetRole;
};

export default defineComponent({
  name: 'EditPlayer',
  components: { Modal, EditStats, EditIdentity },

  setup() {
    const store = useStore();
    const emptyPlayer = PlayerEditor.createDefaultPlayer('');

    const isActive = computed(() => store.state.editPlayer.playerId !== '');

    const playerData = computed(() => {
      const { lobby, playerId } = store.state.editPlayer;
      return store.state[lobby][playerId] || emptyPlayer;
    });

    const player = ref(cloneDeep(emptyPlayer));

    watch(
      () => store.state.editPlayer.playerId,
      () => {
        player.value = cloneDeep(playerData.value);
      }
    );

    const divisionBase: Record<string, number> = {
      bronze: 1000,
      silver: 1500,
      gold: 2000,
      platinum: 2500,
      diamond: 3000,
      master: 3500,
      grandmaster: 4000,
      champion: 4500,
    };

    const convertRank = (role?: BnetRole) => {
      if (!role?.division || !role?.tier) return 0;

      const base = divisionBase[role.division.toLowerCase()];
      if (!base) return 0;

      return base + (5 - role.tier) * 100;
    };

    const updateBnetStats = (bnetStats: BnetStats) => {
      const dpsRank = convertRank(bnetStats.damage);
      const tankRank = convertRank(bnetStats.tank);
      const supportRank = convertRank(bnetStats.support);

      player.value.stats.classes.dps.rank = dpsRank;
      player.value.stats.classes.dps.isActive = dpsRank > 0;

      player.value.stats.classes.tank.rank = tankRank;
      player.value.stats.classes.tank.isActive = tankRank > 0;

      player.value.stats.classes.support.rank = supportRank;
      player.value.stats.classes.support.isActive = supportRank > 0;
    };

    const closeModal = () => {
      player.value = cloneDeep(emptyPlayer);
      store.commit(MutationTypes.CLEAR_EDIT_PLAYER, undefined);
    };

    const saveChanges = () => {
      store.commit(MutationTypes.ADD_PLAYER, {
        player: cloneDeep(player.value),
        lobby: store.state.editPlayer.lobby,
      });

      store.commit(MutationTypes.EMPTY_NO_RANK, undefined);
      store.commit(MutationTypes.CLEAR_EDIT_PLAYER, undefined);
    };

    const updateRank = (role: 'dps' | 'support' | 'tank', rank: number) => {
      player.value.stats.classes[role].rank = rank;
    };

    const updateSpecialization = (
      role: 'dps' | 'support' | 'tank',
      specialization: 'primary' | 'secondary',
      value: boolean
    ) => {
      player.value.stats.classes[role][specialization] = value;
    };

    const updateStats = (stats: Stats) => {
      player.value.stats = stats;
    };

    return {
      player,
      isActive,
      closeModal,
      saveChanges,
      updateRank,
      updateSpecialization,
      updateStats,
      updateBnetStats,
      t,
    };
  },
});
</script>

<style lang="scss" scoped>
.EditPlayer {
  &-Block:not(:last-child) {
    border-bottom: 1px solid black;
    padding-bottom: 1em;
    margin: 1em 0;
  }
}
</style>