<template>
  <div @dragover="allowDrop" @drop="drop" class="drop-zone" :class="{ active: isDragOver }"
    @dragenter="isDragOver = true" @dragleave="isDragOver = false">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="drop-icon">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
    </svg>
    <span class="drop-label">{{ t.deleteZoneTitle }}</span>
    <span class="drop-hint">{{ t.deleteZoneHint }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';
import { LobbyType } from '@/objects/player';
import { t } from '@/i18n';

export default defineComponent({
  name: 'DeletePlayer',
  props: { lobby: { type: String as PropType<LobbyType>, default: 'players' } },
  setup(props) {
    const store = useStore();
    const isDragOver = ref(false);
    const allowDrop = (ev: DragEvent) => ev.preventDefault();
    const drop = (ev: DragEvent) => {
      ev.preventDefault();
      isDragOver.value = false;
      const playerId = ev?.dataTransfer?.getData('playerTag');
      const teamUuid = ev?.dataTransfer?.getData('team');
      if (!playerId) return;
      store.commit(MutationTypes.DELETE_PLAYER, { playerId, lobby: props.lobby });
      if (teamUuid) store.commit(MutationTypes.REMOVE_FROM_TEAM, { teamUuid, playerId });
    };
    return { drop, allowDrop, isDragOver, t };
  },
});
</script>

<style scoped>
.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px;
  border: 1.5px dashed var(--border-strong);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all .15s ease;
  background: transparent;
}
.drop-zone:hover,
.drop-zone.active {
  border-color: var(--danger);
  background: var(--danger-soft);
}
.drop-icon {
  width: 18px; height: 18px;
  color: var(--text-dim);
  transition: color .15s;
}
.drop-zone:hover .drop-icon,
.drop-zone.active .drop-icon { color: var(--danger); }

.drop-label {
  font-size: .78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-dim);
  transition: color .15s;
}
.drop-zone:hover .drop-label,
.drop-zone.active .drop-label { color: var(--danger); }

.drop-hint {
  font-size: .7rem;
  color: var(--text-dim);
  opacity: .7;
}
</style>
