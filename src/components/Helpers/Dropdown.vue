<template>
  <div class="dropdown custom-dropdown">
    <button
      class="action-btn neutral dropdown-btn"
      :id="`dropdown_${id}`"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      ref="dropdownRef"
    >
      <slot name="title">{{ title }}</slot>
    </button>
    <ul class="dropdown-menu custom-menu" :aria-labelledby="`dropdown_${id}`">
      <slot />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Dropdown from 'bootstrap/js/src/dropdown';

export default defineComponent({
  name: 'Dropdown',
  props: { id: String, title: String },
  setup() {
    const dropdownRef = ref(null);
    onMounted(() => { new Dropdown(dropdownRef.value); });
    return { dropdownRef };
  },
});
</script>

<style scoped>
.custom-menu {
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 12px;
  padding: 6px;
  background: #121317;
  box-shadow: 0 8px 30px rgba(0,0,0,.35);
  min-width: 140px;
}
.custom-menu :deep(.dropdown-item) {
  border-radius: 8px;
  font-size: .84rem;
  padding: 8px 10px;
  color: #a4a9b4;
  transition: .12s;
  font-family: var(--font);
}
.custom-menu :deep(.dropdown-item:hover) {
  background: #1c1f26;
  color: #f4f5f7;
}
</style>
