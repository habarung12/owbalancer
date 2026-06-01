<template>
  <label class="import-settings-btn" title="Import settings">
    <upload-icon />
    <input type="file" accept=".json" class="d-none" ref="inp" @change="onChange" />
  </label>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';

import UploadIcon from '@/components/svg/UploadIcon.vue';

export default defineComponent({
  name: 'Import',
  components: { UploadIcon },
  setup() {
    const store = useStore();
    const inp = ref<HTMLInputElement | null>(null);

    const onReaderLoad = (event: ProgressEvent<FileReader>) => {
      if (!event.target) return;

      const source = event.target.result as string;

      try {
        const data = JSON.parse(source);

        if (inp?.value) {
          inp.value.value = '';
        }

        if (data.format === 'xvb-1') {
          store.commit(MutationTypes.SET_BALANCER_OPTIONS, data.data);
        } else {
          throw new Error('Incorrect balance options export format');
        }
      } catch (e) {
        // eslint-disable-next-line
        alert(`Format error: ${e.message}`);
      }
    };

    const onChange = (event: Event) => {
      const reader = new FileReader();
      const { files } = event.target as HTMLInputElement;

      if (files !== null && files.length) {
        reader.onload = onReaderLoad;
        reader.readAsText(files[0]);
      }
    };

    return { inp, onChange };
  },
});
</script>

<style scoped>
.import-settings-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  color: var(--text-muted);
  cursor: pointer;
  transition: .15s;
}
.import-settings-btn:hover {
  border-color: var(--border-strong);
  color: var(--text);
  background: var(--elevated);
}
.import-settings-btn :deep(svg) {
  width: 15px;
  height: 15px;
}
</style>
