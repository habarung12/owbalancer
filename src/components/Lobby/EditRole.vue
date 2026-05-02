<template>
  <div class="role-row" :class="{ active: mRole.isActive }">
    <div class="role-drag sortable-handler" title="Drag to change priority">
      <role-icon :rtype="rtype" />
    </div>

    <div class="role-rank-icon">
      <rank-icon :rank="mRole.rank" />
    </div>

    <div class="role-info">
      <div class="role-name">{{ roles[rtype].primary }}</div>
      <div class="role-subtitle">
        {{ mRole.isActive ? 'Active role' : 'Disabled role' }}
      </div>
    </div>

    <label class="role-toggle">
      <input
        v-model="mRole.isActive"
        type="checkbox"
        :id="`${rtype}_enabled`"
        :aria-label="rtype"
      />
      <span></span>
    </label>

    <select class="form-select role-select" :value="mRole.rank" @change="rankChange">
      <option :value="0">No rank</option>

      <option v-for="rank in rankOptions" :key="rank.value" :value="rank.value">
        {{ rank.label }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import RoleIcon from '@/components/svg/RoleIcon.vue';
import RankIcon from '@/components/svg/RankIcon.vue';
import { ClassType } from '@/objects/player';

type RoleDescription = {
  primary: string;
};

type RoleDescriptions = { [role: string]: RoleDescription };

type RankOption = {
  label: string;
  value: number;
};

export default defineComponent({
  name: 'EditRole',

  props: {
    rtype: String,
    role: Object as PropType<ClassType>,
  },

  components: { RoleIcon, RankIcon },

  setup(props, { emit }) {
    const role = computed(() => props.role);
    const mRole = ref(role);

    const roles: RoleDescriptions = {
      tank: { primary: 'Tank' },
      support: { primary: 'Support' },
      dps: { primary: 'Damage' },
    };

    const rankOptions: RankOption[] = [
      { label: 'Bronze 5', value: 1000 },
      { label: 'Bronze 4', value: 1100 },
      { label: 'Bronze 3', value: 1200 },
      { label: 'Bronze 2', value: 1300 },
      { label: 'Bronze 1', value: 1400 },
      { label: 'Silver 5', value: 1500 },
      { label: 'Silver 4', value: 1600 },
      { label: 'Silver 3', value: 1700 },
      { label: 'Silver 2', value: 1800 },
      { label: 'Silver 1', value: 1900 },
      { label: 'Gold 5', value: 2000 },
      { label: 'Gold 4', value: 2100 },
      { label: 'Gold 3', value: 2200 },
      { label: 'Gold 2', value: 2300 },
      { label: 'Gold 1', value: 2400 },
      { label: 'Platinum 5', value: 2500 },
      { label: 'Platinum 4', value: 2600 },
      { label: 'Platinum 3', value: 2700 },
      { label: 'Platinum 2', value: 2800 },
      { label: 'Platinum 1', value: 2900 },
      { label: 'Diamond 5', value: 3000 },
      { label: 'Diamond 4', value: 3100 },
      { label: 'Diamond 3', value: 3200 },
      { label: 'Diamond 2', value: 3300 },
      { label: 'Diamond 1', value: 3400 },
      { label: 'Master 5', value: 3500 },
      { label: 'Master 4', value: 3600 },
      { label: 'Master 3', value: 3700 },
      { label: 'Master 2', value: 3800 },
      { label: 'Master 1', value: 3900 },
      { label: 'Grandmaster 5', value: 4000 },
      { label: 'Grandmaster 4', value: 4100 },
      { label: 'Grandmaster 3', value: 4200 },
      { label: 'Grandmaster 2', value: 4300 },
      { label: 'Grandmaster 1', value: 4400 },
      { label: 'Champion 5', value: 4500 },
      { label: 'Champion 4', value: 4600 },
      { label: 'Champion 3', value: 4700 },
      { label: 'Champion 2', value: 4800 },
      { label: 'Champion 1', value: 4900 },
    ];

    const rankChange = (e: Event) => {
      const value = Number((e.target as HTMLSelectElement).value) || 0;
      emit('update-rank', props.rtype, value);
    };

    return {
      roles,
      mRole,
      rankOptions,
      rankChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.role-row {
  display: grid;
  grid-template-columns: 42px 42px 1fr 54px minmax(150px, 190px);
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  background: #ffffff;
  transition: 0.15s ease;
}

.role-row.active {
  border-color: #bfdbfe;
  background: #f8fbff;
}

.role-drag,
.role-rank-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-drag {
  cursor: grab;
  border-radius: 10px;
  background: #f1f3f5;
}

.role-drag :deep(img),
.role-drag :deep(svg),
.role-rank-icon :deep(img),
.role-rank-icon :deep(svg) {
  width: 30px !important;
  height: 30px !important;
  object-fit: contain;
}

.role-info {
  min-width: 0;
}

.role-name {
  font-weight: 700;
  color: #212529;
}

.role-subtitle {
  font-size: 12px;
  color: #6c757d;
}

.role-select {
  min-height: 38px;
}

.role-toggle {
  display: flex;
  justify-content: center;
  margin: 0;
}

.role-toggle input {
  display: none;
}

.role-toggle span {
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: #ced4da;
  position: relative;
  cursor: pointer;
  transition: 0.15s ease;
}

.role-toggle span::after {
  content: '';
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  position: absolute;
  left: 3px;
  top: 3px;
  transition: 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.role-toggle input:checked + span {
  background: #0d6efd;
}

.role-toggle input:checked + span::after {
  transform: translateX(18px);
}

:global(body.dark-mode) .role-row {
  background: #242424;
  border-color: #3a3a3a;
}

:global(body.dark-mode) .role-row.active {
  background: #172033;
  border-color: #2563eb;
}

:global(body.dark-mode) .role-drag {
  background: #333333;
}

:global(body.dark-mode) .role-name {
  color: #f8fafc;
}

:global(body.dark-mode) .role-subtitle {
  color: #94a3b8;
}
</style>