<template>
  <div class="filter-row">
    <input
      id="playerFilter"
      v-model="query"
      type="text"
      class="form-control form-control-sm filter-input"
      :placeholder="t.filterPlaceholder"
    />

    <div class="role-filter">
      <button
        type="button"
        class="role-btn"
        :class="{ active: role === 'all' }"
        :title="t.roleFilterAll"
        @click="role = 'all'"
      >{{ t.roleFilterAll }}</button>
      <button
        type="button"
        class="role-btn tank"
        :class="{ active: role === 'tank' }"
        :title="t.roleFilterTank"
        @click="role = role === 'tank' ? 'all' : 'tank'"
      ><role-icon rtype="tank" /></button>
      <button
        type="button"
        class="role-btn dps"
        :class="{ active: role === 'dps' }"
        :title="t.roleFilterDps"
        @click="role = role === 'dps' ? 'all' : 'dps'"
      ><role-icon rtype="dps" /></button>
      <button
        type="button"
        class="role-btn support"
        :class="{ active: role === 'support' }"
        :title="t.roleFilterSupport"
        @click="role = role === 'support' ? 'all' : 'support'"
      ><role-icon rtype="support" /></button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';
import { t } from '@/i18n';
import { PlayerEntries } from '@/objects/player';
import RoleIcon from '@/components/svg/RoleIcon.vue';

type RoleFilter = 'all' | 'tank' | 'dps' | 'support';

export default defineComponent({
  name: 'Filter',
  components: { RoleIcon },
  props: { players: Array as PropType<PlayerEntries> },
  setup(props, { emit }) {
    const query = ref('');
    const role = ref<RoleFilter>('all');

    const applyFilter = () => {
      const search = query.value.toLowerCase();
      const filtered = (props.players || []).filter(([, p]) => {
        const matchesName = p.identity.name.toLowerCase().startsWith(search);
        const matchesRole = role.value === 'all' ? true : p.stats.classes[role.value].isActive;
        return matchesName && matchesRole;
      });
      emit('filter', filtered);
    };

    watch([query, role, () => props.players], applyFilter, { immediate: true });

    return { t, query, role };
  },
});
</script>

<style scoped>
.filter-row {
  margin-top: 12px;
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}
.filter-input {
  flex: 1;
  height: 34px;
  border-radius: 9px !important;
}

.role-filter {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.role-btn {
  height: 34px;
  width: 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--surface-3);
  color: var(--text-muted);
  cursor: pointer;
  font-size: .74rem;
  font-weight: 600;
  padding: 0;
  transition: .14s ease;
}
.role-btn:first-child {
  width: auto;
  padding: 0 10px;
}
.role-btn :deep(svg) {
  width: 15px !important;
  height: 15px !important;
  fill: currentColor !important;
  stroke: none !important;
}
.role-btn:hover { background: var(--surface-4, var(--surface-3)); color: var(--text); }
.role-btn.active { border-color: currentColor; }
.role-btn.tank.active    { color: var(--tank); background: rgba(106,163,224,.13); }
.role-btn.dps.active     { color: var(--dps); background: rgba(224,104,95,.13); }
.role-btn.support.active { color: var(--support); background: rgba(111,197,154,.13); }
.role-btn:not(.tank):not(.dps):not(.support).active { color: var(--accent); border-color: var(--accent); }
</style>
