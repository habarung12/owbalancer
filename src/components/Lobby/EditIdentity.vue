<template>
  <div>
    <div class="row">
      <div class="col-sm-3">
        <label for="name" class="col-form-label">{{ t.name }}</label>
      </div>
      <div class="col-auto">
        <input type="text" id="name" class="form-control" v-model="mIdentity.name" />
      </div>
    </div>

    <div class="row">
      <div class="col-sm-3">
        <label for="captain" class="col-form-label">{{ t.captain }}</label>
      </div>
      <div class="col-auto">
        <input
          type="checkbox"
          id="captain"
          class="form-check-input mt-2"
          v-model="mIdentity.isCaptain"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-sm-3">
        <label for="fullFlex" class="col-form-label">{{ t.fullFlex }}</label>
      </div>
      <div class="col-auto">
        <input
          type="checkbox"
          id="fullFlex"
          class="form-check-input mt-2"
          v-model="mIdentity.isFullFlex"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-sm-3">
        <label for="locked" class="col-form-label">{{ t.locked }}</label>
      </div>
      <div class="col-auto">
        <input
          type="checkbox"
          id="locked"
          class="form-check-input mt-2"
          v-model="mIdentity.isLocked"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Identity } from '@/objects/player';
import { computed, defineComponent, PropType, ref } from 'vue';
import { t } from '@/i18n';

export default defineComponent({
  name: 'EditIdentity',
  props: {
    identity: Object as PropType<Identity>,
  },
  setup(props) {
    const identity = computed(() => props.identity);
    const mIdentity = ref(identity);

    return { mIdentity, t };
  },
});
</script>