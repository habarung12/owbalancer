<template>
  <div class="d-flex justify-content-between">
    <div>{{ t.total }}: {{ players.length }}</div>
    <div>{{ t.visible }}: {{ currentCount }}</div>
    <div>{{ t.captains }}: {{ captainCount }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { PlayerEntries } from '@/objects/player';
import { t } from '@/i18n';

export default defineComponent({
  name: 'Stats',
  props: {
    players: Array as PropType<PlayerEntries>,
    currentCount: Number,
  },

  setup(props) {
    const captainCount = computed(
      () => props.players?.filter(([, player]) => player.identity.isCaptain === true).length
    );

    return {
      captainCount,
      t,
    };
  },
});
</script>
