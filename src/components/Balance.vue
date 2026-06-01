<template>
  <modal
    :title="t.balance"
    variant="large"
    :isActive="isActive"
    :customAction="t.balance"
    fullscreen="md-down"
    @close-modal="closeModal"
    @save-changes="balance"
  >
    <div class="position-relative w-100">
      <sync />
    </div>

    <balance-type v-model="balanceType" />
    <balance-disable v-model="disableType" v-if="balanceType === 'full'" />

    <div class="rank-mode-box">
      <label class="rank-mode-label">Rank mode</label>

      <select v-model="rankMode" class="form-select">
        <option value="adaptive">Adaptive — auto risk based</option>
        <option value="strict">Strict — max rank</option>
        <option value="smart">Smart — highest -200</option>
        <option value="soft">Soft — current/manual only</option>
      </select>

      <div class="rank-mode-help">
        Adaptive: если пик сильно выше текущего — учитывает его жёстче. Smart — мягкий дефолт. Strict — максимальная страховка. Soft — почти только текущий ранг.
      </div>
    </div>

    <balance-options />
    <adjust-rating />
    <dispersion />
    <tries-count />
    <balancer-progress :progress="progress" />
  </modal>
</template>

<script lang="ts">
/* eslint-disable */
import { computed, defineComponent, reactive, ref } from 'vue';
import { t } from '@/i18n';

import MutationTypes from '@/store/mutation-types';
import { useStore } from '@/store';
import wasm from '@/mworker';

import { Teams } from '@/objects/team';
import { Results } from '@/objects/balance';
import { Players, ClassType } from '@/objects/player';

import Sync from '@/components/Balance/Sync.vue';
import Modal from '@/components/Helpers/Modal.vue';
import TriesCount from '@/components/Balance/TriesCount.vue';
import Dispersion from '@/components/Balance/Dispersion.vue';
import BalanceType from '@/components/Balance/BalanceType.vue';
import AdjustRating from '@/components/Balance/AdjustRating.vue';
import BalanceOptions from '@/components/Balance/BalanceOptions.vue';
import BalanceDisable from '@/components/Balance/BalanceDisable.vue';
import BalancerProgress from '@/components/Balance/BalancerProgress.vue';

type DataType = {
  teamsCopy: Teams;
  reserveCopy: string[];
};

type RankMode = 'strict' | 'smart' | 'adaptive' | 'soft';

export default defineComponent({
  name: 'Balance',

  components: {
    Sync,
    Modal,
    TriesCount,
    Dispersion,
    BalanceType,
    AdjustRating,
    BalanceOptions,
    BalanceDisable,
    BalancerProgress,
  },

  setup() {
    const store = useStore();

    const sbOptions = computed(() => store.state.balancerOptions);

    const balanceType = ref('full');
    const disableType = ref('none');
    const rankMode = ref<RankMode>('adaptive');

    const isActive = computed(() => store.state.isBalance);
    const reservedPlayers = computed(() => store.state.reservedPlayers);
    const stateTeams = computed(() => store.state.teams);
    const progress = reactive({ total: 10, current: 0 });

    document.addEventListener('wasm-update', e => {
      progress.current += 1;
    });

    const closeModal = () => {
      store.commit(MutationTypes.TOGGLE_BALANCE, undefined);
    };

    const getAdaptiveRank = (
      currentRank: number,
      highestSeenRank: number
    ): number => {
      const difference = highestSeenRank - currentRank;

      if (highestSeenRank <= 0) {
        return currentRank;
      }

      if (difference >= 600) {
        return highestSeenRank;
      }

      if (difference >= 300) {
        return Math.max(highestSeenRank - 200, 0);
      }

      return currentRank;
    };

    const getModeRank = (role: ClassType): number => {
      const currentRank = role.rank || 0;
      const registrationRank = role.registrationRank || 0;
      const highestSeenRank = role.highestSeenRank || 0;
      const manualRank = role.manualRank || 0;

      if (rankMode.value === 'strict') {
        return Math.max(
          currentRank,
          registrationRank,
          highestSeenRank,
          manualRank
        );
      }

      if (rankMode.value === 'soft') {
        return Math.max(
          currentRank,
          registrationRank,
          manualRank
        );
      }

      if (rankMode.value === 'adaptive') {
        return Math.max(
          getAdaptiveRank(currentRank, highestSeenRank),
          registrationRank,
          manualRank
        );
      }

      const smartHighestRank =
        highestSeenRank > 0 ? Math.max(highestSeenRank - 200, 0) : 0;

      return Math.max(
        currentRank,
        registrationRank,
        manualRank,
        smartHighestRank
      );
    };

    const getBalancePlayers = (): Players => {
      const result: Players = {};

      Object.entries(store.state.players).forEach(([id, player]) => {
        result[id] = {
          ...player,
          stats: {
            ...player.stats,
            classes: {
              dps: {
                ...player.stats.classes.dps,
                rank: getModeRank(player.stats.classes.dps),
              },
              tank: {
                ...player.stats.classes.tank,
                rank: getModeRank(player.stats.classes.tank),
              },
              support: {
                ...player.stats.classes.support,
                rank: getModeRank(player.stats.classes.support),
              },
            },
          },
        };
      });

      return result;
    };

    const getCommonBalancerPayload = () => ({
      players: getBalancePlayers(),
      range: +sbOptions.value.range,
      lowRankLimiter: sbOptions.value.lowRankLimiter,
      disallowSecondaryRoles: sbOptions.value.disallowSecondaryRoles,
      preferBalancedCaptains: sbOptions.value.preferBalancedCaptains,
      preferFullFlexDistribution: sbOptions.value.preferFullFlexDistribution,
      preventSuperteamSynergy: sbOptions.value.preventSuperteamSynergy,
      adjustSr: sbOptions.value.adjustSr,
    });

    const fullBalance: (lib: any) => Results = lib => {
      const data = JSON.stringify({
        ...getCommonBalancerPayload(),
        disableType: disableType.value,
        dispersionMinimizer: sbOptions.value.dispersionMinimizer,
        triesCount: sbOptions.value.triesCount,
      });

      return lib.fullBalance(data);
    };

    const halfBalance: (lib: any) => Results = lib => {
      return lib.halfBalance(
        JSON.stringify({
          ...getCommonBalancerPayload(),
        })
      );
    };

    const finalBalance: (lib: any, data: DataType) => Results = (
      lib,
      { teamsCopy, reserveCopy }
    ) => {
      return lib.finalBalance(
        JSON.stringify({
          ...getCommonBalancerPayload(),
          reserveCopy,
          teamsCopy,
        })
      );
    };

    const conditionalBalance: (lib: any, data: DataType) => Results = (lib, data) => {
      if (balanceType.value === 'half') return halfBalance(lib);
      if (balanceType.value === 'final') return finalBalance(lib, data);
      return fullBalance(lib);
    };

    const checkCaps = () => {
      return Object.values(store.state.players).some(
        player => player.identity.isCaptain
      );
    };

    const balance = async () => {
      if (!checkCaps()) {
        alert('Please select at least one captain');
        return;
      }

      const teamsCopy = [...stateTeams.value];
      const reserveCopy = [...reservedPlayers.value];

      store.commit(MutationTypes.CLEAR_TEAMS, undefined);
      store.commit(MutationTypes.SET_RESULTS, []);
      progress.current = 0;

      const lib = await wasm;

      try {
        let results: Results | null = await conditionalBalance(lib, {
          teamsCopy,
          reserveCopy,
        });

        if (results.length != 1) {
          store.commit(MutationTypes.SET_RESULTS, results);
          store.commit(MutationTypes.TOGGLE_SELECTION, undefined);
          return;
        }

        const ignoredUuids = results[0].leftovers.reduce(
          (acc: string[], leftover) => {
            acc.push(leftover.uuid);
            return acc;
          },
          []
        );

        store.commit(MutationTypes.RESERVE_PLAYERS, ignoredUuids);
        store.commit(MutationTypes.ADD_TEAMS, results[0].teams);
      } catch (e) {
        console.error(e.message);
      }
    };

    return {
      balance,
      isActive,
      progress,
      closeModal,
      balanceType,
      disableType,
      rankMode,
      t,
    };
  },
});
</script>

<style scoped>
.rank-mode-box {
  margin: 12px 0;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  background: #1c1c22;
}
.rank-mode-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}
.rank-mode-help {
  margin-top: 8px;
  font-size: 12px;
  color: #4b5563;
  line-height: 1.5;
}
</style>