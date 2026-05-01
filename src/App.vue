<template>
  <div class="container-fluid px-0 app-wrapper">
    <div class="topbar d-flex justify-content-between w-100 py-2 mb-2 px-3 mx-auto">
      <div class="d-flex align-items-center">
        <OWIcon />
        <h3 class="ms-2 mb-0 title">Tournament Balancer</h3>
      </div>

      <div class="text-end credits">
        <div>
          Created by
          <a target="_blank" href="https://github.com/atravkovs">s0ck3t</a>
        </div>
        <div>
          Modified by
          <strong>habarung</strong>
        </div>

        <button class="theme-btn mt-1" @click="toggleTheme">
          🌙 Theme
        </button>
      </div>
    </div>

    <div class="row px-2 pb-2 mx-auto g-2">
      <div class="lobby-wrapper col">
        <div class="content-box">
          <Lobby />
        </div>
      </div>

      <div class="col">
        <div class="content-box">
          <Teams />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import '@/styles/main.scss';
import { defineComponent } from 'vue';

import Lobby from '@/components/Lobby.vue';
import Teams from '@/components/Teams.vue';
import OWIcon from '@/components/svg/OWIcon.vue';

export default defineComponent({
  name: 'App',
  components: { Lobby, Teams, OWIcon },

  setup() {
    const darkMode = localStorage.getItem('darkMode') === 'true';

    if (darkMode) {
      document.body.classList.add('dark-mode');
    }

    const toggleTheme = () => {
      document.body.classList.toggle('dark-mode');

      localStorage.setItem(
        'darkMode',
        document.body.classList.contains('dark-mode').toString()
      );
    };

    return { toggleTheme };
  },
});
</script>

<style lang="scss" scoped>
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins';

.app-wrapper {
  background: #f8f9fa;
  min-height: 100vh;
}

.topbar {
  background: white;
  border-bottom: 1px solid #dee2e6;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.title {
  font-weight: 700;
  color: #212529;
}

.credits {
  font-size: 0.9rem;
  color: #6c757d;
}

.credits a {
  text-decoration: none;
  font-weight: 600;
}

.theme-btn {
  border: none;
  background: #343a40;
  color: white;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 13px;
}

.theme-btn:hover {
  background: #495057;
}

.content-box {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
}

@include media-breakpoint-up(md) {
  .lobby-wrapper {
    flex: none;
    width: 25rem !important;
  }
}

</style>