<template>
  <div class="w-100 h-100">
    <h3>Lobby</h3>

    <div class="mb-2">
      <button @click="exportJson" class="btn btn-sm btn-primary w-100">
        Export JSON
      </button>
    </div>

    <add-player />
    <player-list class="mt-2" />
    <delete-player class="mt-2" />
    <edit-player />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from '@/store';

import AddPlayer from '@/components/Lobby/AddPlayer.vue';
import PlayerList from '@/components/Lobby/PlayerList.vue';
import DeletePlayer from '@/components/Lobby/DeletePlayer.vue';
import EditPlayer from '@/components/Lobby/EditPlayer.vue';

export default defineComponent({
  name: 'Lobby',
  components: {
    AddPlayer,
    PlayerList,
    DeletePlayer,
    EditPlayer,
  },

  setup() {
    const store = useStore();

    const exportJson = () => {
      const data = {
        format: 'xv-1',
        exportedAt: new Date().toISOString(),
        players: store.state.players,
        teams: store.state.teams,
        reservedPlayers: store.state.reservedPlayers,
        balancerOptions: store.state.balancerOptions,
      };

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `ow2-balancer-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();

      URL.revokeObjectURL(url);
    };

    return {
      exportJson,
    };
  },
});
</script>