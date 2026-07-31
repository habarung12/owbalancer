<template>
  <div class="add-row">
    <input
      v-model.trim="playerTag"
      @keyup.enter="addPlayer"
      type="text"
      class="player-input"
      :placeholder="t.playerPlaceholder"
    />
    <button @click="addPlayer" class="add-btn">{{ t.addPlayer }}</button>

    <!-- Combined tools dropdown -->
    <div class="dropdown">
      <button class="quick-btn" data-bs-toggle="dropdown" aria-expanded="false" ref="ddRef" title="Options">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </button>

      <ul class="quick-menu dropdown-menu">
        <!-- Generate & Import -->
        <li class="qm-section">{{ t.quickActionsGenerate }}</li>
        <li>
          <button class="qm-item" @click="generateRandom">
            <svg class="qm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
            {{ t.generateRandoms }}
          </button>
        </li>
        <li>
          <label class="qm-item">
            <svg class="qm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {{ t.importJson }}
            <input type="file" accept=".json" class="d-none" ref="importRef" @change="onImport" />
          </label>
        </li>

        <li><hr class="qm-divider"/></li>

        <!-- Sort -->
        <li class="qm-section">{{ t.toolsSort }}</li>
        <li><button class="qm-item" @click="$emit('sort', 'name', 'asc')"><span class="qm-icon-txt">↑</span>{{ t.toolsNameAsc }}</button></li>
        <li><button class="qm-item" @click="$emit('sort', 'name', 'desc')"><span class="qm-icon-txt">↓</span>{{ t.toolsNameDesc }}</button></li>
        <li><button class="qm-item" @click="$emit('sort', 'sr', 'desc')"><span class="qm-icon-txt">↓</span>{{ t.toolsSrDesc }}</button></li>
        <li><button class="qm-item" @click="$emit('sort', 'sr', 'asc')"><span class="qm-icon-txt">↑</span>{{ t.toolsSrAsc }}</button></li>
        <li><button class="qm-item" @click="$emit('sort', 'date', 'asc')"><span class="qm-icon-txt">↑</span>{{ t.toolsDateAsc }}</button></li>

        <li><hr class="qm-divider"/></li>

        <!-- Players / Assign -->
        <li class="qm-section">{{ t.toolsPlayers }}</li>
        <li><button class="qm-item" @click="assignAuto"><svg class="qm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{{ t.toolsAutoAssign }}</button></li>
        <li><button class="qm-item" @click="assignBySR"><svg class="qm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{{ t.toolsAssignBySr }}</button></li>
        <li><button class="qm-item" @click="clearCaptains"><svg class="qm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>{{ t.toolsClearCaptains }}</button></li>
        <li><button class="qm-item" @click="clearAll"><svg class="qm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>{{ t.toolsClearAll }}</button></li>

        <li><hr class="qm-divider"/></li>

        <!-- Export -->
        <li class="qm-section">{{ t.toolsExport }}</li>
        <li><button class="qm-item" @click="exportText"><span class="qm-icon-txt">T</span>{{ t.toolsExportText }}</button></li>
        <li><button class="qm-item" @click="exportCSV"><span class="qm-icon-txt">C</span>{{ t.toolsExportCsv }}</button></li>
        <li><button class="qm-item" @click="exportCaptains"><span class="qm-icon-txt">★</span>{{ t.toolsExportCaptains }}</button></li>
        <li><button class="qm-item" @click="exportJSON"><span class="qm-icon-txt">{}</span>{{ t.toolsExportJson }}</button></li>

        <li><hr class="qm-divider"/></li>

        <!-- Delete -->
        <li class="qm-section">{{ t.toolsDelete }}</li>
        <li><button class="qm-item danger" @click="deletePlayers">
          <svg class="qm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
          {{ t.toolsDeleteAll }}
        </button></li>
      </ul>
    </div>
  </div>

  <export-modal :isActive="isModalActive" :exportText="modalText" @close-modal="isModalActive = false" />
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue';
import Dropdown from 'bootstrap/js/src/dropdown';
import Table from 'easy-table';
import { t } from '@/i18n';
import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';
import PlayerEditor, { ClassType, LobbyType, Players } from '@/objects/player';
import { MIN_SR, MAX_SR } from '@/constants';
import ExportModal from '@/components/Teams/ExportModal.vue';

function ri(min: number, max: number) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min));
}
const normalizeClass = (c: Partial<ClassType>): ClassType => ({
  rank: c.rank||0, registrationRank: c.registrationRank??c.rank??0,
  highestSeenRank: c.highestSeenRank??c.rank??0, manualRank: c.manualRank??0,
  needsCheck: c.needsCheck??false, rankNote: c.rankNote??'',
  playHours: c.playHours??0, priority: c.priority??0,
  primary: c.primary??false, isActive: c.isActive??false, secondary: c.secondary??false,
});

export default defineComponent({
  name: 'AddPlayer',
  components: { ExportModal },
  emits: ['sort'],
  props: {
    enableRandoms: { type: Boolean, default: true },
    lobby: { type: String as PropType<LobbyType>, default: 'players' },
  },
  setup(props, { emit }) {
    const store = useStore();
    const playerTag = ref('');
    const ddRef = ref(null);
    const importRef = ref<HTMLInputElement | null>(null);
    const modalText = ref('');
    const isModalActive = ref(false);

    onMounted(() => { if (ddRef.value) new Dropdown(ddRef.value); });

    const addPlayer = () => {
      const player = PlayerEditor.createDefaultPlayer(playerTag.value);
      store.commit(MutationTypes.ADD_PLAYER, { player, lobby: props.lobby });
      store.commit(MutationTypes.EDIT_PLAYER, { playerId: player.identity.uuid, lobby: props.lobby });
      playerTag.value = '';
    };

    const generateRandom = () => {
      const count = +(prompt(t.value.generateRandoms + ':', '20') || 0);
      const players: Players = {};
      const roles: ('dps'|'support'|'tank')[] = ['dps','support','tank'];
      for (let i = 0; i < count; i++) {
        const p = PlayerEditor.createDefaultPlayer(`Player ${i + 1}`);
        const rs = [...roles];
        const first = ri(0, 3);
        p.stats.classes[rs[first]].isActive = true;
        p.stats.classes[rs[first]].priority = 0;
        p.stats.classes[rs[first]].rank = ri(MIN_SR/100, MAX_SR/100) * 100;
        rs.splice(first, 1);
        if (Math.random() > 0.5) {
          const sec = ri(0, 2);
          p.stats.classes[rs[sec]].isActive = true;
          p.stats.classes[rs[sec]].priority = 1;
          p.stats.classes[rs[sec]].rank = ri(MIN_SR/100, MAX_SR/100) * 100;
        }
        players[p.identity.uuid] = p;
      }
      store.commit(MutationTypes.ADD_PLAYERS, { players });
    };

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
              const norm: Players = {};
              Object.entries(data.players as Players).forEach(([id, p]) => {
                norm[id] = { ...p, stats: { ...p.stats, classes: {
                  dps: normalizeClass(p.stats.classes.dps),
                  tank: normalizeClass(p.stats.classes.tank),
                  support: normalizeClass(p.stats.classes.support),
                }}};
              });
              store.commit(MutationTypes.IMPORT_PLAYERS, { players: norm, lobby: props.lobby });
            }
          } else if (data.format_version === 9 && data.format_type === 'tournament') {
            store.commit(MutationTypes.IMPORT_PLAYERS_OLD, ev.target!.result as string);
          } else throw new Error('Incorrect format');
        } catch (err) { alert(`Error: ${(err as Error).message}`); }
      };
      reader.readAsText(files[0]);
    };

    // Assign
    const assignAuto = () => { store.commit(MutationTypes.CLEAR_ALL_EXTRA, undefined); store.commit(MutationTypes.ASSIGN_CAPTAINS, 0); };
    const assignBySR = () => { const sr = +(prompt('Min SR', '3600') || 0); store.commit(MutationTypes.ASSIGN_CAPTAINS, sr); };
    const clearCaptains = () => store.commit(MutationTypes.CLEAR_CAPTAINS, undefined);
    const clearAll = () => store.commit(MutationTypes.CLEAR_ALL_EXTRA, undefined);

    // Export
    const exportJSON = () => {
      const blob = new Blob([JSON.stringify({ format:'xv-1', exportedAt: new Date().toISOString(), players: store.state.players, teams: store.state.teams, reservedPlayers: store.state.reservedPlayers, balancerOptions: store.state.balancerOptions }, null, 2)], { type:'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `ow2-balancer-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href);
    };
    const exportText = () => {
      const text = store.state.teams.reduce((acc, team) => {
        const tbl = new Table();
        const avg = Math.round(team.members.reduce((s,m) => s + store.state.players[m.uuid].stats.classes[m.role].rank, 0) / team.members.length);
        let tt = `Team ${team.name} - ${avg}\n=============================\n`;
        ['tank','dps','support'].forEach(role => {
          team.members.filter(m=>m.role===role).forEach(m => {
            const { isCaptain } = store.state.players[m.uuid].identity;
            tbl.cell('Role',m.role); tbl.cell('Rank',Math.round(store.state.players[m.uuid].stats.classes[m.role].rank)); tbl.cell('Name',`${isCaptain?'♛ ':''}${m.name}`); tbl.newRow();
          });
        });
        return `${acc}\n\n${tt}${tbl.print()}`;
      }, '');
      modalText.value = text; isModalActive.value = true;
    };
    const exportCSV = () => {
      let text = 'Team#;Team;Role;Rank;Name;Captain\n';
      store.state.teams.forEach((team, teamIndex) => { ['tank','dps','support'].forEach(role => { team.members.filter(m=>m.role===role).forEach(m => { text += `${teamIndex + 1};"${team.name}";"${m.role}";"${m.rank}";"${m.name}";${store.state.players[m.uuid].identity.isCaptain?1:0}\n`; }); }); });
      modalText.value = text; isModalActive.value = true;
    };
    const exportCaptains = () => {
      const names = Object.values(store.state.players).filter(p=>p.identity.isCaptain).map(p=>p.identity.name).sort((a,b)=>a.localeCompare(b));
      modalText.value = names.join('\n'); isModalActive.value = true;
    };

    const deletePlayers = () => { if (window.confirm(t.value.toolsDeleteAll + '?')) store.commit(MutationTypes.DELETE_PLAYERS, props.lobby); };

    return { addPlayer, generateRandom, onImport, assignAuto, assignBySR, clearCaptains, clearAll, exportJSON, exportText, exportCSV, exportCaptains, deletePlayers, playerTag, ddRef, importRef, modalText, isModalActive, t };
  },
});
</script>

<style scoped>
.add-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.player-input { flex: 1; min-width: 0; height: 42px; padding: 0 14px; }
.add-btn { height: 42px; padding: 0 16px; flex-shrink: 0; white-space: nowrap; font-family: var(--font); }

.add-btn {
  height: 42px; padding: 0 16px; flex-shrink: 0;
  background: var(--accent); color: #ffffff;
  border: none; border-radius: 11px;
  font-family: var(--font); font-size: .88rem; font-weight: 700;
  cursor: pointer; transition: .15s; white-space: nowrap;
  &:hover { background: var(--accent-hover); transform: translateY(-1px); }
}

.quick-btn {
  width: 42px; height: 42px; flex-shrink: 0; border-radius: 11px;
  background: var(--surface-3); border: 1px solid var(--border);
  color: var(--text-muted); display: grid; place-items: center; cursor: pointer; transition: .15s;
}
.quick-btn svg { width: 17px; height: 17px; }
.quick-btn:hover { border-color: var(--border-strong); color: var(--accent); background: var(--surface-2); }

.quick-menu {
  background: var(--surface-1); border: 1px solid var(--border-strong);
  border-radius: 14px; padding: 6px; box-shadow: 0 16px 40px rgba(0,0,0,.5); min-width: 200px;
}
.qm-section {
  font-size: .65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; color: var(--text-dim); padding: 6px 10px 4px; list-style: none;
}
.qm-item {
  display: flex; align-items: center; gap: 9px; width: 100%; padding: 7px 10px;
  border-radius: 7px; font-size: .82rem; font-weight: 500; font-family: var(--font);
  color: var(--text-muted); background: transparent; border: none; cursor: pointer; transition: .12s; text-align: left;
}
.qm-item:hover { background: var(--surface-3); color: var(--text); }
.qm-item.danger:hover { background: var(--danger-soft); color: var(--danger); }
.qm-icon { width: 14px; height: 14px; flex-shrink: 0; color: var(--text-dim); }
.qm-icon-txt { width: 14px; text-align: center; font-size: .75rem; font-weight: 700; color: var(--text-dim); flex-shrink: 0; }
.qm-divider { border: none; border-top: 1px solid var(--border); margin: 4px 6px; }
</style>
