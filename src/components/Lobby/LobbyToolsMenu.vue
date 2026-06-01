<template>
  <div class="dropdown">
    <button
      class="tools-btn"
      :id="`lobby-tools-${lobby}`"
      data-bs-toggle="dropdown"
      aria-expanded="false"
      ref="dropdownRef"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
      </svg>
      Tools
    </button>

    <ul class="tools-menu dropdown-menu" :aria-labelledby="`lobby-tools-${lobby}`">

      <!-- SORT -->
      <li class="menu-section">Sort</li>
      <li><button class="menu-item" @click="$emit('sort', 'name', 'asc')">
        <span class="mi-icon">↑</span> Name A–Z
      </button></li>
      <li><button class="menu-item" @click="$emit('sort', 'name', 'desc')">
        <span class="mi-icon">↓</span> Name Z–A
      </button></li>
      <li><button class="menu-item" @click="$emit('sort', 'sr', 'desc')">
        <span class="mi-icon">↓</span> Rating high→low
      </button></li>
      <li><button class="menu-item" @click="$emit('sort', 'sr', 'asc')">
        <span class="mi-icon">↑</span> Rating low→high
      </button></li>
      <li><button class="menu-item" @click="$emit('sort', 'date', 'asc')">
        <span class="mi-icon">↑</span> Added first
      </button></li>

      <li><hr class="menu-divider" /></li>

      <!-- ASSIGN / CAPTAINS -->
      <li class="menu-section">Players</li>
      <li><button class="menu-item" @click="assignAuto">
        <span class="mi-icon">★</span> Auto-assign captains
      </button></li>
      <li><button class="menu-item" @click="assignBySR">
        <span class="mi-icon">★</span> Captains by SR
      </button></li>
      <li><button class="menu-item" @click="clearCaptains">
        <span class="mi-icon">✕</span> Clear captains
      </button></li>
      <li><button class="menu-item" @click="clearAll">
        <span class="mi-icon">✕</span> Clear all extra
      </button></li>

      <li><hr class="menu-divider" /></li>

      <!-- EXPORT -->
      <li class="menu-section">Export</li>
      <li><button class="menu-item" @click="exportText">
        <span class="mi-icon">📄</span> Text
      </button></li>
      <li><button class="menu-item" @click="exportCSV">
        <span class="mi-icon">📊</span> CSV
      </button></li>
      <li><button class="menu-item" @click="exportCaptains">
        <span class="mi-icon">★</span> Captains
      </button></li>
      <li><button class="menu-item" @click="exportJSON">
        <span class="mi-icon">{ }</span> JSON
      </button></li>

      <li><hr class="menu-divider" /></li>

      <!-- IMPORT -->
      <li>
        <label class="menu-item import-label">
          <span class="mi-icon">⬆</span> Import JSON
          <input
            type="file"
            accept=".json"
            class="d-none"
            ref="importRef"
            @change="onImport"
          />
        </label>
      </li>

      <li><hr class="menu-divider" /></li>

      <!-- DELETE -->
      <li><button class="menu-item danger" @click="deletePlayers">
        <span class="mi-icon">🗑</span> Delete all players
      </button></li>

    </ul>
  </div>

  <!-- Export modal -->
  <export-modal
    :isActive="isModalActive"
    :exportText="modalText"
    @close-modal="isModalActive = false"
  />
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue';
import Table from 'easy-table';
import Dropdown from 'bootstrap/js/src/dropdown';

import { useStore } from '@/store';
import { t } from '@/i18n';
import MutationTypes from '@/store/mutation-types';
import { ClassType, LobbyType, Players } from '@/objects/player';
import ExportModal from '@/components/Teams/ExportModal.vue';

const normalizeClass = (c: Partial<ClassType>): ClassType => ({
  rank: c.rank || 0,
  registrationRank: c.registrationRank ?? c.rank ?? 0,
  highestSeenRank: c.highestSeenRank ?? c.rank ?? 0,
  manualRank: c.manualRank ?? 0,
  needsCheck: c.needsCheck ?? false,
  rankNote: c.rankNote ?? '',
  playHours: c.playHours ?? 0,
  priority: c.priority ?? 0,
  primary: c.primary ?? false,
  isActive: c.isActive ?? false,
  secondary: c.secondary ?? false,
});

export default defineComponent({
  name: 'LobbyToolsMenu',
  components: { ExportModal },
  emits: ['sort'],
  props: {
    lobby: { type: String as PropType<LobbyType>, default: 'players' },
  },
  setup(props) {
    const store = useStore();
    const dropdownRef = ref(null);
    const importRef = ref<HTMLInputElement | null>(null);
    const modalText = ref('');
    const isModalActive = ref(false);

    onMounted(() => { new Dropdown(dropdownRef.value!); });

    /* ---- Assign ---- */
    const assignAuto = () => {
      store.commit(MutationTypes.CLEAR_ALL_EXTRA, undefined);
      store.commit(MutationTypes.ASSIGN_CAPTAINS, 0);
    };
    const assignBySR = () => {
      const sr = +(prompt("Captain minimum SR", '3600') || 0);
      store.commit(MutationTypes.ASSIGN_CAPTAINS, sr);
    };
    const clearCaptains = () => store.commit(MutationTypes.CLEAR_CAPTAINS, undefined);
    const clearAll = () => store.commit(MutationTypes.CLEAR_ALL_EXTRA, undefined);

    /* ---- Export ---- */
    const exportJSON = () => {
      const blob = new Blob([JSON.stringify({
        format: 'xv-1',
        exportedAt: new Date().toISOString(),
        players: store.state.players,
        teams: store.state.teams,
        reservedPlayers: store.state.reservedPlayers,
        balancerOptions: store.state.balancerOptions,
      }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ow2-balancer-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    };

    const exportText = () => {
      const text = store.state.teams.reduce((acc, team) => {
        const table = new Table();
        const avg = Math.round(team.members.reduce((s, m) =>
          s + store.state.players[m.uuid].stats.classes[m.role].rank, 0) / team.members.length);
        let tt = `Team ${team.name} - ${avg}\n=============================\n`;
        ['tank','dps','support'].forEach(role => {
          team.members.filter(m => m.role === role).forEach(m => {
            const { isCaptain } = store.state.players[m.uuid].identity;
            const { rank } = store.state.players[m.uuid].stats.classes[m.role];
            table.cell('Role', m.role);
            table.cell('Rank', Math.round(rank));
            table.cell('Name', `${isCaptain ? '♛ ' : ''}${m.name}`);
            table.newRow();
          });
        });
        return `${acc}\n\n${tt}${table.print()}`;
      }, '');
      modalText.value = text;
      isModalActive.value = true;
    };

    const exportCSV = () => {
      let text = 'Team;Role;Rank;Name;Captain\n';
      store.state.teams.forEach(team => {
        ['tank','dps','support'].forEach(role => {
          team.members.filter(m => m.role === role).forEach(m => {
            const { isCaptain } = store.state.players[m.uuid].identity;
            text += `"${team.name}";"${m.role}";"${m.rank}";"${m.name}";${isCaptain?1:0}\n`;
          });
        });
      });
      modalText.value = text;
      isModalActive.value = true;
    };

    const exportCaptains = () => {
      const names = Object.values(store.state.players)
        .filter(p => p.identity.isCaptain)
        .map(p => p.identity.name)
        .sort((a, b) => a.localeCompare(b));
      modalText.value = names.join('\n');
      isModalActive.value = true;
    };

    /* ---- Import ---- */
    const onImport = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files?.length) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target!.result as string);
          if (importRef.value) importRef.value.value = '';
          if (data.format === 'xv-1' || data.format === 'xv-2') {
            if (data.players) {
              const normalized: Players = {};
              Object.entries(data.players as Players).forEach(([id, p]) => {
                normalized[id] = { ...p, stats: { ...p.stats, classes: {
                  dps: normalizeClass(p.stats.classes.dps),
                  tank: normalizeClass(p.stats.classes.tank),
                  support: normalizeClass(p.stats.classes.support),
                }}};
              });
              store.commit(MutationTypes.IMPORT_PLAYERS, { players: normalized, lobby: props.lobby });
            }
            if (props.lobby === 'players') {
              if (Array.isArray(data.teams)) store.commit(MutationTypes.ADD_TEAMS, data.teams);
              if (Array.isArray(data.reservedPlayers)) store.commit(MutationTypes.RESERVE_PLAYERS, data.reservedPlayers);
              if (data.balancerOptions) store.commit(MutationTypes.SET_BALANCER_OPTIONS, data.balancerOptions);
            }
          } else if (data.format_version === 9 && data.format_type === 'tournament') {
            store.commit(MutationTypes.IMPORT_PLAYERS_OLD, ev.target!.result as string);
          } else {
            throw new Error('Incorrect format');
          }
        } catch (err) {
          alert(`Format error: ${(err as Error).message}`);
        }
      };
      reader.readAsText(files[0]);
    };

    /* ---- Delete ---- */
    const deletePlayers = () => {
      if (window.confirm('Delete ALL players?'))
        store.commit(MutationTypes.DELETE_PLAYERS, props.lobby);
    };

    return {
      dropdownRef, importRef, modalText, isModalActive,
      assignAuto, assignBySR, clearCaptains, clearAll,
      exportJSON, exportText, exportCSV, exportCaptains,
      onImport, deletePlayers, t,
    };
  },
});
</script>

<style scoped>
.tools-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-family: var(--font);
  font-size: .78rem;
  font-weight: 600;
  cursor: pointer;
  transition: .15s;
}
.tools-btn svg { width: 14px; height: 14px; }
.tools-btn:hover {
  border-color: var(--border-strong);
  color: var(--text);
}

.tools-menu {
  background: var(--surface-1);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 16px 40px rgba(0,0,0,.5);
  min-width: 200px;
}

.menu-section {
  font-size: .65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--text-dim);
  padding: 6px 10px 4px;
  list-style: none;
}

.menu-item, .import-label {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 7px;
  font-size: .82rem;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: var(--font);
  transition: .12s;
  text-align: left;
}
.menu-item:hover, .import-label:hover {
  background: var(--surface-3);
  color: var(--text);
}
.menu-item.danger:hover {
  background: var(--danger-soft);
  color: var(--danger);
}

.mi-icon {
  font-size: .8rem;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  color: var(--text-dim);
}

.menu-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 4px 6px;
}
</style>
