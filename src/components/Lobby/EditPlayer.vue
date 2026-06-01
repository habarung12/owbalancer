<template>
  <teleport to="body">
    <transition name="ep-fade">
      <div v-if="isActive" class="ep-overlay" @click.self="closeModal">
        <div class="ep-modal">

          <!-- HEADER -->
          <div class="ep-header">
            <div class="ep-header-left">
              <div class="ep-avatar">
                {{ player.identity.name.slice(0,2).toUpperCase() }}
              </div>
              <div>
                <h2 class="ep-title">{{ player.identity.name || '—' }}</h2>
                <p class="ep-subtitle">{{ t.identity }} · {{ t.stats }}</p>
              </div>
            </div>
            <button class="ep-close" @click="closeModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- BODY -->
          <div class="ep-body">

            <!-- LEFT: Identity -->
            <div class="ep-col ep-col-left">

              <!-- Name + BNet -->
              <section class="ep-section">
                <div class="ep-sec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ t.identity }}
                </div>
                <div class="name-row">
                  <label class="field-label">{{ t.name }}</label>
                  <input type="text" class="ep-input" v-model="player.identity.name" />
                </div>
                <div class="bnet-row">
                  <a :href="battleNetLink" target="_blank" rel="noopener" class="bnet-btn bnet-primary">Battle.net</a>
                  <a :href="trackerLink" target="_blank" rel="noopener" class="bnet-btn bnet-success">Tracker</a>
                  <button type="button" class="bnet-btn bnet-accent" :disabled="isChecking" @click="checkBattleNet">
                    <span v-if="isChecking" class="mini-spinner"></span>
                    {{ isChecking ? '...' : 'Check BNet' }}
                  </button>
                </div>
                <div v-if="checkStatus" class="bnet-status" :class="checkStatusType">{{ checkStatus }}</div>
              </section>

              <!-- Flags -->
              <section class="ep-section">
                <div class="ep-sec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  {{ t.identity }}
                </div>
                <div class="flag-list">
                  <label class="flag-row" v-for="flag in flags" :key="flag.key">
                    <div class="flag-info">
                      <span class="flag-name">{{ flag.label }}</span>
                      <span class="flag-desc">{{ flag.desc }}</span>
                    </div>
                    <div class="ep-toggle" :class="{ on: player.identity[flag.key] }" @click="player.identity[flag.key] = !player.identity[flag.key]">
                      <div class="ep-toggle-thumb"></div>
                    </div>
                  </label>
                </div>
              </section>

            </div>

            <!-- RIGHT: Ranks (draggable) -->
            <div class="ep-col ep-col-right" :class="{ disabled: player.identity.isLocked }">
              <section class="ep-section">
                <div class="ep-sec-head">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  {{ t.stats }}
                </div>

                <sortable class="rank-list" v-on:update-position="updatePosition" handle=".rank-drag">
                  <div
                    class="rank-card"
                    v-for="role in sortedRoles" :key="role.role"
                    :class="{ active: role.isActive, [role.role]: true }"
                  >
                    <div class="rank-card-main">
                      <!-- Drag handle + role icon -->
                      <div class="rank-drag" title="Drag to reorder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01"/></svg>
                      </div>
                      <div class="rank-role-icon">
                        <role-icon :rtype="role.role" />
                      </div>
                      <!-- Info -->
                      <div class="rank-info">
                        <div class="rank-role-name">{{ roleLabels[role.role] }}</div>
                        <div class="rank-balance-hint">{{ t.stats }}: {{ getRankLabel(role.balanceRank) }}</div>
                      </div>
                      <!-- Toggle -->
                      <div class="ep-toggle sm" :class="{ on: role.isActive }"
                        @click="role.isActive = !role.isActive; onRoleChange(role)">
                        <div class="ep-toggle-thumb"></div>
                      </div>
                    </div>

                    <!-- Rank select -->
                    <div class="rank-select-row">
                      <select class="ep-select" :value="role.rank" @change="onRankChange(role, $event)">
                        <option :value="0">{{ t.noRank }}</option>
                        <option v-for="opt in rankOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                      </select>
                    </div>
                  </div>
                </sortable>
              </section>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="ep-footer">
            <button class="ep-btn-close" @click="closeModal">{{ t.close }}</button>
            <button class="ep-btn-save" @click="saveChanges">{{ t.saveChanges }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, reactive } from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { t } from '@/i18n';
import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';
import PlayerEditor, { Stats, ClassType } from '@/objects/player';
import Sortable from '@/components/Helpers/Sortable.vue';
import RoleIcon from '@/components/svg/RoleIcon.vue';
import { SortableEvent } from 'sortablejs';

const RANK_OPTIONS = [
  { label: 'Bronze 5', value: 1000 }, { label: 'Bronze 4', value: 1100 }, { label: 'Bronze 3', value: 1200 }, { label: 'Bronze 2', value: 1300 }, { label: 'Bronze 1', value: 1400 },
  { label: 'Silver 5', value: 1500 }, { label: 'Silver 4', value: 1600 }, { label: 'Silver 3', value: 1700 }, { label: 'Silver 2', value: 1800 }, { label: 'Silver 1', value: 1900 },
  { label: 'Gold 5', value: 2000 }, { label: 'Gold 4', value: 2100 }, { label: 'Gold 3', value: 2200 }, { label: 'Gold 2', value: 2300 }, { label: 'Gold 1', value: 2400 },
  { label: 'Platinum 5', value: 2500 }, { label: 'Platinum 4', value: 2600 }, { label: 'Platinum 3', value: 2700 }, { label: 'Platinum 2', value: 2800 }, { label: 'Platinum 1', value: 2900 },
  { label: 'Diamond 5', value: 3000 }, { label: 'Diamond 4', value: 3100 }, { label: 'Diamond 3', value: 3200 }, { label: 'Diamond 2', value: 3300 }, { label: 'Diamond 1', value: 3400 },
  { label: 'Master 5', value: 3500 }, { label: 'Master 4', value: 3600 }, { label: 'Master 3', value: 3700 }, { label: 'Master 2', value: 3800 }, { label: 'Master 1', value: 3900 },
  { label: 'Grandmaster 5', value: 4000 }, { label: 'Grandmaster 4', value: 4100 }, { label: 'Grandmaster 3', value: 4200 }, { label: 'Grandmaster 2', value: 4300 }, { label: 'Grandmaster 1', value: 4400 },
  { label: 'Champion 5', value: 4500 }, { label: 'Champion 4', value: 4600 }, { label: 'Champion 3', value: 4700 }, { label: 'Champion 2', value: 4800 }, { label: 'Champion 1', value: 4900 },
];

function getBalanceRank(role: ClassType): number {
  const cur = role.rank || 0;
  const reg = role.registrationRank || 0;
  const man = role.manualRank || 0;
  const peak = role.highestSeenRank || 0;
  const smart = peak > 0 ? Math.max(peak - 200, 0) : 0;
  return Math.max(cur, reg, man, smart);
}

export default defineComponent({
  name: 'EditPlayer',
  components: { Sortable, RoleIcon },
  setup() {
    const store = useStore();
    const emptyPlayer = PlayerEditor.createDefaultPlayer('');
    const isActive = computed(() => store.state.editPlayer.playerId !== '');
    const playerData = computed(() => {
      const { lobby, playerId } = store.state.editPlayer;
      return store.state[lobby][playerId] || emptyPlayer;
    });
    const player = ref(cloneDeep(emptyPlayer));
    watch(() => store.state.editPlayer.playerId, () => { player.value = cloneDeep(playerData.value); });

    const isChecking = ref(false);
    const checkStatus = ref('');
    const checkStatusType = ref<'success'|'error'|''>('');
    const advOpen = reactive<Record<string, boolean>>({ dps: false, tank: false, support: false });

    const roleLabels = computed(() => ({
      tank: t.value.teamTank,
      dps: t.value.teamDamage,
      support: t.value.teamSupport,
    }));

    const flags = computed(() => [
      { key: 'isCaptain',  label: t.value.captain,  desc: t.value.captainDesc },
      { key: 'isFullFlex', label: t.value.fullFlex,  desc: t.value.fullFlexDesc },
      { key: 'isLocked',   label: t.value.locked,    desc: t.value.lockedDesc },
    ]);

    const sortedRoles = computed(() => {
      const roles = ['tank','dps','support'].map(role => ({
        role,
        ...player.value.stats.classes[role as 'tank'|'dps'|'support'],
        get balanceRank() { return getBalanceRank(player.value.stats.classes[role as 'tank'|'dps'|'support']); },
      }));
      return roles.sort((a, b) => a.priority - b.priority);
    });

    const battleNetLink = computed(() => {
      const nick = (player.value.identity.name || '').split('#')[0];
      return `https://overwatch.blizzard.com/en-us/search/?q=${encodeURIComponent(nick)}`;
    });
    const trackerLink = computed(() => {
      const tag = (player.value.identity.name || '').replace('#','-');
      return `https://tracker.gg/overwatch/profile/battlenet/${encodeURIComponent(tag)}/overview`;
    });

    const checkBattleNet = async () => {
      checkStatus.value = ''; checkStatusType.value = '';
      const tag = (player.value.identity.name || '').replace('#','-');
      if (!tag) { checkStatus.value = 'Enter BattleTag'; checkStatusType.value = 'error'; return; }
      try {
        isChecking.value = true;
        const res = await fetch(`https://overfast-api.tekrop.fr/players/${encodeURIComponent(tag)}/summary`);
        if (!res.ok) { checkStatus.value = 'Profile not found or private'; checkStatusType.value = 'error'; return; }
        const data = await res.json();
        const pc = data.competitive?.pc || {};
        const divBase: Record<string, number> = { bronze:1000,silver:1500,gold:2000,platinum:2500,diamond:3000,master:3500,grandmaster:4000,champion:4500 };
        const conv = (r: any) => r?.division && r?.tier ? (divBase[r.division.toLowerCase()]||0)+(5-r.tier)*100 : 0;
        const dps = conv(pc.damage); const tank = conv(pc.tank); const supp = conv(pc.support);
        player.value.stats.classes.dps.rank = dps; player.value.stats.classes.dps.isActive = dps > 0;
        player.value.stats.classes.tank.rank = tank; player.value.stats.classes.tank.isActive = tank > 0;
        player.value.stats.classes.support.rank = supp; player.value.stats.classes.support.isActive = supp > 0;
        checkStatus.value = 'Stats updated'; checkStatusType.value = 'success';
      } catch { checkStatus.value = 'Check error'; checkStatusType.value = 'error'; } finally { isChecking.value = false; }
    };

    const getRankLabel = (v: number) => RANK_OPTIONS.find(r => r.value === v)?.label || t.value.noRank;

    const onRankChange = (role: any, e: Event) => {
      const v = +(e.target as HTMLSelectElement).value;
      role.rank = v;
      role.highestSeenRank = Math.max(role.highestSeenRank || 0, v);
      if (!role.registrationRank) role.registrationRank = v;
      player.value.stats.classes[role.role as 'tank'|'dps'|'support'].rank = v;
      player.value.stats.classes[role.role as 'tank'|'dps'|'support'].highestSeenRank = role.highestSeenRank;
      if (!player.value.stats.classes[role.role as 'tank'|'dps'|'support'].registrationRank) player.value.stats.classes[role.role as 'tank'|'dps'|'support'].registrationRank = v;
    };

    const onRoleChange = (role: any) => {
      player.value.stats.classes[role.role as 'tank'|'dps'|'support'].isActive = role.isActive;
    };

    const updatePosition = ({ oldIndex, newIndex }: SortableEvent) => {
      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;
      const classes = { ...player.value.stats.classes };
      const dirUp = newIndex - oldIndex < 0;
      Object.keys(classes).forEach(r => {
        const sr = classes[r as 'tank'|'dps'|'support'];
        if (sr.priority === oldIndex) { sr.priority = newIndex; return; }
        if (dirUp && sr.priority < oldIndex && sr.priority >= newIndex) sr.priority += 1;
        if (!dirUp && sr.priority > oldIndex && sr.priority <= newIndex) sr.priority -= 1;
      });
    };

    const closeModal = () => { player.value = cloneDeep(emptyPlayer); store.commit(MutationTypes.CLEAR_EDIT_PLAYER, undefined); };
    const saveChanges = () => {
      store.commit(MutationTypes.ADD_PLAYER, { player: cloneDeep(player.value), lobby: store.state.editPlayer.lobby });
      store.commit(MutationTypes.EMPTY_NO_RANK, undefined);
      store.commit(MutationTypes.CLEAR_EDIT_PLAYER, undefined);
    };

    return { player, isActive, closeModal, saveChanges, isChecking, checkStatus, checkStatusType, advOpen, sortedRoles, rankOptions: RANK_OPTIONS, getRankLabel, roleLabels, flags, battleNetLink, trackerLink, checkBattleNet, updatePosition, onRankChange, onRoleChange, t };
  },
});
</script>

<style lang="scss" scoped>
.ep-overlay {
  position: fixed; inset: 0; z-index: 1055;
  background: rgba(0,0,0,.65); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.ep-fade-enter-active, .ep-fade-leave-active { transition: opacity .2s, transform .2s; }
.ep-fade-enter-from, .ep-fade-leave-to { opacity: 0; transform: scale(.97) translateY(8px); }

.ep-modal {
  background: var(--surface-1); border: 1px solid var(--border-strong); border-radius: 20px;
  width: 100%; max-width: 760px; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,.7); overflow: hidden;
}

/* Header */
.ep-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.ep-header-left { display: flex; align-items: center; gap: 14px; }
.ep-avatar {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--surface-3), var(--elevated));
  border: 1px solid var(--border-strong);
  display: grid; place-items: center;
  font-family: var(--mono); font-size: .9rem; font-weight: 700; color: var(--text-muted);
}
.ep-title { font-size: 1.1rem; font-weight: 800; letter-spacing: -.03em; color: var(--text); margin: 0; line-height: 1; }
.ep-subtitle { font-size: .7rem; color: var(--text-dim); margin: 3px 0 0; text-transform: uppercase; letter-spacing: .04em; }
.ep-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-3); color: var(--text-muted); cursor: pointer; display: grid; place-items: center; transition: .14s; svg { width: 14px; height: 14px; } &:hover { border-color: var(--border-strong); color: var(--text); } }

/* Body */
.ep-body { display: grid; grid-template-columns: 1fr 1fr; overflow-y: auto; flex: 1; }
.ep-col { padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.ep-col-left { border-right: 1px solid var(--border); }
.ep-col-right.disabled { opacity: .5; pointer-events: none; }

/* Sections */
.ep-section { background: var(--surface-2); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
.ep-sec-head { display: flex; align-items: center; gap: 7px; font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--text-dim); margin-bottom: 12px; svg { width: 13px; height: 13px; } }

/* Name row */
.name-row { margin-bottom: 10px; }
.field-label { display: block; font-size: .7rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 5px; }
.ep-input { width: 100%; height: 38px; padding: 0 12px; background: var(--surface-3); border: 1px solid var(--border); border-radius: 9px; color: var(--text); font-family: var(--font); font-size: .86rem; outline: none; transition: .14s; &:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); } &.sm { height: 32px; font-size: .8rem; } }

/* BNet row */
.bnet-row { display: flex; gap: 7px; flex-wrap: wrap; }
.bnet-btn {
  display: inline-flex; align-items: center; height: 32px; padding: 0 12px;
  border-radius: 8px; font-size: .78rem; font-weight: 600; font-family: var(--font);
  text-decoration: none; cursor: pointer; border: none; transition: .14s;
  &.bnet-primary { background: rgba(59,130,246,.15); color: #60a5fa; border: 1px solid rgba(59,130,246,.25); &:hover { background: rgba(59,130,246,.25); } }
  &.bnet-success  { background: rgba(16,185,129,.12); color: #34d399; border: 1px solid rgba(16,185,129,.2); &:hover { background: rgba(16,185,129,.22); } }
  &.bnet-accent   { background: var(--accent-soft); color: var(--accent); border: 1px solid rgba(249,158,26,.25); &:hover { background: rgba(249,158,26,.18); } &:disabled { opacity:.5; cursor:not-allowed; } }
}
.bnet-status { margin-top: 8px; padding: 6px 10px; border-radius: 8px; font-size: .78rem; font-weight: 600; &.success { background: rgba(16,185,129,.12); color: #34d399; } &.error { background: var(--danger-soft); color: var(--danger); } }

/* Flags (toggles) */
.flag-list { display: flex; flex-direction: column; gap: 2px; }
.flag-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 10px; border-radius: 8px; cursor: pointer; transition: background .12s; &:hover { background: var(--surface-3); } }
.flag-info { flex: 1; min-width: 0; padding-right: 10px; }
.flag-name { font-size: .82rem; font-weight: 600; color: var(--text); display: block; }
.flag-desc { font-size: .68rem; color: var(--text-dim); display: block; margin-top: 1px; }

/* Toggle switch */
.ep-toggle { width: 38px; height: 22px; border-radius: 99px; background: var(--surface-3); border: 1px solid var(--border); flex-shrink: 0; position: relative; cursor: pointer; transition: .18s; &.on { background: var(--accent); border-color: var(--accent); } &.sm { width: 32px; height: 18px; } }
.ep-toggle-thumb { position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: var(--text-dim); transition: .18s; .ep-toggle.on & { left: 19px; background: #1a1206; } .ep-toggle.sm & { width: 10px; height: 10px; } .ep-toggle.sm.on & { left: 17px; } }

/* Rank cards */
.rank-list { display: flex; flex-direction: column; gap: 8px; }
.rank-card { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; transition: border-color .14s; &.active { border-color: rgba(249,158,26,.35); } &.active.tank { border-color: rgba(106,163,224,.35); } &.active.dps { border-color: rgba(224,104,95,.35); } &.active.support { border-color: rgba(111,197,154,.35); } }
.rank-card-main { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface-3); }
.rank-drag { width: 18px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: grab; color: var(--text-dim); flex-shrink: 0; svg { width: 14px; height: 14px; } &:active { cursor: grabbing; } }
.rank-role-icon { width: 28px; height: 28px; display: grid; place-items: center; flex-shrink: 0; :deep(svg),  :deep(img) { width: 20px !important; height: 20px !important; } }
.rank-card.tank    .rank-role-icon :deep(*) { color: var(--tank) !important; stroke: var(--tank) !important; fill: none !important; }
.rank-card.dps     .rank-role-icon :deep(*) { color: var(--dps) !important; stroke: var(--dps) !important; fill: none !important; }
.rank-card.support .rank-role-icon :deep(*) { color: var(--support) !important; stroke: var(--support) !important; fill: none !important; }
.rank-info { flex: 1; min-width: 0; }
.rank-role-name { font-size: .84rem; font-weight: 700; color: var(--text); }
.rank-balance-hint { font-size: .68rem; color: var(--text-dim); margin-top: 1px; }
.rank-select-row { display: flex; gap: 6px; padding: 8px 12px; align-items: center; }
.ep-select { flex: 1; height: 36px; padding: 0 10px; background: var(--surface-3); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-family: var(--font); font-size: .82rem; outline: none; &:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); } &.sm { height: 30px; font-size: .78rem; } }
.rank-adv-btn { width: 36px; height: 36px; flex-shrink: 0; border-radius: 8px; background: var(--surface-3); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; display: grid; place-items: center; transition: .14s; svg { width: 14px; height: 14px; } &:hover, &.open { background: var(--elevated); border-color: var(--border-strong); color: var(--text); } }
.rank-advanced { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px 12px 12px; border-top: 1px dashed var(--border); }
.adv-field { display: flex; flex-direction: column; gap: 4px; label { font-size: .68rem; font-weight: 600; color: var(--text-dim); text-transform: uppercase; letter-spacing: .04em; } &.full { grid-column: 1/-1; } }

/* Footer */
.ep-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); flex-shrink: 0; background: var(--surface-2); }
.ep-btn-close { height: 40px; padding: 0 20px; border-radius: 10px; background: var(--surface-3); border: 1px solid var(--border); color: var(--text-muted); font-family: var(--font); font-size: .86rem; font-weight: 600; cursor: pointer; transition: .15s; &:hover { border-color: var(--border-strong); color: var(--text); } }
.ep-btn-save { height: 40px; padding: 0 24px; border-radius: 10px; background: linear-gradient(135deg, var(--accent), #e07e00); border: none; color: #1a1206; font-family: var(--font); font-size: .9rem; font-weight: 700; cursor: pointer; transition: .15s; box-shadow: 0 4px 16px rgba(249,158,26,.3); &:hover { box-shadow: 0 6px 24px rgba(249,158,26,.45); transform: translateY(-1px); } }

/* Spinner */
.mini-spinner { width: 11px; height: 11px; border: 2px solid rgba(0,0,0,.2); border-top-color: rgba(0,0,0,.7); border-radius: 50%; display: inline-block; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 580px) {
  .ep-body { grid-template-columns: 1fr; }
  .ep-col-left { border-right: none; border-bottom: 1px solid var(--border); }
}
</style>
