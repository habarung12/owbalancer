<template>
  <div ref="container">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import Sortable, { SortableEvent } from 'sortablejs';

export default defineComponent({
  name: 'Sortable',
  props: {
    handle: String,
  },
  setup(props, { emit }) {
    const container= ref<HTMLElement | null>(null);
    let instance: Sortable | null = null;

    const onUpdate = (e: SortableEvent) => {
      emit('update-position', e);
    };

    onMounted(() => {
      if (container.value) {
        instance = Sortable.create(container.value, {
          onUpdate,
          direction: 'vertical',
          handle: props.handle,
        });
      }
    });

    onBeforeUnmount(() => {
      instance?.destroy();
      instance = null;
    });

    return { container };
  },
});
</script>
