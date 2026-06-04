<template>
  <div class="seg-block">
    <label class="seg-label">{{ t.balanceType }}</label>
    <div class="seg-group">
      <template v-for="opt in options" :key="opt.value">
        <input
          type="radio"
          :value="opt.value"
          :id="`btype-${opt.value}`"
          class="seg-input"
          :checked="modelValue === opt.value"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <label class="seg-btn" :for="`btype-${opt.value}`">{{ opt.label }}</label>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { t } from '@/i18n';

export default defineComponent({
  name: 'BalanceType',
  props: { modelValue: String },
  setup() {
    const options = [
      { value: 'full',  label: 'Full' },
      { value: 'half',  label: 'Half' },
      { value: 'final', label: 'Final' },
    ];
    return { t, options };
  },
});
</script>

<style lang="scss" scoped>
.seg-block { margin-bottom: 14px; }
.seg-label {
  display: block;
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-dim);
  margin-bottom: 8px;
}
.seg-group {
  display: flex;
  gap: 6px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 4px;
  width: fit-content;
}
.seg-input { display: none; }
.seg-btn {
  padding: 6px 18px;
  border-radius: 7px;
  font-size: .84rem;
  font-weight: 600;
  color: var(--text-dim);
  cursor: pointer;
  transition: .15s;
  user-select: none;
  white-space: nowrap;
}
.seg-btn:hover { color: var(--text); }
.seg-input:checked + .seg-btn {
  background: var(--accent);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(35,128,177,.3);
}
</style>
