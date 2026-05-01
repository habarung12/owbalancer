<template>
  <dropdown id="assign" title="♛ Extra">
    <drop-item @drop-click="assignAuto">Distribute Auto</drop-item>
    <drop-item @drop-click="assignCaptains">Assign Captains</drop-item>
    <drop-item @drop-click="clearCaptains">Clear Captains</drop-item>
    <drop-item @drop-click="clearAll">Clear All</drop-item>
  </dropdown>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '@/store';

import Dropdown from '@/components/Helpers/Dropdown.vue';
import DropItem from '@/components/Helpers/DropItem.vue';
import MutationTypes from '@/store/mutation-types';

export default defineComponent({
  name: 'Assign',
  components: { Dropdown, DropItem },

  setup() {
    const store = useStore();

    const assignAuto = () => {
      store.commit(MutationTypes.CLEAR_ALL_EXTRA, undefined);
      store.commit(MutationTypes.ASSIGN_CAPTAINS, 0);
    };

    const assignCaptains = () => {
      const captainSR = +(prompt("Enter captain's minimum SR", '3600') || 0);
      store.commit(MutationTypes.ASSIGN_CAPTAINS, captainSR);
    };

    const clearCaptains = () => {
      store.commit(MutationTypes.CLEAR_CAPTAINS, undefined);
    };

    const clearAll = () => {
      store.commit(MutationTypes.CLEAR_ALL_EXTRA, undefined);
    };

    return {
      assignAuto,
      assignCaptains,
      clearCaptains,
      clearAll,
    };
  },
});
</script>