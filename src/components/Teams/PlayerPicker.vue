<template>
  <teleport to="body">
    <transition name="pp-fade">
      <div v-if="open" class="pp-overlay" @click.self="close">
        <div class="pp-modal">

          <!-- HEADER -->
          <div class="pp-header">
            <div class="pp-header-left">
              <div class="pp-icon" :class="rtype">
                <role-icon :rtype="rtype" />
              </div>
              <div>
                <h2 class="pp-title">{{ t.pickPlayer }}</h2>
                <p class="pp-subtitle">{{ roleLabel }}</p>
              </div>
            </div>
            <button class="pp-close" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- SEARCH -->
          <div class="pp-search-row">
            <input
              v-model="query"
              type="text"
              class="pp-search"
              :placeholder="t.filterPlaceholder"
            />
          </div>

          <!-- LIST -->
          <div class="pp-body">
            <button
              v-for="([uuid, player]) in filteredPlayers"
              :key="uuid"
              type="button"
              class="pp-item"
              @click="select(uuid)"
            >
              <span class="pp-rank">{{ getRank(player) }}</span>
              <span class="pp-name">{{ player.identity.name }}</span>
            </button>
            <div v-if="filteredPlayers.length === 0" class="pp-empty">{{ t.pickPlayerEmpty }}</div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { t } from '@/i18n';
import { useStore } from '@/store';
import PObj, { Player } from '@/objects/player';

import RoleIcon from '@/components/svg/RoleIcon.vue';

export default defineComponent({
  name: 'PlayerPicker',
  components: { RoleIcon },
  props: {
    open: Boolean,
    rtype: String as PropType<'tank' | 'dps' | 'support'>,
  },
  emits: ['close', 'select'],
  setup(props, { emit }) {
    const store = useStore();
    const query = ref('');

    watch(() => props.open, isOpen => { if (isOpen) query.value = ''; });

    const teamMemberUuids = computed(() => {
      const set = new Set<string>();
      store.state.teams.forEach(team => team.members.forEach(m => set.add(m.uuid)));
      return set;
    });

    const roleLabel = computed(() => {
      if (props.rtype === 'tank') return t.value.teamTank;
      if (props.rtype === 'dps') return t.value.teamDamage;
      return t.value.teamSupport;
    });

    const eligiblePlayers = computed(() => {
      if (!props.rtype) return [];
      const rtype = props.rtype;
      return Object.entries(store.state.players)
        .filter(([uuid, player]) => !teamMemberUuids.value.has(uuid) && player.stats.classes[rtype].isActive)
        .sort(([, a], [, b]) => PObj.getRole(b.stats.classes, rtype).rank - PObj.getRole(a.stats.classes, rtype).rank);
    });

    const filteredPlayers = computed(() => {
      const search = query.value.trim().toLowerCase();
      if (!search) return eligiblePlayers.value;
      return eligiblePlayers.value.filter(([, player]) => player.identity.name.toLowerCase().includes(search));
    });

    const getRank = (player: Player) => {
      if (!props.rtype) return 0;
      return Math.round(PObj.getRole(player.stats.classes, props.rtype).rank);
    };

    const close = () => emit('close');
    const select = (uuid: string) => {
      emit('select', uuid);
      close();
    };

    return { query, roleLabel, filteredPlayers, getRank, close, select, t };
  },
});
</script>

<style lang="scss" scoped>
.pp-overlay {
  position: fixed; inset: 0; z-index: 1065;
  background: rgba(0,0,0,.65); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.pp-fade-enter-active, .pp-fade-leave-active { transition: opacity .2s, transform .2s; }
.pp-fade-enter-from, .pp-fade-leave-to { opacity: 0; transform: scale(.97) translateY(8px); }

.pp-modal {
  background: var(--surface-1); border: 1px solid var(--border-strong); border-radius: 20px;
  width: 100%; max-width: 420px; max-height: 80vh;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,.7); overflow: hidden;
}

.pp-header { display: flex; align-items: center; gap: 12px; padding: 18px 20px 14px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.pp-header-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.pp-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  background: var(--surface-3); border: 1px solid var(--border);
  display: grid; place-items: center; color: var(--text-muted);
  :deep(svg) { width: 18px; height: 18px; fill: currentColor; }
}
.pp-icon.tank    { color: var(--tank); }
.pp-icon.dps     { color: var(--dps); }
.pp-icon.support { color: var(--support); }
.pp-title { font-size: 1.02rem; font-weight: 800; letter-spacing: -.02em; color: var(--text); margin: 0; line-height: 1.2; }
.pp-subtitle { font-size: .72rem; color: var(--text-dim); margin: 3px 0 0; text-transform: uppercase; letter-spacing: .04em; }
.pp-close {
  width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface-3); color: var(--text-muted); cursor: pointer; flex-shrink: 0;
  display: grid; place-items: center; transition: .14s;
  svg { width: 13px; height: 13px; }
  &:hover { border-color: var(--border-strong); color: var(--text); }
}

.pp-search-row { padding: 12px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.pp-search {
  width: 100%; height: 36px; padding: 0 12px;
  background: var(--surface-2); border: 1px solid var(--border); border-radius: 9px;
  color: var(--text); font-family: var(--font); font-size: .86rem; outline: none; transition: .14s;
  &:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
}

.pp-body { padding: 8px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 4px; }
.pp-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 10px; border: 1px solid transparent;
  background: transparent; cursor: pointer; text-align: left; font-family: var(--font);
  transition: .12s;
  &:hover { background: var(--surface-2); border-color: var(--border); }
}
.pp-rank {
  font-family: var(--mono); font-size: .78rem; font-weight: 700; color: var(--accent);
  background: var(--accent-soft); padding: 3px 8px; border-radius: 7px; flex-shrink: 0;
  min-width: 42px; text-align: center;
}
.pp-name { font-size: .88rem; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.pp-empty { padding: 24px 12px; text-align: center; color: var(--text-dim); font-size: .84rem; }
</style>
