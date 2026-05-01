<template>
  <div class="d-flex justify-content-between">
    <div>Total: {{ players.length }}</div>
    <div>Seen: {{ currentCount }}</div>
    <div>Cap's: {{ captainCount }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { PlayerEntries } from '@/objects/player';

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

    return { captainCount };
  },
});
</script>
