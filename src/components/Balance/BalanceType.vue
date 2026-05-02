<template>
  <div class="mb-3 mt-1">
    <label class="form-label w-100">{{ t.balanceType }}</label>

    <div class="btn-group">
      <input
        type="radio"
        value="full"
        id="balance1"
        class="btn-check"
        :checked="modelValue === 'full'"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <label class="btn btn-primary" for="balance1">
        {{ t.full }}
      </label>

      <input
        type="radio"
        value="half"
        id="balance2"
        class="btn-check"
        :checked="modelValue === 'half'"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <label class="btn btn-primary" for="balance2">
        {{ t.half }}
      </label>

      <input
        type="radio"
        value="final"
        id="balance3"
        class="btn-check"
        :checked="modelValue === 'final'"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <label class="btn btn-primary" for="balance3">
        {{ t.final }}
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { t } from '@/i18n';

export default defineComponent({
  name: 'BalanceType',
  props: {
    modelValue: String,
  },
  setup() {
    return { t };
  },
});
</script>
