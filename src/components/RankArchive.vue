<template>
  <teleport to="body">
    <transition name="ar-fade">
      <div v-if="isActive" class="ar-overlay" @click.self="close">
        <div class="ar-modal">

          <!-- HEADER -->
          <div class="ar-header">
            <div class="ar-header-left">
              <div class="ar-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
              </div>
              <div>
                <h2 class="ar-title">{{ t.archiveTitle }}</h2>
                <p class="ar-subtitle">{{ t.archiveSubtitle }}</p>
              </div>
            </div>
            <button class="ar-close" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- TOOLBAR -->
          <div class="ar-toolbar">
            <div class="ar-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>
              <input type="text" v-model.trim="query" :placeholder="t.archiveSearch" />
            </div>
            <button class="ar-snapshot" @click="snapshot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              {{ t.archiveSnapshot }}
            </button>
          </div>

          <!-- BODY -->
          <div class="ar-body">

            <!-- PLAYER HISTORY MODE (when searching) -->
            <div v-if="query && historyRows.length" class="ar-history">
              <div class="ar-history-head">
                {{ t.archiveHistoryFor }} «{{ query }}» — {{ historyRows.length }} {{ t.archivePlayersFound }}
              </div>
              <div class="ar-history-player" v-for="ph in historyRows" :key="ph.name">
                <div class="ar-ph-name">{{ ph.name }}</div>
                <div class="ar-ph-seasons">
                  <div class="ar-ph-season" v-for="s in ph.seasons" :key="s.seasonId">
                    <div class="ar-ph-season-name">{{ s.seasonName }}</div>
                    <div class="ar-ranks">
                      <span class="rank-chip tank" :style="badge(s.ranks.tank)">
                        <svg class="ri-ico" viewBox="0 0 32 32" fill="currentColor"><path d="M29,10.7c0,2.1,0,4.1,0,6.2c0,0.6-0.1,1.1-0.4,1.6c-2.9,5.3-6.8,9.7-11.8,13.2c-0.6,0.4-1,0.4-1.6,0c-4.9-3.4-8.8-7.8-11.7-13c-0.3-0.6-0.4-1.2-0.4-1.8c0-3.9,0.1-7.8,0-11.7C3,2.3,5.2,1.9,7.1,1.4C10.4,0.6,13.3,0,16.6,0c3.1,0,7.7,1.1,9.4,1.6c1.3,0.4,2.7,0.9,2.9,2.2C29,4.9,28.9,6,29,7.1C29,8.3,29,9.5,29,10.7C29,10.7,29,10.7,29,10.7z"/></svg>
                        <b>{{ disp(s.ranks.tank) }}</b>
                      </span>
                      <span class="rank-chip dps" :style="badge(s.ranks.dps)">
                        <svg class="ri-ico" viewBox="0 0 32 32" fill="currentColor"><rect x="2.1" y="28.1" width="7.1" height="3.9"/><path d="M9.1,7c0,0,0-0.5,0-0.7C8.6,1.5,5.6,0,5.6,0s-3,1.5-3.5,6.3c0,0.2,0,0.7,0,0.7v18.4h3.5h3.5V7z"/><rect x="12.5" y="28.1" width="7.1" height="3.9"/><path d="M19.5,7c0,0,0-0.5,0-0.7C19,1.5,16,0,16,0s-3,1.5-3.5,6.3c0,0.2,0,0.7,0,0.7v18.4H16h3.5V7z"/><rect x="22.9" y="28.1" width="7.1" height="3.9"/><path d="M29.9,7c0,0,0-0.5,0-0.7C29.4,1.5,26.4,0,26.4,0s-3,1.5-3.5,6.3c0,0.2,0,0.7,0,0.7v18.4h3.5h3.5V7z"/></svg>
                        <b>{{ disp(s.ranks.dps) }}</b>
                      </span>
                      <span class="rank-chip support" :style="badge(s.ranks.support)">
                        <svg class="ri-ico" viewBox="0 0 32 32" fill="currentColor"><path fill-rule="evenodd" d="M29.3,10.2h-7.5V2.7c0-1.5-1.2-2.7-2.7-2.7h-6.3c-1.5,0-2.7,1.2-2.7,2.7v7.5H2.7c-1.5,0-2.7,1.2-2.7,2.7v6.3c0,1.5,1.2,2.7,2.7,2.7h7.5v7.5c0,1.5,1.2,2.7,2.7,2.7h6.3c1.5,0,2.7-1.2,2.7-2.7v-7.5h7.5c1.5,0,2.7-1.2,2.7-2.7v-6.3C32,11.4,30.8,10.2,29.3,10.2z"/></svg>
                        <b>{{ disp(s.ranks.support) }}</b>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SEASONS MODE -->
            <div v-else-if="seasons.length" class="ar-seasons">
              <section class="ar-season" v-for="season in seasons" :key="season.id">
                <div class="ar-season-head">
                  <div class="ar-season-title">
                    <input
                      class="ar-season-name"
                      :value="season.name"
                      @change="renameSeason(season.id, ($event.target as HTMLInputElement).value)"
                    />
                    <span class="ar-season-meta">{{ Object.keys(season.players).length }} {{ t.archivePlayers }} · {{ formatDate(season.createdAt) }}</span>
                  </div>
                  <button class="ar-season-del" @click="removeSeason(season.id)" :title="t.archiveDelete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
                <div class="ar-players">
                  <div class="ar-player" v-for="(ranks, name) in season.players" :key="name">
                    <span class="ar-player-name">{{ name }}</span>
                    <div class="ar-ranks">
                      <span class="rank-chip tank" :style="badge(ranks.tank)">
                        <svg class="ri-ico" viewBox="0 0 32 32" fill="currentColor"><path d="M29,10.7c0,2.1,0,4.1,0,6.2c0,0.6-0.1,1.1-0.4,1.6c-2.9,5.3-6.8,9.7-11.8,13.2c-0.6,0.4-1,0.4-1.6,0c-4.9-3.4-8.8-7.8-11.7-13c-0.3-0.6-0.4-1.2-0.4-1.8c0-3.9,0.1-7.8,0-11.7C3,2.3,5.2,1.9,7.1,1.4C10.4,0.6,13.3,0,16.6,0c3.1,0,7.7,1.1,9.4,1.6c1.3,0.4,2.7,0.9,2.9,2.2C29,4.9,28.9,6,29,7.1C29,8.3,29,9.5,29,10.7C29,10.7,29,10.7,29,10.7z"/></svg>
                        <b>{{ disp(ranks.tank) }}</b>
                      </span>
                      <span class="rank-chip dps" :style="badge(ranks.dps)">
                        <svg class="ri-ico" viewBox="0 0 32 32" fill="currentColor"><rect x="2.1" y="28.1" width="7.1" height="3.9"/><path d="M9.1,7c0,0,0-0.5,0-0.7C8.6,1.5,5.6,0,5.6,0s-3,1.5-3.5,6.3c0,0.2,0,0.7,0,0.7v18.4h3.5h3.5V7z"/><rect x="12.5" y="28.1" width="7.1" height="3.9"/><path d="M19.5,7c0,0,0-0.5,0-0.7C19,1.5,16,0,16,0s-3,1.5-3.5,6.3c0,0.2,0,0.7,0,0.7v18.4H16h3.5V7z"/><rect x="22.9" y="28.1" width="7.1" height="3.9"/><path d="M29.9,7c0,0,0-0.5,0-0.7C29.4,1.5,26.4,0,26.4,0s-3,1.5-3.5,6.3c0,0.2,0,0.7,0,0.7v18.4h3.5h3.5V7z"/></svg>
                        <b>{{ disp(ranks.dps) }}</b>
                      </span>
                      <span class="rank-chip support" :style="badge(ranks.support)">
                        <svg class="ri-ico" viewBox="0 0 32 32" fill="currentColor"><path fill-rule="evenodd" d="M29.3,10.2h-7.5V2.7c0-1.5-1.2-2.7-2.7-2.7h-6.3c-1.5,0-2.7,1.2-2.7,2.7v7.5H2.7c-1.5,0-2.7,1.2-2.7,2.7v6.3c0,1.5,1.2,2.7,2.7,2.7h7.5v7.5c0,1.5,1.2,2.7,2.7,2.7h6.3c1.5,0,2.7-1.2,2.7-2.7v-7.5h7.5c1.5,0,2.7-1.2,2.7-2.7v-6.3C32,11.4,30.8,10.2,29.3,10.2z"/></svg>
                        <b>{{ disp(ranks.support) }}</b>
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- EMPTY -->
            <div v-else class="ar-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
              <span>{{ t.archiveEmpty }}</span>
              <button class="ar-snapshot" @click="snapshot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
                {{ t.archiveSnapshot }}
              </button>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="ar-footer">
            <span class="ar-hint">{{ t.archiveHint }}</span>
            <button class="ar-btn-close" @click="close">{{ t.close }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from '@/store';
import { t } from '@/i18n';

type RoleRanks = { tank: number; dps: number; support: number };
type Season = { id: string; name: string; createdAt: string; players: Record<string, RoleRanks> };

const STORAGE = 'owbalancer_rank_archive';

function loadSeasons(): Season[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || '{}');
    return Array.isArray(raw.seasons) ? raw.seasons : [];
  } catch { return []; }
}

function getTier(sr: number): { name: string; color: string; bg: string } {
  if (sr >= 4500) return { name: 'Champ',  color: '#f2c94c', bg: 'rgba(242,201,76,.13)' };
  if (sr >= 4000) return { name: 'GM',     color: '#f2c94c', bg: 'rgba(242,201,76,.13)' };
  if (sr >= 3500) return { name: 'Master', color: '#e0685f', bg: 'rgba(224,104,95,.13)' };
  if (sr >= 3000) return { name: 'Dia',    color: '#a78bfa', bg: 'rgba(167,139,250,.13)' };
  if (sr >= 2500) return { name: 'Plat',   color: '#5fd3c4', bg: 'rgba(95,211,196,.13)' };
  if (sr >= 2000) return { name: 'Gold',   color: '#f99e1a', bg: 'rgba(249,158,26,.13)' };
  if (sr >= 1500) return { name: 'Silver', color: '#a4a9b4', bg: 'rgba(164,169,180,.13)' };
  if (sr > 0)     return { name: 'Bronze', color: '#cd7f5d', bg: 'rgba(205,127,93,.13)' };
  return { name: '—', color: '#6b7280', bg: 'rgba(107,114,128,.08)' };
}

export default defineComponent({
  name: 'RankArchive',
  setup() {
    const store = useStore();
    const seasons = ref<Season[]>(loadSeasons());
    const query = ref('');

    const isActive = computed(() => store.state.isArchive);

    const persist = () => {
      localStorage.setItem(STORAGE, JSON.stringify({ seasons: seasons.value }));
    };
    watch(seasons, persist, { deep: true });

    const close = () => { store.commit('TOGGLE_ARCHIVE', undefined); };

    const snapshot = () => {
      const players: Record<string, RoleRanks> = {};
      Object.values(store.state.players).forEach(p => {
        const c = p.stats.classes;
        const eff = (cl: any) => Math.max(cl.rank || 0, cl.manualRank || 0, cl.highestSeenRank || 0);
        players[p.identity.name] = {
          tank: c.tank.isActive ? eff(c.tank) : 0,
          dps: c.dps.isActive ? eff(c.dps) : 0,
          support: c.support.isActive ? eff(c.support) : 0,
        };
      });
      if (Object.keys(players).length === 0) {
        alert(t.value.archiveNoPlayers);
        return;
      }
      const num = seasons.value.length + 1;
      seasons.value.unshift({
        id: `${Date.now()}`,
        name: `${t.value.archiveSeason} ${num}`,
        createdAt: new Date().toISOString(),
        players,
      });
    };

    const renameSeason = (id: string, name: string) => {
      const s = seasons.value.find(x => x.id === id);
      if (s) s.name = name || s.name;
    };
    const removeSeason = (id: string) => {
      if (window.confirm(t.value.archiveConfirmDelete)) {
        seasons.value = seasons.value.filter(x => x.id !== id);
      }
    };

    // Player history (across seasons) when searching
    const historyRows = computed(() => {
      const q = query.value.toLowerCase();
      const names = new Set<string>();
      seasons.value.forEach(s => Object.keys(s.players).forEach(n => {
        if (n.toLowerCase().includes(q)) names.add(n);
      }));
      return [...names].sort((a, b) => a.localeCompare(b)).map(name => ({
        name,
        seasons: seasons.value
          .filter(s => s.players[name])
          .map(s => ({ seasonId: s.id, seasonName: s.name, ranks: s.players[name] })),
      }));
    });

    const disp = (sr: number) => (sr > 0 ? sr : '—');
    const badge = (sr: number) => {
      const t = getTier(sr);
      return { color: t.color, background: t.bg, borderColor: t.color + '33' };
    };
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

    return { isActive, seasons, query, close, snapshot, renameSeason, removeSeason, historyRows, disp, badge, formatDate, t };
  },
});
</script>

<style lang="scss" scoped>
.ar-overlay {
  position: fixed; inset: 0; z-index: 1057;
  background: rgba(0,0,0,.65); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.ar-fade-enter-active, .ar-fade-leave-active { transition: opacity .2s, transform .2s; }
.ar-fade-enter-from, .ar-fade-leave-to { opacity: 0; transform: scale(.97) translateY(8px); }

.ar-modal {
  background: var(--surface-1); border: 1px solid var(--border-strong); border-radius: 20px;
  width: 100%; max-width: 820px; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,.7); overflow: hidden;
}

.ar-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.ar-header-left { display: flex; align-items: center; gap: 14px; }
.ar-icon {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(145deg, var(--accent), #c9760a);
  box-shadow: 0 4px 14px rgba(249,158,26,.3); display: grid; place-items: center;
  svg { width: 20px; height: 20px; stroke: #1a1206; }
}
.ar-title { font-size: 1.15rem; font-weight: 800; letter-spacing: -.03em; color: var(--text); margin: 0; line-height: 1; }
.ar-subtitle { font-size: .72rem; color: var(--text-dim); margin: 3px 0 0; }
.ar-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-3); color: var(--text-muted); cursor: pointer; display: grid; place-items: center; transition: .14s; svg { width: 14px; height: 14px; } &:hover { border-color: var(--border-strong); color: var(--text); } }

.ar-toolbar { display: flex; gap: 10px; padding: 14px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.ar-search {
  flex: 1; display: flex; align-items: center; gap: 8px;
  height: 38px; padding: 0 12px; border-radius: 10px;
  background: var(--surface-3); border: 1px solid var(--border);
  svg { width: 15px; height: 15px; color: var(--text-dim); flex-shrink: 0; }
  input { flex: 1; background: transparent; border: none; outline: none; color: var(--text); font-family: var(--font); font-size: .86rem; }
  input::placeholder { color: var(--text-dim); }
  &:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
}
.ar-snapshot {
  display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
  height: 38px; padding: 0 16px; border-radius: 10px;
  background: var(--accent); border: none; color: #1a1206;
  font-family: var(--font); font-size: .84rem; font-weight: 700; cursor: pointer; transition: .15s;
  svg { width: 15px; height: 15px; }
  &:hover { background: var(--accent-hover); transform: translateY(-1px); }
}

.ar-body { overflow-y: auto; flex: 1; padding: 18px 24px; }

/* Seasons */
.ar-seasons { display: flex; flex-direction: column; gap: 16px; }
.ar-season { background: var(--surface-2); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
.ar-season-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--surface-3); border-bottom: 1px solid var(--border); }
.ar-season-title { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ar-season-name { background: transparent; border: none; outline: none; color: var(--text); font-size: .92rem; font-weight: 700; font-family: var(--font); padding: 2px 4px; border-radius: 6px; width: 100%; &:focus { background: var(--surface-1); } }
.ar-season-meta { font-size: .68rem; color: var(--text-dim); padding-left: 4px; }
.ar-season-del { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-dim); cursor: pointer; display: grid; place-items: center; transition: .14s; flex-shrink: 0; svg { width: 14px; height: 14px; } &:hover { color: var(--danger); border-color: var(--danger); } }

.ar-players { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 6px; padding: 10px; }
.ar-player { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 10px; border-radius: 9px; background: var(--surface-1); border: 1px solid var(--border); }
.ar-player-name { font-size: .82rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.ar-ranks { display: flex; gap: 5px; flex-shrink: 0; }
.rank-chip {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 4px 6px 5px; border-radius: 8px; border: 1px solid;
  min-width: 38px;
  b { font-family: var(--mono); font-size: .68rem; font-weight: 700; line-height: 1; }
}
.rank-chip .ri-ico { width: 13px; height: 13px; }
.rank-chip.tank    .ri-ico { color: var(--tank); }
.rank-chip.dps     .ri-ico { color: var(--dps); }
.rank-chip.support .ri-ico { color: var(--support); }

/* History */
.ar-history { display: flex; flex-direction: column; gap: 12px; }
.ar-history-head { font-size: .72rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
.ar-history-player { background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 12px 14px; }
.ar-ph-name { font-size: .95rem; font-weight: 700; color: var(--text); margin-bottom: 10px; }
.ar-ph-seasons { display: flex; flex-wrap: wrap; gap: 10px; }
.ar-ph-season { background: var(--surface-3); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; }
.ar-ph-season-name { font-size: .68rem; color: var(--text-dim); font-weight: 600; margin-bottom: 6px; }

.ar-empty { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 48px; color: var(--text-dim); svg { width: 44px; height: 44px; opacity: .5; } span { font-size: .9rem; } }

.ar-footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid var(--border); flex-shrink: 0; background: var(--surface-2); }
.ar-hint { font-size: .76rem; color: var(--text-dim); }
.ar-btn-close { height: 40px; padding: 0 20px; border-radius: 10px; background: var(--surface-3); border: 1px solid var(--border); color: var(--text-muted); font-family: var(--font); font-size: .86rem; font-weight: 600; cursor: pointer; transition: .15s; &:hover { border-color: var(--border-strong); color: var(--text); } }
</style>
