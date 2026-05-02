<template>
  <sortable
    class="stats-list"
    v-on:update-position="updatePosition"
    handle=".sortable-handler"
  >
    <edit-role
      v-for="role in roles"
      :key="role.role"
      :rtype="role.role"
      :role="playerStats.classes[role.role]"
      @update-rank="(role, rank) => $emit('update-rank', role, rank)"
      @update-specialization="(...data) => $emit('update-specialization', ...data)"
    />
  </sortable>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed } from 'vue';
import { SortableEvent } from 'sortablejs';

import { Classes, ClassType, DescribedClassType, Stats } from '@/objects/player';

import Sortable from '@/components/Helpers/Sortable.vue';
import EditRole from '@/components/Lobby/EditRole.vue';

export default defineComponent({
  name: 'EditStats',
  props: {
    uuid: String,
    stats: Object as PropType<Stats>,
  },
  components: { Sortable, EditRole },
  setup(props, { emit }) {
    const stats = computed(() => props.stats);
    const result: DescribedClassType[] = [];
    const playerStats = ref(stats);

    const roles = computed(() =>
      Object.entries(stats?.value?.classes || {})
        .reduce((acc, [role, v]) => {
          return [...acc, { role, ...v }];
        }, result)
        .sort((a, b) => a.priority - b.priority)
    );

    const getRole = (classesList: Classes, role: string): ClassType => {
      if (role === 'tank') return classesList.tank;
      if (role === 'support') return classesList.support;
      return classesList.dps;
    };

    const updatePosition = ({ oldIndex, newIndex }: SortableEvent) => {
      if (
        oldIndex === undefined ||
        newIndex === undefined ||
        oldIndex === newIndex ||
        !stats.value
      ) {
        return;
      }

      const directionUp = newIndex - oldIndex < 0;
      const classes = { ...stats.value.classes };

      Object.keys(classes).forEach(role => {
        const sRole = getRole(classes, role);

        if (sRole.priority === oldIndex) {
          sRole.priority = newIndex;
          return;
        }

        if (directionUp && sRole.priority < oldIndex && sRole.priority >= newIndex) {
          sRole.priority += 1;
        }

        if (!directionUp && sRole.priority > oldIndex && sRole.priority <= newIndex) {
          sRole.priority -= 1;
        }
      });

      emit('update-stats', { classes });
    };

    return { playerStats, roles, updatePosition };
  },
});
</script>

<style lang="scss" scoped>
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>