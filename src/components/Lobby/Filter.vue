<template>
  <div class="filter-row">
    <input
      id="playerFilter"
      type="text"
      class="form-control form-control-sm filter-input"
      :placeholder="t.filterPlaceholder"
      @input="filter"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { t } from '@/i18n';
import { PlayerEntries } from '@/objects/player';

export default defineComponent({
  name: 'Filter',
  props: { players: Array as PropType<PlayerEntries> },
  setup(props, { emit }) {
    const filter = (e: Event) => {
      const val = (e.target as HTMLInputElement).value.toLowerCase();
      emit('filter', props.players?.filter(([, p]) =>
        p.identity.name.toLowerCase().startsWith(val)
      ));
    };
    return { filter, t };
  },
});
</script>

<style scoped>
.filter-row {
  margin-top: 12px;
  margin-bottom: 12px;
}
.filter-input {
  width: 100%;
  height: 34px;
  border-radius: 9px !important;
}
</style>
