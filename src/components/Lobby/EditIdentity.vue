<template>
  <div>
    <div class="identity-name-row">
      <label for="name" class="col-form-label identity-label">Name</label>

      <input
        type="text"
        id="name"
        class="form-control identity-input"
        v-model="mIdentity.name"
      />

      <div class="identity-actions">
        <a
          :href="battleNetLink"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-primary btn-sm action-btn"
        >
          Battle.net
        </a>

        <a
          :href="trackerLink"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-success btn-sm action-btn"
        >
          Tracker
        </a>

        <button
          type="button"
          class="btn btn-warning btn-sm action-btn check-btn"
          :disabled="isChecking"
          @click="checkBattleNet"
        >
          <span v-if="isChecking" class="spinner"></span>
          {{ isChecking ? 'Checking' : 'Check BNet' }}
        </button>
      </div>

      <div
        v-if="checkStatus"
        class="bnet-status"
        :class="{
          success: checkStatusType === 'success',
          error: checkStatusType === 'error'
        }"
      >
        {{ checkStatus }}
      </div>
    </div>

    <div class="identity-options">
      <label class="option-card">
        <div>
          <strong>Captain</strong>
          <small>Marks player as team captain</small>
        </div>
        <input type="checkbox" class="form-check-input" v-model="mIdentity.isCaptain" />
      </label>

      <label class="option-card">
        <div>
          <strong>Full flex</strong>
          <small>Can play all roles</small>
        </div>
        <input type="checkbox" class="form-check-input" v-model="mIdentity.isFullFlex" />
      </label>

      <label class="option-card">
        <div>
          <strong>Is Locked</strong>
          <small>Prevents editing stats</small>
        </div>
        <input type="checkbox" class="form-check-input" v-model="mIdentity.isLocked" />
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { Identity } from '@/objects/player';
import { computed, defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'EditIdentity',

  props: {
    identity: Object as PropType<Identity>,
  },

  setup(props, { emit }) {
    const identity = computed(() => props.identity);
    const mIdentity = ref(identity);

    const isChecking = ref(false);
    const checkStatus = ref('');
    const checkStatusType = ref<'success' | 'error' | ''>('');

    const battleNetLink = computed(() => {
      const name = mIdentity.value?.name || '';
      const nickname = name.split('#')[0];

      return `https://overwatch.blizzard.com/en-us/search/?q=${encodeURIComponent(
        nickname
      )}`;
    });

    const trackerLink = computed(() => {
      const name = mIdentity.value?.name || '';
      const battletag = name.replace('#', '-');

      return `https://tracker.gg/overwatch/profile/battlenet/${encodeURIComponent(
        battletag
      )}/overview`;
    });

    const checkBattleNet = async () => {
      const name = mIdentity.value?.name || '';
      const battletag = name.replace('#', '-');

      checkStatus.value = '';
      checkStatusType.value = '';

      if (!battletag) {
        checkStatus.value = 'Введите BattleTag';
        checkStatusType.value = 'error';
        return;
      }

      try {
        isChecking.value = true;

        const response = await fetch(
          `https://overfast-api.tekrop.fr/players/${encodeURIComponent(
            battletag
          )}/summary`
        );

        if (!response.ok) {
          checkStatus.value = 'Профиль не найден или закрыт';
          checkStatusType.value = 'error';
          return;
        }

        const data = await response.json();

        emit('update-bnet-stats', data.competitive?.pc || {});

        checkStatus.value = 'Статистика обновлена';
        checkStatusType.value = 'success';
      } catch (error) {
        console.error(error);
        checkStatus.value = 'Ошибка проверки Battle.net';
        checkStatusType.value = 'error';
      } finally {
        isChecking.value = false;
      }
    };

    return {
      mIdentity,
      battleNetLink,
      trackerLink,
      checkBattleNet,
      isChecking,
      checkStatus,
      checkStatusType,
    };
  },
});
</script>

<style scoped>
.identity-name-row {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface-2);
  display: grid;
  grid-template-columns: 90px 1fr;
  align-items: center;
  gap: 10px 14px;
}
.identity-label {
  margin: 0;
  font-weight: 700;
  color: #94a3b8;
  font-size: 13px;
}
.identity-input {
  max-width: 100%;
  height: 38px;
  border-radius: 10px;
}
.identity-actions {
  grid-column: 2;
  margin: 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.action-btn {
  min-width: 96px;
  border-radius: 8px;
  font-weight: 600;
}
.check-btn {
  min-width: 115px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,0.2);
  border-top-color: rgba(255,255,255,0.8);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.bnet-status {
  grid-column: 2;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}
.bnet-status.success { color: #6ee7b7; background: rgba(16,185,129,0.12); }
.bnet-status.error   { color: #fca5a5; background: rgba(239,68,68,0.12); }
.identity-options {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.option-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
  cursor: pointer;
  transition: 0.15s ease;
}
.option-card:hover {
  border-color: var(--border-strong);
  background: var(--surface-3);
}
.option-card strong {
  display: block;
  font-size: 13px;
  color: #e2e8f0;
  font-weight: 600;
}
.option-card small {
  display: block;
  color: #64748b;
  font-size: 11px;
  line-height: 1.2;
}
.option-card input {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: #2380b1;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>