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
      <input
        type="checkbox"
        class="btn-check"
        name="options"
        :id="`option_main_${rtype}`"
        autocomplete="off"
        :checked="mRole.primary"
        @change="changeSpecializationPrimary"
      />
      <label class="btn btn-sm btn-outline-dark" :for="`option_main_${rtype}`">
        {{ roles[rtype].primary }}
      </label>
    </span>

    <input
      type="number"
      id="level"
      class="form-control"
      min="0"
      :value="mRole.rank"
      @input="inpChange"
    />
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

    const inpChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).valueAsNumber || 0;
      emit('update-rank', props.rtype, value);
    };

    const changeSpecializationPrimary = (e: Event) => {
      const { checked } = e.target as HTMLInputElement;
      emit('update-specialization', props.rtype, 'primary', checked);
      emit('update-specialization', props.rtype, 'secondary', false);
    };

    return { roles, mRole, inpChange, changeSpecializationPrimary };
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
</style>