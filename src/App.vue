<template>
  <div class="container-fluid px-0 app-wrapper">
    <header class="topbar d-flex justify-content-between align-items-center w-100 px-4 mx-auto">
      <div class="brand">
        <div class="brand-mark">
          <OWIcon />
        </div>
        <div>
          <h1 class="brand-title">{{ t.title }}</h1>
          <div class="brand-sub">Overwatch · Custom Lobby</div>
        </div>
      </div>

      <div class="topbar-right">
        <div class="credits">
          <div>Created by <a target="_blank" href="https://github.com/atravkovs">s0ck3t</a></div>
          <div>Modified by <strong>habarung</strong></div>
        </div>
        <div class="tools">
          <button class="pill-btn" @click="toggleTheme">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
            <span>{{ isDark ? 'Light' : 'Dark' }}</span>
          </button>
          <button class="pill-btn" @click="toggleLanguage">
            {{ language === 'ru' ? 'EN' : 'RU' }}
          </button>
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
import { defineComponent, ref } from 'vue';
import { language, t, toggleLanguage } from '@/i18n';

import Lobby from '@/components/Lobby.vue';
import Teams from '@/components/Teams.vue';
import OWIcon from '@/components/svg/OWIcon.vue';

export default defineComponent({
  name: 'App',
  components: { Lobby, Teams, OWIcon },

  setup() {
    const isDark = ref(true);

    document.body.classList.add('dark-mode');

    const toggleTheme = () => {
      isDark.value = !isDark.value;
      document.body.classList.toggle('dark-mode', isDark.value);
    };

    return { toggleTheme, toggleLanguage, language, t, isDark };
  },
});
</script>

<style lang="scss" scoped>
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins';

.app-wrapper { min-height: 100vh; }

.topbar {
  height: 66px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: linear-gradient(145deg, #f99e1a, #c9760a);
  box-shadow: 0 4px 14px rgba(249,158,26,.3);

  :deep(svg), :deep(img) {
    width: 21px !important;
    height: 21px !important;
    filter: brightness(0) !important;
  }
}

.brand-title {
  font-size: 1.18rem !important;
  font-weight: 700 !important;
  letter-spacing: -.03em !important;
  line-height: 1 !important;
  color: #f4f5f7 !important;
  margin: 0 !important;
}

.brand-sub {
  font-size: .72rem;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: .04em;
  text-transform: uppercase;
  margin-top: 3px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.credits {
  text-align: right;
  font-size: .74rem;
  color: #6b7280;
  line-height: 1.45;

  a, strong {
    color: #a4a9b4;
    font-weight: 600;
    text-decoration: none;
  }
  a:hover { color: #f99e1a; }
}

.tools {
  display: flex;
  gap: 8px;
}

.pill-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  background: #16181d;
  border: 1px solid rgba(255,255,255,.07);
  color: #a4a9b4;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: .16s ease;

  svg { width: 15px; height: 15px; }

  &:hover {
    border-color: rgba(255,255,255,.12);
    color: #f4f5f7;
    background: #1c1f26;
  }
}

.app-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  padding: 24px clamp(16px, 3vw, 40px) 48px;
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
