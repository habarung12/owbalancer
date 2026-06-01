<template>
  <dropdown id="exportTeams">
    <template #title>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
      {{ t.export }}
    </template>
    <drop-item @drop-click="exportText">{{ t.text }}</drop-item>
    <drop-item @drop-click="exportCSV">CSV</drop-item>
    <drop-item @drop-click="exportCaptains">{{ t.captains }}</drop-item>
    <drop-item @drop-click="exportJSON">JSON</drop-item>
  </dropdown>


  <export-modal
    :isActive="isModalActive"
    :exportText="modalText"
    @close-modal="closeModal"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Table from 'easy-table';
import { useStore } from '@/store';
import { t } from '@/i18n';

import Dropdown from '@/components/Helpers/Dropdown.vue';
import DropItem from '@/components/Helpers/DropItem.vue';
import ExportModal from '@/components/Teams/ExportModal.vue';
import { Player } from '@/objects/player';

export default defineComponent({
  name: 'ExportTeams',
  components: { Dropdown, DropItem, ExportModal },

  setup() {
    const modalText = ref('');
    const isModalActive = ref(false);
    const store = useStore();

    const exportJSON = () => {
      const data = {
        format: 'xv-1',
        exportedAt: new Date().toISOString(),
        players: store.state.players,
        teams: store.state.teams,
        reservedPlayers: store.state.reservedPlayers,
        balancerOptions: store.state.balancerOptions,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `ow2-balancer-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();

      URL.revokeObjectURL(url);
    };

    const exportText = () => {
      const { teams } = store.state;

      const text = teams.reduce((acc, team) => {
        const table = new Table();

        const teamAvgSr = Math.round(
          team.members.reduce(
            (accAvg, member) =>
              accAvg +
              store.state.players[member.uuid].stats.classes[member.role].rank,
            0
          ) / team.members.length
        );

        let teamText = `Team ${team.name} - ${teamAvgSr}\n=============================\n`;

        ['tank', 'dps', 'support'].forEach((role) => {
          team.members
            .filter((member) => member.role === role)
            .forEach((member) => {
              const { isCaptain } =
                store.state.players[member.uuid].identity;

              const { rank } =
                store.state.players[member.uuid].stats.classes[member.role];

              const name = `${isCaptain ? '♛ ' : ''}${member.name}`;

              table.cell('Role', member.role);
              table.cell('Rank', Math.round(rank));
              table.cell('Name', name);
              table.newRow();
            });
        });

        teamText = `${teamText}${table.print()}`;

        return `${acc}\n\n${teamText}`;
      }, '');

      modalText.value = text;
      isModalActive.value = true;
    };

    const exportCSV = () => {
      const { teams } = store.state;
      let text = 'Team;Role;Rank;Name;Captain;Squire\n';

      const extendText = teams.reduce((acc, team) => {
        let teamText = '';

        ['tank', 'dps', 'support'].forEach((role) => {
          team.members
            .filter((member) => member.role === role)
            .forEach((member) => {
              const { isCaptain } =
                store.state.players[member.uuid].identity;

              teamText = `${teamText}"${team.name}";"${member.role}";"${member.rank}";"${member.name}";${isCaptain ? '1' : '0'};0\n`;
            });
        });

        return `${acc}${teamText}`;
      }, '');

      text = `${text}${extendText}`;
      modalText.value = text;
      isModalActive.value = true;
    };

    const exportCaptains = () => {
      const { players } = store.state;

      const captainNames: string[] = Object.values<Player>(players)
        .filter((player: Player) => player.identity.isCaptain)
        .map((player) => player.identity.name);

      captainNames.sort((a, b) => a.localeCompare(b));

      modalText.value = captainNames.join('\n');
      isModalActive.value = true;
    };

    const closeModal = () => {
      isModalActive.value = false;
    };

    return {
      exportText,
      exportCSV,
      exportCaptains,
      exportJSON,
      modalText,
      isModalActive,
      closeModal,
      t,
    };
  },
});
</script>