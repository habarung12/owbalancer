<template>
  <div class="container-fluid px-0 app-wrapper">
    <header class="topbar-wrap">
      <div class="topbar-pill">
        <!-- Brand -->
        <div class="brand">
          <div class="brand-mark">
            <OWIcon />
          </div>
          <div class="brand-text">
            <h1 class="brand-title">{{ t.title }}</h1>
            <div class="brand-sub">Overwatch · Custom Lobby</div>
          </div>
        </div>

        <div class="topbar-divider"></div>

        <!-- Controls -->
        <div class="topbar-controls">
          <!-- GitHub dropdown -->
          <div class="dropdown">
            <button class="ctrl-btn" data-bs-toggle="dropdown" aria-expanded="false" ref="ghRef" title="GitHub">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.7c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>
              <span>GitHub</span>
              <svg class="chevron" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M1 1l5 5 5-5"/></svg>
            </button>
            <ul class="gh-menu dropdown-menu dropdown-menu-end">
              <li class="gh-section">{{ t.createdBy }}</li>
              <li>
                <a class="gh-item" href="https://github.com/atravkovs" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="gh-mini"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.7c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>
                  <span class="gh-name">s0ck3t</span>
                  <span class="gh-role">author</span>
                </a>
              </li>
              <li class="gh-section">{{ t.modifiedBy }}</li>
              <li>
                <a class="gh-item" href="https://github.com/habarung12" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="gh-mini"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-1.7c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>
                  <span class="gh-name">habarung</span>
                  <span class="gh-role">modder</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Theme -->
          <button class="ctrl-btn" @click="toggleTheme">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
            <span>{{ isDark ? t.themeLight : t.themeDark }}</span>
          </button>

          <!-- Language -->
          <button class="ctrl-btn ctrl-lang" @click="toggleLanguage">
            {{ language === 'ru' ? 'EN' : 'RU' }}
          </button>

          <!-- GNC -->
          <a class="ctrl-btn ctrl-gnc" href="https://gncow.ru/" target="_blank" rel="noopener" title="GNC">
            <img src="/gnc-logo.png" alt="GNC" />
            <span>GNC</span>
          </a>
        </div>
      </div>
    </header>

    <div class="app-grid">
      <div class="content-box">
        <Lobby />
      </div>
      <div class="content-box teams-box">
        <Teams />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import '@/styles/main.scss';
import { defineComponent, onMounted, ref } from 'vue';
import Dropdown from 'bootstrap/js/src/dropdown';
import { language, t, toggleLanguage } from '@/i18n';

import Lobby from '@/components/Lobby.vue';
import Teams from '@/components/Teams.vue';
import OWIcon from '@/components/svg/OWIcon.vue';

export default defineComponent({
  name: 'App',
  components: { Lobby, Teams, OWIcon },

  setup() {
    const saved = localStorage.getItem('theme');
    const isDark = ref(saved !== 'light');
    const ghRef = ref(null);

    const applyTheme = (dark: boolean) => {
      document.body.classList.toggle('dark-mode', dark);
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    };

    applyTheme(isDark.value);

    onMounted(() => { if (ghRef.value) new Dropdown(ghRef.value); });

    const toggleTheme = () => {
      isDark.value = !isDark.value;
      applyTheme(isDark.value);
    };

    return { toggleTheme, toggleLanguage, language, t, isDark, ghRef };
  },
});
</script>

<style lang="scss" scoped>
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins';

.app-wrapper { min-height: 100vh; }

/* ── Floating pill topbar (left-aligned) ── */
.topbar-wrap {
  position: sticky;
  top: 14px;
  z-index: 30;
  display: flex;
  justify-content: flex-start;
  padding: 14px clamp(16px, 3vw, 40px) 0;
  max-width: 1500px;
  margin: 0 auto;
}

.topbar-pill {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 8px 8px 16px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-1) 88%, transparent);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid var(--border-strong);
  box-shadow: 0 8px 30px rgba(0,0,0,.25);
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
}
.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: linear-gradient(145deg, #f99e1a, #c9760a);
  box-shadow: 0 4px 14px rgba(249,158,26,.3);

  :deep(svg), :deep(img) {
    width: 20px !important;
    height: 20px !important;
    filter: brightness(0) !important;
  }
}
.brand-text { display: flex; flex-direction: column; }
.brand-title {
  font-size: 1rem !important;
  font-weight: 700 !important;
  letter-spacing: -.02em !important;
  line-height: 1.05 !important;
  color: var(--text) !important;
  margin: 0 !important;
  white-space: nowrap;
}
.brand-sub {
  font-size: .62rem;
  color: var(--text-dim);
  font-weight: 600;
  letter-spacing: .05em;
  text-transform: uppercase;
  margin-top: 2px;
  white-space: nowrap;
}

.topbar-divider {
  width: 1px;
  height: 28px;
  background: var(--border-strong);
  flex-shrink: 0;
}

.topbar-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 15px;
  border-radius: 999px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: .82rem;
  font-weight: 600;
  font-family: var(--font);
  cursor: pointer;
  transition: .16s ease;
  white-space: nowrap;

  svg { width: 15px; height: 15px; flex-shrink: 0; }
  .chevron { width: 10px; height: 10px; opacity: .6; }

  &:hover {
    border-color: var(--border-strong);
    color: var(--text);
    background: var(--elevated);
  }
}
.ctrl-lang {
  min-width: 48px;
  justify-content: center;
  font-family: var(--mono);
  font-weight: 700;
}

.ctrl-gnc {
  text-decoration: none;
  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
    flex-shrink: 0;
  }
  &:hover { border-color: var(--accent); color: var(--text); }
}

/* GitHub dropdown menu */
.gh-menu {
  background: var(--surface-1);
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 16px 40px rgba(0,0,0,.4);
  min-width: 200px;
  margin-top: 8px !important;
}
.gh-section {
  font-size: .62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--text-dim);
  padding: 6px 10px 4px;
  list-style: none;
}
.gh-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 9px;
  text-decoration: none;
  color: var(--text-muted);
  transition: .12s;

  &:hover { background: var(--surface-3); color: var(--text); }
}
.gh-mini { width: 16px; height: 16px; flex-shrink: 0; }
.gh-name { font-size: .85rem; font-weight: 600; flex: 1; }
.gh-role {
  font-size: .62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--text-dim);
  background: var(--surface-3);
  padding: 2px 7px;
  border-radius: 6px;
}

.app-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  padding: 28px clamp(16px, 3vw, 40px) 48px;
  max-width: 1500px;
  margin: 0 auto;
  align-items: start;
}

.teams-box {
  padding: 20px !important;
}

@media (max-width: 880px) {
  .app-grid { grid-template-columns: 1fr; }
}
</style>
