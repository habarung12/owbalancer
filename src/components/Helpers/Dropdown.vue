<template>
  <div class="dropdown custom-dropdown">
    <button
      class="dropdown-btn"
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

  props: {
    id: String,
    title: String,
  },

  setup() {
    const dropdownRef = ref(null);

    onMounted(() => {
      new Dropdown(dropdownRef.value);
    });

    return {
      dropdownRef,
    };
  },
});
</script>

<style scoped>
.dropdown-btn {
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: #6b7280;
  color: white;
  font-size: 13px;
  font-weight: 700;
  transition: 0.15s ease;
}

.dropdown-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.custom-menu {
  border: none;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.custom-menu :deep(.dropdown-item) {
  border-radius: 8px;
  font-size: 13px;
  padding: 8px 10px;
}

.custom-menu :deep(.dropdown-item:hover) {
  background: #f3f4f6;
}

:global(body.dark-mode) .dropdown-btn {
  background: #374151;
}

:global(body.dark-mode) .custom-menu {
  background: #1f2937;
}

:global(body.dark-mode) .custom-menu :deep(.dropdown-item) {
  color: #f8fafc;
}

:global(body.dark-mode) .custom-menu :deep(.dropdown-item:hover) {
  background: #374151;
}
</style>