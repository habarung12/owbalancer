<template>
  <teleport to="body">
    <transition name="rs-fade">
      <div v-if="isActive" class="rs-overlay" @click.self="closeModal">
        <div class="rs-modal">
          <!-- HEADER -->
          <div class="rs-header">
            <div class="rs-header-left">
              <div class="rs-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div>
                <h2 class="rs-title">{{ t.resultTitle }}</h2>
                <p class="rs-subtitle">{{ t.resultSubtitle }}</p>
              </div>
            </div>
            <button class="rs-close" @click="closeModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- BODY -->
          <div class="rs-body">
            <div v-if="results.length > 0" class="rs-grid">
              <result
                v-for="(balance, i) in results"
                :key="i"
                :balance="balance"
                :index="i"
                :is-recommended="i === 0"
                :is-selected="isActiveBalance(balance)"
              />
            </div>
            <div v-else class="rs-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/></svg>
              <span>{{ t.resultEmpty }}</span>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="rs-footer">
            <span class="rs-hint">{{ results.length }} {{ t.resultVariantsCount }}</span>
            <button class="rs-btn-close" @click="closeModal">{{ t.close }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from '@/store';
import MutationTypes from '@/store/mutation-types';
import Result from '@/components/Teams/Result.vue';
import { Balance } from '@/objects/balance';
import { t } from '@/i18n';

export default defineComponent({
  name: 'ResultSelection',
  components: { Result },
  setup() {
    const store = useStore();
    const isActive = computed(() => store.state.isSelection);

    const signature = (b: Balance) =>
      b.teams
        .map(team => team.members.map(m => m.uuid).sort().join(','))
        .sort()
        .join('|');

    const results = computed(() => {
      // dedupe identical compositions
      const seen = new Set<string>();
      const unique = store.state.balancerResults.filter(b => {
        const sig = signature(b);
        if (seen.has(sig)) return false;
        seen.add(sig);
        return true;
      });
      // best first: complete (no leftovers) first, then lowest dispersion
      return unique.sort((a, b) => {
        if ((a.leftovers.length === 0) !== (b.leftovers.length === 0)) {
          return a.leftovers.length === 0 ? -1 : 1;
        }
        return a.dispersion - b.dispersion;
      });
    });

    const closeModal = () => store.commit(MutationTypes.TOGGLE_SELECTION, undefined);

    const storeTeams = computed(() => store.state.teams);
    const isActiveBalance = (balance: Balance) =>
      storeTeams.value.map(t => t.uuid).join('|') === balance.teams.map(t => t.uuid).join('|');

    return { isActive, closeModal, results, isActiveBalance, t };
  },
});
</script>

<style lang="scss" scoped>
.rs-overlay {
  position: fixed; inset: 0; z-index: 1056;
  background: rgba(0,0,0,.65); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.rs-fade-enter-active, .rs-fade-leave-active { transition: opacity .2s, transform .2s; }
.rs-fade-enter-from, .rs-fade-leave-to { opacity: 0; transform: scale(.97) translateY(8px); }

.rs-modal {
  background: var(--surface-1); border: 1px solid var(--border-strong); border-radius: 20px;
  width: 100%; max-width: 960px; max-height: 90vh;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,.7); overflow: hidden;
}

.rs-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.rs-header-left { display: flex; align-items: center; gap: 14px; }
.rs-icon {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(145deg, var(--accent), #18638c);
  box-shadow: 0 4px 14px rgba(35,128,177,.3); display: grid; place-items: center;
  svg { width: 20px; height: 20px; stroke: #ffffff; }
}
.rs-title { font-size: 1.15rem; font-weight: 800; letter-spacing: -.03em; color: var(--text); margin: 0; line-height: 1; }
.rs-subtitle { font-size: .72rem; color: var(--text-dim); margin: 3px 0 0; }
.rs-close {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface-3); color: var(--text-muted); cursor: pointer;
  display: grid; place-items: center; transition: .14s;
  svg { width: 14px; height: 14px; }
  &:hover { border-color: var(--border-strong); color: var(--text); }
}

.rs-body { overflow-y: auto; flex: 1; padding: 20px 24px; }
.rs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.rs-empty {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 48px; color: var(--text-dim);
  svg { width: 40px; height: 40px; opacity: .5; }
  span { font-size: .9rem; }
}

.rs-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; border-top: 1px solid var(--border); flex-shrink: 0; background: var(--surface-2);
}
.rs-hint { font-size: .8rem; color: var(--text-dim); }
.rs-btn-close {
  height: 40px; padding: 0 20px; border-radius: 10px;
  background: var(--surface-3); border: 1px solid var(--border); color: var(--text-muted);
  font-family: var(--font); font-size: .86rem; font-weight: 600; cursor: pointer; transition: .15s;
  &:hover { border-color: var(--border-strong); color: var(--text); }
}
</style>
