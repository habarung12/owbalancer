<template>
  <div class="input-group">
    <span class="input-group-text cursor-pointer sortable-handler">
      <role-icon :rtype="rtype" />
    </span>

    <span class="input-group-text">
      <rank-icon :rank="mRole.rank" />
    </span>

    <span class="input-group-text">
      <input
        v-model="mRole.isActive"
        type="checkbox"
        :id="`${rtype}_enabled`"
        class="form-check-input"
        :aria-label="rtype"
      />
    </span>

    <span class="input-group-text w-7rem">
      {{ roles[rtype].primary }}
    </span>

    <select class="form-select" :value="mRole.rank" @change="rankChange">
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

<style lang="scss">
.cursor-pointer {
  cursor: pointer;
}

.s-2em {
  width: 2em;
  height: 2em;
}

.w-7rem {
  width: 7rem;
}

.input-group-text {
  min-width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-group-text img,
.input-group-text svg {
  width: 28px !important;
  height: 28px !important;
  object-fit: contain;
  flex-shrink: 0;
}
</style>