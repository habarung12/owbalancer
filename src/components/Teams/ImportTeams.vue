<template>
  <label class="action-btn neutral import-teams-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
    {{ t.importTeams }}
    <input type="file" accept=".json,.csv" class="d-none" ref="inputRef" @change="onChange" />
  </label>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import { t } from '@/i18n';
import MutationTypes from '@/store/mutation-types';
import PlayerEditor, { ClassType, Players } from '@/objects/player';
import { Team, TeamMembers } from '@/objects/team';

const normalizeClass = (c: Partial<ClassType>): ClassType => ({
  rank: c.rank || 0, registrationRank: c.registrationRank ?? c.rank ?? 0,
  highestSeenRank: c.highestSeenRank ?? c.rank ?? 0, manualRank: c.manualRank ?? 0,
  needsCheck: c.needsCheck ?? false, rankNote: c.rankNote ?? '',
  playHours: c.playHours ?? 0, priority: c.priority ?? 0,
  primary: c.primary ?? false, isActive: c.isActive ?? false, secondary: c.secondary ?? false,
});

const parseCsvLine = (line: string): string[] =>
  line.split(';').map(field => field.trim().replace(/^"(.*)"$/, '$1'));

export default defineComponent({
  name: 'ImportTeams',
  setup() {
    const store = useStore();
    const inputRef = ref<HTMLInputElement | null>(null);

    const importJson = (raw: string) => {
      const data = JSON.parse(raw);
      if (data.format !== 'xv-1' && data.format !== 'xv-2') {
        throw new Error('Incorrect format');
      }

      if (data.players) {
        const norm: Players = {};
        Object.entries(data.players as Players).forEach(([id, p]) => {
          norm[id] = { ...p, stats: { ...p.stats, classes: {
            dps: normalizeClass(p.stats.classes.dps),
            tank: normalizeClass(p.stats.classes.tank),
            support: normalizeClass(p.stats.classes.support),
          }}};
        });
        store.commit(MutationTypes.IMPORT_PLAYERS, { players: norm, lobby: 'players' });
      }

      if (Array.isArray(data.teams)) {
        data.teams.forEach((team: Team) => store.commit(MutationTypes.ADD_TEAM, team));
      }

      if (Array.isArray(data.reservedPlayers)) {
        const merged = Array.from(new Set([...store.state.reservedPlayers, ...data.reservedPlayers]));
        store.commit(MutationTypes.RESERVE_PLAYERS, merged);
      }
    };

    const importCsv = (raw: string) => {
      const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) throw new Error('Empty CSV');

      const header = parseCsvLine(lines[0]).map(h => h.toLowerCase());
      const col = {
        teamId: header.indexOf('team#'),
        team: header.indexOf('team'),
        role: header.indexOf('role'),
        rank: header.indexOf('rank'),
        name: header.indexOf('name'),
        captain: header.indexOf('captain'),
      };

      if (col.team === -1 || col.role === -1 || col.rank === -1 || col.name === -1) {
        throw new Error('Unrecognized CSV columns');
      }

      const rows = lines.slice(1).map(parseCsvLine);
      // Team names aren't guaranteed unique (auto-generated), so group by the
      // Team# column when present; fall back to name for older exports.
      const teamsByKey = new Map<string, { name: string; members: TeamMembers[] }>();

      rows.forEach(fields => {
        const teamName = fields[col.team];
        const role = fields[col.role] as 'tank' | 'dps' | 'support';
        const rank = Math.round(+fields[col.rank]) || 0;
        const name = fields[col.name];
        const isCaptain = col.captain >= 0 && fields[col.captain] === '1';
        const key = col.teamId >= 0 ? fields[col.teamId] : teamName;

        if (!teamName || !role || !name) return;

        const existing = Object.entries(store.state.players)
          .find(([, p]) => p.identity.name === name);

        const uuid = existing ? existing[0] : uuidv4();
        const player = existing
          ? existing[1]
          : PlayerEditor.createDefaultPlayer(name);

        player.stats.classes[role] = {
          ...player.stats.classes[role],
          rank,
          isActive: true,
        };
        if (isCaptain) player.identity.isCaptain = true;

        store.commit(MutationTypes.ADD_PLAYER, { player: { ...player, identity: { ...player.identity, uuid } }, lobby: 'players' });

        const group = teamsByKey.get(key) || { name: teamName, members: [] };
        group.members.push({ uuid, name, rank, role, primary: true, secondary: false });
        teamsByKey.set(key, group);
      });

      teamsByKey.forEach(({ name, members }) => {
        const totalSr = members.reduce((sum, m) => sum + m.rank, 0);
        const team: Team = { uuid: uuidv4(), name, members, totalSr, avgSr: totalSr / members.length };
        store.commit(MutationTypes.ADD_TEAM, team);
      });
    };

    const onChange = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const files = input.files;
      if (!files?.length) return;

      const file = files[0];
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      const reader = new FileReader();

      reader.onload = ev => {
        input.value = '';
        try {
          const raw = ev.target!.result as string;
          if (isCsv) importCsv(raw);
          else importJson(raw);
        } catch (err) {
          alert(`Error: ${(err as Error).message}`);
        }
      };

      reader.readAsText(file);
    };

    return { inputRef, onChange, t };
  },
});
</script>

<style scoped>
.import-teams-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 38px; padding: 0 15px; border-radius: 10px;
  font-size: .84rem; font-weight: 600; font-family: var(--font);
  line-height: 1; cursor: pointer; transition: all .15s ease; white-space: nowrap;
  background: var(--surface-2); border: 1px solid var(--border); color: var(--text-muted);
  svg { width: 15px; height: 15px; flex-shrink: 0; }
}
.import-teams-btn:hover { transform: translateY(-1px); border-color: var(--border-strong); color: var(--text); }
</style>
