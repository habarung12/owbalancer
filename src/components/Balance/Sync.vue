<template>
  <div class="sync-bar">
    <button class="sync-btn" @click="download" title="Download balancer settings">
      <download-icon />
      <span>Export settings</span>
    </button>
    <import />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import Utils from '@/utils';
import Import from '@/components/Balance/Import.vue';
import DownloadIcon from '@/components/svg/DownloadIcon.vue';
import { useStore } from '@/store';

export default defineComponent({
  name: 'Sync',
  components: { Import, DownloadIcon },
  setup() {
    const store = useStore();
    const options = computed(() => store.state.balancerOptions);
    const download = () => {
      Utils.download(
        `balancerOptions-${new Date().toLocaleString('ru-RU')}.json`,
        JSON.stringify({ format: 'xvb-1', data: options.value })
      );
    };
    return { download };
  },
});
</script>

<style scoped>
.sync-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.sync-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border-radius: 9px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-family: var(--font);
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  transition: .15s ease;
}
.sync-btn:hover {
  border-color: var(--border-strong);
  color: var(--text);
  background: var(--elevated);
}
.sync-btn :deep(svg) {
  width: 14px;
  height: 14px;
}
</style>
