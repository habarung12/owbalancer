<template>
  <div class="mb-3">
    <label class="form-label fw-bold">{{ t.tournamentPreset }}</label>

    <div class="preset-group mb-3">
      <button
        v-for="p in ['casual','tournament','competitive']"
        :key="p"
        type="button"
        class="preset-btn"
        :class="{ active: preset === p }"
        @click="setPreset(p as any)"
      >
        {{ p === 'casual' ? t.casual : p === 'tournament' ? t.tournament : t.competitive }}
      </button>
    </div>

    <div class="small text-muted mb-3">
      {{ presetDescription }}
    </div>

    <label class="form-label">{{ t.advancedOptions }}</label>

    <div class="form-check">
      <input
        type="checkbox"
        id="lowRankLimiter"
        class="form-check-input"
        v-model="options.lowRankLimiter"
      />
      <label for="lowRankLimiter" class="form-check-label">
        {{ t.lowRankLimiter }}
      </label>
    </div>

    <div class="form-check">
      <input
        type="checkbox"
        id="disallowSecondaryRoles"
        class="form-check-input"
        v-model="options.disallowSecondaryRoles"
      />
      <label for="disallowSecondaryRoles" class="form-check-label">
        {{ t.secondaryRoles }}
      </label>
    </div>

    <div class="form-check">
      <input
        type="checkbox"
        id="dispersionMinimizer"
        class="form-check-input"
        v-model="options.dispersionMinimizer"
      />
      <label for="dispersionMinimizer" class="form-check-label">
        {{ t.dispersion }}
      </label>
    </div>

    <div class="form-check">
      <input
        type="checkbox"
        id="preferBalancedCaptains"
        class="form-check-input"
        v-model="options.preferBalancedCaptains"
      />
      <label for="preferBalancedCaptains" class="form-check-label">
        Prefer balanced captains
      </label>
    </div>

    <div class="form-check">
      <input
        type="checkbox"
        id="preferFullFlexDistribution"
        class="form-check-input"
        v-model="options.preferFullFlexDistribution"
      />
      <label for="preferFullFlexDistribution" class="form-check-label">
        Prefer full-flex distribution
      </label>
    </div>

    <div class="form-check">
      <input
        type="checkbox"
        id="preventSuperteamSynergy"
        class="form-check-input"
        v-model="options.preventSuperteamSynergy"
      />
      <label for="preventSuperteamSynergy" class="form-check-label">
        Prevent superteam synergy
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from '@/store';
import { computed, defineComponent, ref } from 'vue';
import { t } from '@/i18n';

type Preset = 'casual' | 'tournament' | 'competitive';

export default defineComponent({
  name: 'BalanceOptions',

  setup() {
    const store = useStore();
    const storeOptions = computed(() => store.state.balancerOptions);
    const options = ref(storeOptions);
    const preset = ref<Preset>('tournament');

    const presetDescription = computed(() => {
      if (preset.value === 'casual') return t.value.casualDesc;
      if (preset.value === 'competitive') return t.value.competitiveDesc;
      return t.value.tournamentDesc;
    });

    const setPreset = (value: Preset) => {
      preset.value = value;

      if (value === 'casual') {
        options.value.lowRankLimiter = false;
        options.value.disallowSecondaryRoles = false;
        options.value.dispersionMinimizer = false;

        options.value.preferBalancedCaptains = false;
        options.value.preferFullFlexDistribution = false;
        options.value.preventSuperteamSynergy = false;

        options.value.triesCount = 25;
        options.value.range = 80;
        options.value.adjustSr.isEnabled = false;
      }

      if (value === 'tournament') {
        options.value.lowRankLimiter = true;
        options.value.disallowSecondaryRoles = false;
        options.value.dispersionMinimizer = true;

        options.value.preferBalancedCaptains = true;
        options.value.preferFullFlexDistribution = true;
        options.value.preventSuperteamSynergy = false;

        options.value.triesCount = 15;
        options.value.range = 50;
        options.value.adjustSr.isEnabled = false;
      }

      if (value === 'competitive') {
        options.value.lowRankLimiter = true;
        options.value.disallowSecondaryRoles = true;
        options.value.dispersionMinimizer = true;

        options.value.preferBalancedCaptains = true;
        options.value.preferFullFlexDistribution = true;
        options.value.preventSuperteamSynergy = true;

        options.value.triesCount = 10;
        options.value.range = 30;
        options.value.adjustSr.isEnabled = false;
      }
    };

    setPreset('tournament');

    return {
      options,
      preset,
      presetDescription,
      setPreset,
      t,
    };
  },
});
</script>

<style lang="scss" scoped>
.preset-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.preset-btn {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: .82rem;
  font-weight: 600;
  background: var(--surface-3);
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  transition: .15s;
  font-family: var(--font);
}
.preset-btn:hover {
  border-color: var(--border-strong);
  color: var(--text);
}
.preset-btn.active {
  background: var(--accent);
  border-color: transparent;
  color: #1a1206;
  box-shadow: 0 2px 8px rgba(249,158,26,.3);
}
</style>