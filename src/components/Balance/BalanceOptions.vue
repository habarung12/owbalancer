<template>
  <div class="mb-3">
    <label class="form-label fw-bold">{{ t.tournamentPreset }}</label>

    <div class="btn-group d-block mb-3" role="group">
      <button
        type="button"
        class="btn btn-sm"
        :class="preset === 'casual' ? 'btn-primary' : 'btn-outline-primary'"
        @click="setPreset('casual')"
      >
        {{ t.casual }}
      </button>

      <button
        type="button"
        class="btn btn-sm"
        :class="preset === 'tournament' ? 'btn-primary' : 'btn-outline-primary'"
        @click="setPreset('tournament')"
      >
        {{ t.tournament }}
      </button>

      <button
        type="button"
        class="btn btn-sm"
        :class="preset === 'competitive' ? 'btn-primary' : 'btn-outline-primary'"
        @click="setPreset('competitive')"
      >
        {{ t.competitive }}
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
        options.value.triesCount = 25;
        options.value.range = 80;
        options.value.adjustSr.isEnabled = false;
      }

      if (value === 'tournament') {
        options.value.lowRankLimiter = true;
        options.value.disallowSecondaryRoles = false;
        options.value.dispersionMinimizer = true;
        options.value.triesCount = 15;
        options.value.range = 50;
        options.value.adjustSr.isEnabled = false;
      }

      if (value === 'competitive') {
        options.value.lowRankLimiter = true;
        options.value.disallowSecondaryRoles = true;
        options.value.dispersionMinimizer = true;
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