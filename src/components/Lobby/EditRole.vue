<template>
  <div
    class="role-row"
    :class="{
      active: mRole.isActive,
      warning: riskLevel === 'medium',
      danger: riskLevel === 'high',
    }"
  >
    <div class="role-main">
      <div class="role-drag sortable-handler" title="Drag to change priority">
        <role-icon :rtype="rtype" />
      </div>

      <div class="role-rank-icon">
        <rank-icon :rank="balanceRank" />
      </div>

      <div class="role-info">
        <div class="role-name">
          {{ roles[rtype].primary }}

          <span
            v-if="riskLevel !== 'none'"
            class="role-warning"
            :class="riskLevel"
            :title="riskTooltip"
          >
            {{ riskLabel }}
          </span>
        </div>

        <div class="role-subtitle">Balance: {{ balanceRankLabel }}</div>
      </div>

      <label class="role-toggle">
        <input
          v-model="mRole.isActive"
          type="checkbox"
          :id="`${rtype}_enabled`"
          :aria-label="rtype"
        />
        <span></span>
      </label>

      <select class="form-select role-select" :value="mRole.rank" @change="rankChange">
        <option :value="0">No rank</option>
        <option v-for="rank in rankOptions" :key="`current-${rank.value}`" :value="rank.value">
          {{ rank.label }}
        </option>
      </select>

      <button
        type="button"
        class="advanced-btn"
        :class="{ open: isAdvancedOpen }"
        @click="isAdvancedOpen = !isAdvancedOpen"
        title="Advanced rank settings"
        aria-label="Advanced rank settings"
      >
        ⚙
      </button>
    </div>

    <div v-if="isAdvancedOpen" class="advanced-fields">
      <div class="advanced-field">
        <label>
          Registration
          <span class="hint" data-tooltip="Ранг игрока на момент регистрации">?</span>
        </label>
        <select
          class="form-select role-select"
          :value="mRole.registrationRank"
          @change="registrationRankChange"
        >
          <option :value="0">Registration rank</option>
          <option v-for="rank in rankOptions" :key="`reg-${rank.value}`" :value="rank.value">
            {{ rank.label }}
          </option>
        </select>
      </div>

      <div class="advanced-field">
        <label>
          Highest
          <span class="hint" data-tooltip="Самый высокий известный ранг игрока">?</span>
        </label>
        <select
          class="form-select role-select"
          :value="mRole.highestSeenRank"
          @change="highestSeenRankChange"
        >
          <option :value="0">Highest seen</option>
          <option v-for="rank in rankOptions" :key="`high-${rank.value}`" :value="rank.value">
            {{ rank.label }}
          </option>
        </select>
      </div>

      <div class="advanced-field">
        <label>
          Manual
          <span
            class="hint"
            data-tooltip="Ручной ранг от администратора. Учитывается в балансе"
          >
            ?
          </span>
        </label>
        <select
          class="form-select role-select"
          :value="mRole.manualRank"
          @change="manualRankChange"
        >
          <option :value="0">Manual rank</option>
          <option v-for="rank in rankOptions" :key="`manual-${rank.value}`" :value="rank.value">
            {{ rank.label }}
          </option>
        </select>
      </div>

      <div class="advanced-field">
        <label>
          Note
          <span class="hint" data-tooltip="Заметка для администраторов">?</span>
        </label>
        <input
          v-model="mRole.rankNote"
          class="form-control role-note"
          type="text"
          placeholder="Rank note"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import RoleIcon from '@/components/svg/RoleIcon.vue';
import RankIcon from '@/components/svg/RankIcon.vue';
import { ClassType } from '@/objects/player';

type RoleDescription = {
  primary: string;
};

type RoleDescriptions = { [role: string]: RoleDescription };

type RankOption = {
  label: string;
  value: number;
};

type RiskLevel = 'none' | 'medium' | 'high';

export default defineComponent({
  name: 'EditRole',

  props: {
    rtype: String,
    role: Object as PropType<ClassType>,
  },

  components: { RoleIcon, RankIcon },

  setup(props, { emit }) {
    const role = computed(() => props.role);
    const mRole = ref(role);
    const isAdvancedOpen = ref(false);

    const roles: RoleDescriptions = {
      tank: { primary: 'Tank' },
      support: { primary: 'Support' },
      dps: { primary: 'Damage' },
    };

    const rankOptions: RankOption[] = [
      { label: 'Bronze 5', value: 1000 },
      { label: 'Bronze 4', value: 1100 },
      { label: 'Bronze 3', value: 1200 },
      { label: 'Bronze 2', value: 1300 },
      { label: 'Bronze 1', value: 1400 },
      { label: 'Silver 5', value: 1500 },
      { label: 'Silver 4', value: 1600 },
      { label: 'Silver 3', value: 1700 },
      { label: 'Silver 2', value: 1800 },
      { label: 'Silver 1', value: 1900 },
      { label: 'Gold 5', value: 2000 },
      { label: 'Gold 4', value: 2100 },
      { label: 'Gold 3', value: 2200 },
      { label: 'Gold 2', value: 2300 },
      { label: 'Gold 1', value: 2400 },
      { label: 'Platinum 5', value: 2500 },
      { label: 'Platinum 4', value: 2600 },
      { label: 'Platinum 3', value: 2700 },
      { label: 'Platinum 2', value: 2800 },
      { label: 'Platinum 1', value: 2900 },
      { label: 'Diamond 5', value: 3000 },
      { label: 'Diamond 4', value: 3100 },
      { label: 'Diamond 3', value: 3200 },
      { label: 'Diamond 2', value: 3300 },
      { label: 'Diamond 1', value: 3400 },
      { label: 'Master 5', value: 3500 },
      { label: 'Master 4', value: 3600 },
      { label: 'Master 3', value: 3700 },
      { label: 'Master 2', value: 3800 },
      { label: 'Master 1', value: 3900 },
      { label: 'Grandmaster 5', value: 4000 },
      { label: 'Grandmaster 4', value: 4100 },
      { label: 'Grandmaster 3', value: 4200 },
      { label: 'Grandmaster 2', value: 4300 },
      { label: 'Grandmaster 1', value: 4400 },
      { label: 'Champion 5', value: 4500 },
      { label: 'Champion 4', value: 4600 },
      { label: 'Champion 3', value: 4700 },
      { label: 'Champion 2', value: 4800 },
      { label: 'Champion 1', value: 4900 },
    ];

    const getBalanceRank = () => {
  if (!props.role) return 0;

  const currentRank = props.role.rank || 0;
  const registrationRank = props.role.registrationRank || 0;
  const manualRank = props.role.manualRank || 0;
  const highestSeenRank = props.role.highestSeenRank || 0;

  const smartHighestRank = highestSeenRank > 0 ? highestSeenRank - 200 : 0;

  return Math.max(
    currentRank,
    registrationRank,
    manualRank,
    smartHighestRank
  );
};

    const getRankLabel = (value: number) => {
      return rankOptions.find((rank) => rank.value === value)?.label || 'No rank';
    };

    const balanceRank = computed(() => getBalanceRank());
    const balanceRankLabel = computed(() => getRankLabel(balanceRank.value));

    const riskDiff = computed(() => {
      if (!props.role) return 0;
      return Math.max(0, balanceRank.value - (props.role.rank || 0));
    });

    const riskLevel = computed<RiskLevel>(() => {
      if (riskDiff.value >= 500) return 'high';
      if (riskDiff.value >= 300) return 'medium';
      return 'none';
    });

    const riskLabel = computed(() => {
      if (riskLevel.value === 'high') return '⚠ High';
      if (riskLevel.value === 'medium') return '⚠ Check';
      return '';
    });

    const riskTooltip = computed(() => {
      if (riskLevel.value === 'high') {
        return `Высокий риск: баланс-рейтинг выше текущего на ${riskDiff.value} SR`;
      }

      if (riskLevel.value === 'medium') {
        return `Нужна проверка: баланс-рейтинг выше текущего на ${riskDiff.value} SR`;
      }

      return '';
    });

    const updateNeedsCheck = () => {
      if (!props.role) return;
      props.role.needsCheck = riskDiff.value >= 300;
    };

    const rankChange = (e: Event) => {
      const value = Number((e.target as HTMLSelectElement).value) || 0;

      if (props.role) {
        props.role.rank = value;
        props.role.highestSeenRank = Math.max(props.role.highestSeenRank || 0, value);

        if (!props.role.registrationRank) {
          props.role.registrationRank = value;
        }

        updateNeedsCheck();
      }

      emit('update-rank', props.rtype, value);
    };

    const registrationRankChange = (e: Event) => {
      const value = Number((e.target as HTMLSelectElement).value) || 0;

      if (props.role) {
        props.role.registrationRank = value;
        props.role.highestSeenRank = Math.max(props.role.highestSeenRank || 0, value);
        updateNeedsCheck();
      }
    };

    const highestSeenRankChange = (e: Event) => {
      const value = Number((e.target as HTMLSelectElement).value) || 0;

      if (props.role) {
        props.role.highestSeenRank = value;
        updateNeedsCheck();
      }
    };

    const manualRankChange = (e: Event) => {
      const value = Number((e.target as HTMLSelectElement).value) || 0;

      if (props.role) {
        props.role.manualRank = value;
        updateNeedsCheck();
      }
    };

    return {
      roles,
      mRole,
      rankOptions,
      isAdvancedOpen,
      balanceRank,
      balanceRankLabel,
      riskLevel,
      riskLabel,
      riskTooltip,
      rankChange,
      registrationRankChange,
      highestSeenRankChange,
      manualRankChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.role-row {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-2);
  transition: 0.15s ease;
}

.role-main {
  display: grid;
  grid-template-columns: 42px 42px 1fr 54px;
  grid-template-areas:
    'drag icon info toggle'
    'rank rank rank advanced';
  align-items: center;
  gap: 8px;
}

.role-drag {
  grid-area: drag;
}

.role-rank-icon {
  grid-area: icon;
}

.role-info {
  grid-area: info;
}

.role-toggle {
  grid-area: toggle;
}

.role-main > .role-select {
  grid-area: rank;
}

.advanced-btn {
  grid-area: advanced;
}

.role-row.active {
  border-color: rgba(245,158,11,0.35);
  background: rgba(245,158,11,0.06);
}
.role-row.warning {
  border-color: rgba(245,158,11,0.4);
  background: rgba(245,158,11,0.08);
}
.role-row.danger {
  border-color: rgba(239,68,68,0.4);
  background: rgba(239,68,68,0.08);
}

.role-drag,
.role-rank-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-drag {
  cursor: grab;
  border-radius: 10px;
  background: var(--surface-3);
}

.role-drag :deep(img),
.role-drag :deep(svg),
.role-rank-icon :deep(img),
.role-rank-icon :deep(svg) {
  width: 30px !important;
  height: 30px !important;
  object-fit: contain;
}

.role-info {
  min-width: 0;
}

.role-name {
  font-weight: 700;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.role-warning {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  white-space: nowrap;
}
.role-warning.medium { color: #fbbf24; background: rgba(245,158,11,0.18); }
.role-warning.high   { color: #fca5a5; background: rgba(239,68,68,0.18); }
.role-subtitle {
  font-size: 12px;
  color: #64748b;
  line-height: 1.2;
}

.role-select,
.role-note {
  width: 100%;
  min-height: 36px;
  font-size: 13px;
  border-radius: 8px;
}

.advanced-btn {
  width: 42px;
  min-width: 42px;
  height: 36px;
  min-height: 36px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-3);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 18px;
  line-height: 1;
  transition: 0.15s ease;
}
.advanced-btn:hover,
.advanced-btn.open {
  background: var(--elevated);
  border-color: var(--border-strong);
  color: var(--text);
}
.advanced-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-strong);
  overflow: visible;
}
.advanced-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: visible;
}
.advanced-field label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  overflow: visible;
}

.advanced-field:last-child {
  grid-column: 1 / -1;
}

.hint {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  color: #94a3b8;
  font-size: 10px;
  margin-left: 3px;
  cursor: help;
  z-index: 30;
}

.hint::after {
  content: attr(data-tooltip);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%) translateY(4px);
  min-width: 180px;
  max-width: 240px;
  padding: 7px 9px;
  border-radius: 8px;
  background: #111827;
  color: #ffffff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
  text-align: center;
  white-space: normal;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 100;
  transition: 0.15s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}

.hint::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: calc(100% + 3px);
  transform: translateX(-50%) translateY(4px);
  border: 5px solid transparent;
  border-top-color: #111827;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 101;
  transition: 0.15s ease;
}

.hint:hover::after,
.hint:hover::before {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.role-note {
  padding: 6px 10px;
}

.role-toggle {
  display: flex;
  justify-content: center;
  margin: 0;
}

.role-toggle input {
  display: none;
}

.role-toggle span {
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255,255,255,0.1);
  position: relative;
  cursor: pointer;
  transition: 0.15s ease;
}
.role-toggle span::after {
  content: '';
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #94a3b8;
  position: absolute;
  left: 3px;
  top: 3px;
  transition: 0.15s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.role-toggle input:checked + span {
  background: #f59e0b;
}
.role-toggle input:checked + span::after {
  background: #111;
  transform: translateX(18px);
}
</style>