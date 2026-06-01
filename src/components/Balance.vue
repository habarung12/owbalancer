<template>
  <teleport to="body">
    <transition name="bal-fade">
      <div v-if="isActive" class="bal-overlay" @click.self="closeModal">
        <div class="bal-modal">

          <!-- HEADER -->
          <div class="bal-header">
            <div class="bal-header-left">
              <div class="bal-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
              </div>
              <div>
                <h2 class="bal-title">{{ t.balanceSetup }}</h2>
                <p class="bal-subtitle">{{ t.balanceSetupDesc }}</p>
              </div>
            </div>
            <button class="bal-close" @click="closeModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- BODY: two columns -->
          <div class="bal-body">

            <!-- ── LEFT COLUMN ── -->
            <div class="bal-col bal-col-left">

              <!-- Balance type -->
              <section class="bal-section">
                <div class="bsec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  {{ t.balanceType }}
                </div>
                <div class="type-cards">
                  <button
                    v-for="opt in typeOptions" :key="opt.value"
                    class="type-card"
                    :class="{ active: balanceType === opt.value }"
                    @click="balanceType = opt.value"
                  >
                    <span class="tc-icon" v-html="opt.icon"></span>
                    <span class="tc-label">{{ opt.label }}</span>
                    <span class="tc-desc">{{ opt.desc }}</span>
                  </button>
                </div>
              </section>

              <!-- Disable type (only for full balance) -->
              <section class="bal-section" v-if="balanceType === 'full'">
                <div class="bsec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>
                  {{ t.disableSlot }}
                </div>
                <div class="seg-group">
                  <button v-for="d in disableOptions" :key="d.v"
                    class="seg-btn" :class="{ active: disableType === d.v }"
                    @click="disableType = d.v">{{ d.l }}</button>
                </div>
              </section>

              <!-- Rank mode -->
              <section class="bal-section">
                <div class="bsec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  {{ t.rankMode }}
                </div>
                <select v-model="rankMode" class="bal-select">
                  <option value="adaptive">{{ t.rankModeAdaptive }}</option>
                  <option value="strict">{{ t.rankModeStrict }}</option>
                  <option value="smart">{{ t.rankModeSmart }}</option>
                  <option value="soft">{{ t.rankModeSoft }}</option>
                </select>
                <p class="mode-hint">{{ rankModeHints[rankMode] }}</p>
              </section>

              <!-- Preset -->
              <section class="bal-section">
                <div class="bsec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  {{ t.preset }}
                </div>
                <div class="preset-row">
                  <button v-for="p in presets" :key="p.v"
                    class="preset-card"
                    :class="{ active: activePreset === p.v }"
                    @click="applyPreset(p.v)">
                    <span class="pc-name">{{ p.name }}</span>
                    <span class="pc-desc">{{ p.desc }}</span>
                  </button>
                </div>
              </section>

              <!-- Settings sync -->
              <section class="bal-section sync-section">
                <button class="sync-btn" @click="downloadSettings">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  {{ t.exportSettings }}
                </button>
                <label class="sync-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  {{ t.importSettings }}
                  <input type="file" accept=".json" class="d-none" @change="importSettings" />
                </label>
              </section>

            </div>

            <!-- ── RIGHT COLUMN ── -->
            <div class="bal-col bal-col-right">

              <!-- Advanced toggles -->
              <section class="bal-section">
                <div class="bsec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
                  {{ t.advancedOptions }}
                </div>
                <div class="toggle-list">
                  <label class="toggle-row" v-for="opt in advancedOpts" :key="opt.key">
                    <div class="toggle-info">
                      <span class="toggle-name">{{ opt.label }}</span>
                      <span class="toggle-desc">{{ opt.desc }}</span>
                    </div>
                    <div class="toggle-switch" :class="{ on: options[opt.key] }" @click="options[opt.key] = !options[opt.key]">
                      <div class="toggle-thumb"></div>
                    </div>
                  </label>
                </div>
              </section>

              <!-- Dispersion slider -->
              <section class="bal-section">
                <div class="bsec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  {{ t.dispersion }}
                  <span class="bsec-value">±{{ options.range }}</span>
                </div>
                <div class="slider-wrap dispersion-wrap">
                  <input type="range" class="bal-range" min="0" max="120" step="1" v-model.number="options.range" />
                </div>
                <div class="slider-labels">
                  <span>{{ t.dispersionTight }}</span><span>{{ t.dispersionBalanced }}</span><span>{{ t.dispersionWide }}</span>
                </div>
              </section>

              <!-- Tries count slider -->
              <section class="bal-section">
                <div class="bsec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                  {{ t.triesCount }}
                  <span class="bsec-value">{{ options.triesCount }}</span>
                </div>
                <div class="slider-wrap">
                  <input type="range" class="bal-range tries-range" min="1" max="2500" step="1" :value="options.triesCount"
                    @input="options.triesCount = +($event.target as HTMLInputElement).value" />
                </div>
                <div class="slider-labels">
                  <span>{{ t.triesFast }}</span><span></span><span>{{ t.triesThorough }}</span>
                </div>
              </section>

              <!-- Progress -->
              <section class="bal-section" v-if="progress.current > 0">
                <div class="bsec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  {{ t.progress }}
                  <span class="bsec-value">{{ Math.round(progressPct * 100) }}%</span>
                </div>
                <div class="bal-progress-track">
                  <div class="bal-progress-bar" :style="{ width: `${progressPct * 100}%` }"></div>
                </div>
              </section>

            </div>
          </div>

          <!-- FOOTER -->
          <div class="bal-footer">
            <button class="bal-btn-close" @click="closeModal">{{ t.cancelBalance }}</button>
            <button class="bal-btn-run" @click="balance">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              {{ t.runBalance }}
            </button>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';
import { t } from '@/i18n';
import MutationTypes from '@/store/mutation-types';
import { useStore } from '@/store';
import wasm from '@/mworker';
import Utils from '@/utils';

import { Teams } from '@/objects/team';
import { Results } from '@/objects/balance';
import { Players, ClassType } from '@/objects/player';

type RankMode = 'strict' | 'smart' | 'adaptive' | 'soft';

export default defineComponent({
  name: 'Balance',
  setup() {
    const store = useStore();
    const isActive = computed(() => store.state.isBalance);
    const balanceType = ref('full');
    const disableType = ref('none');
    const rankMode = ref<RankMode>('adaptive');
    const progress = reactive({ total: 10, current: 0 });

    const options = computed(() => store.state.balancerOptions);
    const activePreset = ref('tournament');

    document.addEventListener('wasm-update', () => { progress.current += 1; });

    const progressPct = computed(() =>
      progress.current / (progress.total * (options.value.triesCount || 1))
    );

    const rankModeHints = computed(() => ({
      adaptive: t.value.rankHintAdaptive,
      strict:   t.value.rankHintStrict,
      smart:    t.value.rankHintSmart,
      soft:     t.value.rankHintSoft,
    }));

    const typeOptions = computed(() => [
      { value: 'full',  label: t.value.balanceFull,  desc: t.value.balanceFullDesc,  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
      { value: 'half',  label: t.value.balanceHalf,  desc: t.value.balanceHalfDesc,  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>' },
      { value: 'final', label: t.value.balanceFinal, desc: t.value.balanceFinalDesc, icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' },
    ]);

    const disableOptions = computed(() => [
      { v: 'none',     l: t.value.disableNone },
      { v: 'ex_caps',  l: t.value.disableExCaps },
      { v: 'leut_ens', l: t.value.disableLieutenants },
      { v: 'ens',      l: t.value.disableEnsigns },
    ]);

    const presets = computed(() => [
      { v: 'casual',      name: t.value.casual,      desc: t.value.casualDesc },
      { v: 'tournament',  name: t.value.tournament,  desc: t.value.tournamentDesc },
      { v: 'competitive', name: t.value.competitive, desc: t.value.competitiveDesc },
    ]);

    const advancedOpts = computed(() => [
      { key: 'lowRankLimiter',             label: t.value.optLowRankLimiter,      desc: t.value.optLowRankLimiterDesc },
      { key: 'disallowSecondaryRoles',     label: t.value.optPrimaryRoles,        desc: t.value.optPrimaryRolesDesc },
      { key: 'dispersionMinimizer',        label: t.value.optDispersion,          desc: t.value.optDispersionDesc },
      { key: 'preferBalancedCaptains',     label: t.value.optBalancedCaptains,    desc: t.value.optBalancedCaptainsDesc },
      { key: 'preferFullFlexDistribution', label: t.value.optFullFlex,            desc: t.value.optFullFlexDesc },
      { key: 'preventSuperteamSynergy',    label: t.value.optSuperteam,           desc: t.value.optSuperteamDesc },
    ]);

    const applyPreset = (v: string) => {
      activePreset.value = v;
      const o = options.value;
      if (v === 'casual')      { o.lowRankLimiter=false; o.disallowSecondaryRoles=false; o.dispersionMinimizer=false; o.preferBalancedCaptains=false; o.preferFullFlexDistribution=false; o.preventSuperteamSynergy=false; o.triesCount=25; o.range=80; }
      if (v === 'tournament')  { o.lowRankLimiter=true;  o.disallowSecondaryRoles=false; o.dispersionMinimizer=true;  o.preferBalancedCaptains=true;  o.preferFullFlexDistribution=true;  o.preventSuperteamSynergy=false; o.triesCount=15; o.range=50; }
      if (v === 'competitive') { o.lowRankLimiter=true;  o.disallowSecondaryRoles=true;  o.dispersionMinimizer=true;  o.preferBalancedCaptains=true;  o.preferFullFlexDistribution=true;  o.preventSuperteamSynergy=true;  o.triesCount=10; o.range=30; }
    };

    const closeModal = () => store.commit(MutationTypes.TOGGLE_BALANCE, undefined);

    const downloadSettings = () => {
      Utils.download(
        `balancerOptions-${new Date().toLocaleString('ru-RU')}.json`,
        JSON.stringify({ format: 'xvb-1', data: options.value })
      );
    };

    const importSettings = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files?.length) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target!.result as string);
          if (data.format === 'xvb-1') store.commit(MutationTypes.SET_BALANCER_OPTIONS, data.data);
          else throw new Error('Incorrect format');
        } catch (err) { alert(`Error: ${(err as Error).message}`); }
      };
      reader.readAsText(files[0]);
    };

    /* ---- Rank calculation ---- */
    const getAdaptiveRank = (cur: number, peak: number) => {
      const diff = peak - cur;
      if (peak <= 0) return cur;
      if (diff >= 600) return peak;
      if (diff >= 300) return Math.max(peak - 200, 0);
      return cur;
    };

    const getModeRank = (role: ClassType): number => {
      const { rank: cur=0, registrationRank: reg=0, highestSeenRank: peak=0, manualRank: man=0 } = role;
      if (rankMode.value === 'strict')   return Math.max(cur, reg, peak, man);
      if (rankMode.value === 'soft')     return Math.max(cur, reg, man);
      if (rankMode.value === 'adaptive') return Math.max(getAdaptiveRank(cur, peak), reg, man);
      return Math.max(cur, reg, man, peak > 0 ? Math.max(peak - 200, 0) : 0);
    };

    const getBalancePlayers = (): Players => {
      const result: Players = {};
      Object.entries(store.state.players).forEach(([id, player]) => {
        result[id] = { ...player, stats: { ...player.stats, classes: {
          dps:     { ...player.stats.classes.dps,     rank: getModeRank(player.stats.classes.dps) },
          tank:    { ...player.stats.classes.tank,    rank: getModeRank(player.stats.classes.tank) },
          support: { ...player.stats.classes.support, rank: getModeRank(player.stats.classes.support) },
        }}};
      });
      return result;
    };

    const balance = async () => {
      if (!Object.values(store.state.players).some(p => p.identity.isCaptain)) {
        alert('Please select at least one captain');
        return;
      }
      const teamsCopy = [...store.state.teams];
      const reserveCopy = [...store.state.reservedPlayers];
      store.commit(MutationTypes.CLEAR_TEAMS, undefined);
      store.commit(MutationTypes.SET_RESULTS, []);
      progress.current = 0;

      const lib = await wasm;
      const payload = {
        players: getBalancePlayers(),
        range: +options.value.range,
        lowRankLimiter: options.value.lowRankLimiter,
        disallowSecondaryRoles: options.value.disallowSecondaryRoles,
        preferBalancedCaptains: options.value.preferBalancedCaptains,
        preferFullFlexDistribution: options.value.preferFullFlexDistribution,
        preventSuperteamSynergy: options.value.preventSuperteamSynergy,
        adjustSr: options.value.adjustSr,
      };

      try {
        let results: Results | null;
        if (balanceType.value === 'half') {
          results = await lib.halfBalance(JSON.stringify(payload));
        } else if (balanceType.value === 'final') {
          results = await lib.finalBalance(JSON.stringify({ ...payload, reserveCopy, teamsCopy }));
        } else {
          results = await lib.fullBalance(JSON.stringify({ ...payload, disableType: disableType.value, dispersionMinimizer: options.value.dispersionMinimizer, triesCount: options.value.triesCount }));
        }

        if (results.length !== 1) {
          store.commit(MutationTypes.SET_RESULTS, results);
          store.commit(MutationTypes.TOGGLE_SELECTION, undefined);
          return;
        }
        const ignoredUuids = results[0].leftovers.map((l: any) => l.uuid);
        store.commit(MutationTypes.RESERVE_PLAYERS, ignoredUuids);
        store.commit(MutationTypes.ADD_TEAMS, results[0].teams);
      } catch (e) { console.error((e as Error).message); }
    };

    return {
      isActive, balanceType, disableType, rankMode, progress, progressPct,
      options, activePreset, rankModeHints, typeOptions, disableOptions,
      presets, advancedOpts, applyPreset, closeModal, downloadSettings,
      importSettings, balance, t,
    };
  },
});
</script>

<style lang="scss" scoped>
/* ── Overlay & modal ── */
.bal-overlay {
  position: fixed; inset: 0; z-index: 1055;
  background: rgba(0,0,0,.65);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.bal-fade-enter-active, .bal-fade-leave-active { transition: opacity .2s, transform .2s; }
.bal-fade-enter-from, .bal-fade-leave-to { opacity: 0; transform: scale(.97) translateY(8px); }

.bal-modal {
  background: var(--surface-1);
  border: 1px solid var(--border-strong);
  border-radius: 20px;
  width: 100%; max-width: 860px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,.7);
  overflow: hidden;
}

/* ── Header ── */
.bal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.bal-header-left { display: flex; align-items: center; gap: 14px; }
.bal-icon {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(145deg, var(--accent), #c9760a);
  box-shadow: 0 4px 14px rgba(249,158,26,.3);
  display: grid; place-items: center;
  svg { width: 20px; height: 20px; stroke: #1a1206; }
}
.bal-title { font-size: 1.15rem; font-weight: 800; letter-spacing: -.03em; color: var(--text); margin: 0; line-height: 1; }
.bal-subtitle { font-size: .72rem; color: var(--text-dim); margin: 3px 0 0; }
.bal-close {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface-3); color: var(--text-muted); cursor: pointer;
  display: grid; place-items: center; transition: .14s;
  svg { width: 14px; height: 14px; }
  &:hover { border-color: var(--border-strong); color: var(--text); }
}

/* ── Body ── */
.bal-body {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  overflow-y: auto; flex: 1;
}
.bal-col { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.bal-col-left { border-right: 1px solid var(--border); }

/* ── Sections ── */
.bal-section {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
}
.bsec-head {
  display: flex; align-items: center; gap: 7px;
  font-size: .72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .06em;
  color: var(--text-dim); margin-bottom: 12px;
  svg { width: 13px; height: 13px; flex-shrink: 0; }
}
.bsec-value {
  margin-left: auto;
  font-family: var(--mono); font-size: .8rem; font-weight: 600;
  color: var(--accent); background: var(--accent-soft);
  padding: 2px 8px; border-radius: 6px;
}

/* ── Balance type cards ── */
.type-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
.type-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 8px; border-radius: 10px;
  background: var(--surface-3); border: 1px solid var(--border);
  cursor: pointer; transition: .15s; text-align: center;
  &:hover { border-color: var(--border-strong); }
  &.active { background: var(--accent-soft); border-color: rgba(249,158,26,.4); }
}
.tc-icon { :deep(svg) { width: 20px; height: 20px; stroke: var(--text-muted); } }
.type-card.active .tc-icon :deep(svg) { stroke: var(--accent); }
.tc-label { font-size: .82rem; font-weight: 700; color: var(--text); }
.tc-desc  { font-size: .65rem; color: var(--text-dim); line-height: 1.3; }

/* ── Seg group (disable) ── */
.seg-group { display: flex; gap: 5px; flex-wrap: wrap; }
.seg-btn {
  padding: 5px 12px; border-radius: 7px; font-size: .78rem; font-weight: 600;
  background: var(--surface-3); border: 1px solid var(--border);
  color: var(--text-muted); cursor: pointer; font-family: var(--font); transition: .14s;
  &:hover { border-color: var(--border-strong); color: var(--text); }
  &.active { background: var(--accent); border-color: transparent; color: #1a1206; }
}

/* ── Rank mode ── */
.bal-select {
  width: 100%; height: 38px; padding: 0 12px;
  background: var(--surface-3); border: 1px solid var(--border);
  border-radius: 9px; color: var(--text); font-family: var(--font); font-size: .86rem;
  outline: none; cursor: pointer; appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center;
  padding-right: 32px;
  &:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
}
.mode-hint {
  font-size: .72rem; color: var(--text-dim); margin: 8px 0 0; line-height: 1.45;
}

/* ── Presets ── */
.preset-row { display: flex; flex-direction: column; gap: 6px; }
.preset-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border-radius: 9px;
  background: var(--surface-3); border: 1px solid var(--border);
  cursor: pointer; transition: .14s; text-align: left; font-family: var(--font);
  &:hover { border-color: var(--border-strong); }
  &.active { background: var(--accent-soft); border-color: rgba(249,158,26,.4); }
}
.pc-name { font-size: .84rem; font-weight: 700; color: var(--text); }
.pc-desc { font-size: .72rem; color: var(--text-dim); }

/* ── Sync buttons ── */
.sync-section { display: flex; gap: 8px; flex-direction: row; }
.sync-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  height: 36px; border-radius: 9px;
  background: var(--surface-3); border: 1px solid var(--border);
  color: var(--text-muted); font-family: var(--font); font-size: .78rem; font-weight: 600;
  cursor: pointer; transition: .14s;
  svg { width: 14px; height: 14px; flex-shrink: 0; }
  &:hover { border-color: var(--border-strong); color: var(--text); }
}

/* ── Toggle switches ── */
.toggle-list { display: flex; flex-direction: column; gap: 2px; }
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 10px; border-radius: 8px; cursor: pointer;
  transition: background .12s;
  &:hover { background: var(--surface-3); }
}
.toggle-info { flex: 1; min-width: 0; padding-right: 12px; }
.toggle-name { font-size: .82rem; font-weight: 600; color: var(--text); display: block; }
.toggle-desc { font-size: .68rem; color: var(--text-dim); display: block; line-height: 1.3; margin-top: 1px; }
.toggle-switch {
  width: 38px; height: 22px; border-radius: 99px;
  background: var(--surface-3); border: 1px solid var(--border);
  flex-shrink: 0; position: relative; cursor: pointer; transition: .18s;
  &.on { background: var(--accent); border-color: var(--accent); }
}
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--text-dim); transition: .18s;
  .toggle-switch.on & { left: 19px; background: #1a1206; }
}

/* ── Sliders ── */
.slider-wrap { position: relative; height: 24px; display: flex; align-items: center; }
.dispersion-wrap::before {
  content: ''; position: absolute; inset: 0;
  height: 6px; top: 50%; transform: translateY(-50%);
  border-radius: 99px;
  background: linear-gradient(to right, var(--tank) 0%, var(--support) 35%, var(--surface-3) 50%, var(--accent) 65%, var(--dps) 100%);
  pointer-events: none;
}
.bal-range {
  width: 100%; appearance: none; -webkit-appearance: none;
  height: 6px; background: transparent; outline: none; cursor: pointer; position: relative; z-index: 1;
  &::-webkit-slider-runnable-track { background: var(--surface-3); height: 6px; border-radius: 99px; }
  &::-webkit-slider-thumb {
    -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
    background: var(--text); border: 2px solid var(--accent); cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,.4); transition: transform .14s, box-shadow .14s;
    margin-top: -7px;
    &:hover { transform: scale(1.15); box-shadow: 0 0 0 5px var(--accent-soft), 0 2px 8px rgba(0,0,0,.4); }
  }
  &::-moz-range-thumb {
    width: 20px; height: 20px; border-radius: 50%;
    background: var(--text); border: 2px solid var(--accent); cursor: pointer;
  }
}
.tries-range::-webkit-slider-runnable-track {
  background: linear-gradient(to right, var(--surface-3), var(--border-strong)) !important;
}
.slider-labels {
  display: flex; justify-content: space-between;
  font-size: .62rem; color: var(--text-dim); margin-top: 5px; font-weight: 500;
}

/* ── Progress ── */
.bal-progress-track {
  height: 8px; background: var(--surface-3); border-radius: 99px; overflow: hidden;
}
.bal-progress-bar {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, var(--accent), var(--accent-hover));
  transition: width .3s ease;
  box-shadow: 0 0 10px var(--accent-soft);
}

/* ── Footer ── */
.bal-footer {
  display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--surface-2);
}
.bal-btn-close {
  height: 40px; padding: 0 20px; border-radius: 10px;
  background: var(--surface-3); border: 1px solid var(--border);
  color: var(--text-muted); font-family: var(--font); font-size: .86rem; font-weight: 600;
  cursor: pointer; transition: .15s;
  &:hover { border-color: var(--border-strong); color: var(--text); }
}
.bal-btn-run {
  height: 40px; padding: 0 24px; border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), #e07e00); border: none;
  color: #1a1206; font-family: var(--font); font-size: .9rem; font-weight: 700;
  cursor: pointer; transition: .15s; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 16px rgba(249,158,26,.3);
  svg { width: 14px; height: 14px; stroke: #1a1206; }
  &:hover { box-shadow: 0 6px 24px rgba(249,158,26,.45); transform: translateY(-1px); }
  &:active { transform: none; }
}

@media (max-width: 640px) {
  .bal-body { grid-template-columns: 1fr; }
  .bal-col-left { border-right: none; border-bottom: 1px solid var(--border); }
}
</style>
