<template>
  <div class="preset-bar">
    <div
      class="preset-chip"
      v-for="(slot, i) in slots"
      :key="i"
      :class="{ active: activeIndex === i, filled: !!slot }"
    >
      <button
        class="preset-select"
        :title="slot ? '' : t.teamPresetEmpty"
        @click="selectPreset(i)"
      >
        {{ t.teamPreset }} {{ i + 1 }}
      </button>
      <button class="preset-save" :title="t.teamPresetSave" @click="savePreset(i)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
          <path d="M17 21v-8H7v8M7 3v5h8" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import cloneDeep from 'lodash/cloneDeep';

import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';
import { Players } from '@/objects/player';
import { Teams } from '@/objects/team';
import { t } from '@/i18n';

const STORAGE = 'owbalancer_presets';
const SLOT_COUNT = 3;

type PresetSlot = { teams: Teams; players: Players; reservedPlayers: string[] } | null;

function loadSlots(): PresetSlot[] {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE) || '{}');
    const slots = Array.isArray(raw.slots) ? raw.slots : [];
    return Array.from({ length: SLOT_COUNT }, (_, i) => slots[i] || null);
  } catch {
    return Array.from({ length: SLOT_COUNT }, () => null);
  }
}

export default defineComponent({
  name: 'Presets',
  setup() {
    const store = useStore();
    const slots = ref<PresetSlot[]>(loadSlots());
    const activeIndex = ref(-1);

    const persist = () => {
      window.localStorage.setItem(STORAGE, JSON.stringify({ slots: slots.value }));
    };

    const selectPreset = (i: number) => {
      const slot = slots.value[i];
      activeIndex.value = i;

      store.commit(MutationTypes.LOAD_LOBBY_STATE, slot
        ? cloneDeep(slot)
        : { teams: [], players: {}, reservedPlayers: [] });
    };

    const savePreset = (i: number) => {
      if (slots.value[i] && !window.confirm(t.value.teamPresetConfirmOverwrite)) return;

      slots.value[i] = cloneDeep({
        teams: store.state.teams,
        players: store.state.players,
        reservedPlayers: store.state.reservedPlayers,
      });
      activeIndex.value = i;
      persist();
    };

    return { slots, activeIndex, selectPreset, savePreset, t };
  },
});
</script>

<style lang="scss" scoped>
.preset-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.preset-chip {
  display: flex;
  align-items: stretch;
  height: 38px;
  border-radius: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  overflow: hidden;
  transition: border-color .15s ease;
}
.preset-chip.filled { border-color: var(--border-strong); }
.preset-chip.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }

.preset-select {
  padding: 0 14px;
  font-size: .84rem;
  font-weight: 600;
  font-family: var(--font);
  color: var(--text-dim);
  background: transparent;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: color .15s ease;
}
.preset-chip.filled .preset-select { color: var(--text-muted); }
.preset-chip.active .preset-select { color: var(--accent); }
.preset-select:hover { color: var(--text); }

.preset-save {
  display: grid;
  place-items: center;
  width: 34px;
  border: none;
  border-left: 1px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  transition: all .15s ease;
  svg { width: 14px; height: 14px; }
}
.preset-save:hover { background: var(--accent-soft); color: var(--accent); }
</style>
