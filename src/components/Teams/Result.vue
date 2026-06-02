<template>
  <div class="result-card" :class="{ selected: isSelected, recommended: isRecommended }" @click="addBalance">
    <div class="rc-head">
      <div class="rc-title">
        <span class="rc-variant">{{ label }}</span>
        <span v-if="isRecommended" class="rc-rec">★ {{ t.resultRecommended }}</span>
      </div>
      <div class="rc-score" :style="{ color: scoreColor }">
        {{ score }}<span class="rc-score-max">/100</span>
      </div>
    </div>

    <!-- Mini team bars -->
    <div class="rc-teams">
      <div class="rc-team" v-for="(team, i) in teamRows" :key="i">
        <span class="rc-team-name">{{ team.name }}</span>
        <div class="rc-bar-track">
          <div class="rc-bar" :style="{ left: team.barLeft + '%', width: team.barWidth + '%' }"></div>
          <div class="rc-bar-center"></div>
        </div>
        <span class="rc-team-sr mono">{{ team.sr }}</span>
      </div>
    </div>

    <!-- Metrics -->
    <div class="rc-metrics">
      <div class="rc-metric" :class="{ good: balance.dispersion <= 100 }">
        <span class="rc-m-label">{{ t.resultDispersion }}</span>
        <span class="rc-m-value mono">±{{ balance.dispersion }}</span>
      </div>
      <div class="rc-metric" :class="{ bad: balance.leftovers.length > 0 }">
        <span class="rc-m-label">{{ t.resultLeftovers }}</span>
        <span class="rc-m-value mono">{{ balance.leftovers.length }}</span>
      </div>
      <div class="rc-metric" :class="{ warn: offRolesPercentage > 0 }">
        <span class="rc-m-label">{{ t.resultOffroles }}</span>
        <span class="rc-m-value mono">{{ offRolesPercentage }}%</span>
      </div>
      <div class="rc-metric">
        <span class="rc-m-label">{{ t.resultAnchors }}</span>
        <span class="rc-m-value mono">{{ balance.anchors }}</span>
      </div>
    </div>

    <div v-if="isSelected" class="rc-selected-badge">✓ {{ t.resultSelected }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';
import { TeamMembers, Team } from '@/objects/team';
import { Balance } from '@/objects/balance';
import PObj from '@/objects/player';
import { t } from '@/i18n';

export default defineComponent({
  name: 'Result',
  props: {
    balance: { type: Object as PropType<Balance>, required: true },
    isSelected: Boolean,
    isRecommended: Boolean,
    index: Number,
  },
  setup(props) {
    const store = useStore();

    const label = computed(() => `${t.value.resultVariant} ${(props.index ?? 0) + 1}`);

    const addBalance = () => {
      const { leftovers, teams } = props.balance;
      const ignoredUuids = leftovers.map(l => l.uuid);
      store.commit(MutationTypes.RESERVE_PLAYERS, ignoredUuids);
      store.commit(MutationTypes.ADD_TEAMS, teams);
      store.commit(MutationTypes.TOGGLE_SELECTION, undefined);
    };

    const offRolesPercentage = computed(() => {
      const [offCount, totalCount] = props.balance.teams.reduce(
        (acc: [number, number], team: Team) => {
          let [off, total] = acc;
          team.members.forEach((member: TeamMembers) => {
            total += 1;
            if (
              store.state.players[member.uuid] &&
              member.role !== PObj.getTopRoleName(store.state.players[member.uuid]) &&
              !store.state.players[member.uuid].identity.isFullFlex
            ) off += 1;
          });
          return [off, total];
        },
        [0, 0]
      );
      return totalCount ? Math.floor((offCount / totalCount) * 1000) / 10 : 0;
    });

    // Team SR rows with deviation bars
    const teamRows = computed(() => {
      const srs = props.balance.teams.map(t => Math.round(t.avgSr || 0));
      const min = Math.min(...srs);
      const max = Math.max(...srs);
      const span = Math.max(max - min, 1);
      return props.balance.teams.map((team, i) => {
        const sr = srs[i];
        // map sr into 0..100 around center 50
        const pos = 50 + ((sr - (min + max) / 2) / span) * 80;
        return {
          name: team.name,
          sr,
          barLeft: Math.min(Math.max(pos - 2, 0), 96),
          barWidth: 4,
        };
      });
    });

    // Composite quality score (0-100)
    const score = computed(() => {
      let s = 100;
      s -= Math.min(props.balance.dispersion / 6, 45);       // dispersion penalty
      s -= props.balance.leftovers.length * 12;               // incomplete penalty
      s -= offRolesPercentage.value * 0.6;                    // off-role penalty
      s -= props.balance.anchors * 4;                         // anchor penalty
      return Math.max(0, Math.round(s));
    });

    const scoreColor = computed(() => {
      if (score.value >= 80) return 'var(--support)';
      if (score.value >= 55) return 'var(--accent)';
      return 'var(--dps)';
    });

    return { addBalance, offRolesPercentage, teamRows, score, scoreColor, label, t };
  },
});
</script>

<style lang="scss" scoped>
.result-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: border-color .15s, transform .15s, box-shadow .15s;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.result-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,.3);
}
.result-card.selected {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent), 0 8px 24px rgba(249,158,26,.15);
}
.result-card.recommended {
  border-color: rgba(111,197,154,.4);
}

.rc-head { display: flex; align-items: flex-start; justify-content: space-between; }
.rc-title { display: flex; flex-direction: column; gap: 4px; }
.rc-variant { font-size: .92rem; font-weight: 700; color: var(--text); }
.rc-rec {
  font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em;
  color: var(--support); background: rgba(111,197,154,.12);
  padding: 2px 7px; border-radius: 6px; width: fit-content;
}
.rc-score { font-size: 1.5rem; font-weight: 800; line-height: 1; font-family: var(--mono); }
.rc-score-max { font-size: .7rem; color: var(--text-dim); font-weight: 600; }

.rc-teams { display: flex; flex-direction: column; gap: 6px; }
.rc-team { display: grid; grid-template-columns: 64px 1fr 42px; align-items: center; gap: 8px; }
.rc-team-name { font-size: .72rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-bar-track {
  position: relative; height: 6px; border-radius: 99px;
  background: var(--surface-3); overflow: hidden;
}
.rc-bar {
  position: absolute; top: 0; height: 100%; border-radius: 99px;
  background: var(--accent);
}
.rc-bar-center { position: absolute; left: 50%; top: -2px; bottom: -2px; width: 1px; background: var(--border-strong); }
.rc-team-sr { font-size: .74rem; font-weight: 600; color: var(--text); text-align: right; }

.rc-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
.rc-metric {
  display: flex; align-items: center; justify-content: space-between; gap: 6px;
  padding: 6px 9px; border-radius: 8px;
  background: var(--surface-3); border: 1px solid var(--border);
  min-width: 0;
}
.rc-m-label { font-size: .6rem; color: var(--text-dim); font-weight: 600; text-transform: uppercase; letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rc-m-value { font-size: .78rem; font-weight: 700; color: var(--text); flex-shrink: 0; }
.rc-metric.good .rc-m-value { color: var(--support); }
.rc-metric.warn .rc-m-value { color: var(--accent); }
.rc-metric.bad  .rc-m-value { color: var(--dps); }

.rc-selected-badge {
  position: absolute; top: 12px; right: 12px;
  font-size: .6rem; font-weight: 700; text-transform: uppercase;
  color: #1a1206; background: var(--accent);
  padding: 3px 8px; border-radius: 6px;
}

.mono { font-family: var(--mono); }
</style>
