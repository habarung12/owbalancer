<template>
  <div
    class="d-flex justify-content-between w-100"
    draggable="true"
    v-if="player"
    @contextmenu="editPlayer"
    @dragstart="drag"
  >
    <div class="d-flex">
      <div class="text-center lh-80" :class="{ 'd-flex': !!teamUuid, 'w-40p': !teamUuid }">
        <div>
          <rank-icon :rank="sr" />
        </div>
      </div>

      <div class="text-ellip" :class="{ 'lh-100': !teamUuid, 'ps-1': !!teamUuid, wt: !!teamUuid }">
        <span class="extra-icon">
          <crown-icon v-if="player.identity.isCaptain" />
        </span>

        {{ player.identity.name }}
      </div>
    </div>

    <div class="role-icons">
      <lock-icon v-if="player.identity.isLocked" />

      <role-icon
        v-for="(role, index) in state.icons"
        :rtype="role"
        :key="role"
        :class="{ 'secondary-role': index > 0 }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, computed } from 'vue';

import { useStore } from '@/store';
import PObj, { LobbyType, Player } from '@/objects/player';
import MutationTypes from '@/store/mutation-types';

import LockIcon from '@/components/svg/LockIcon.vue';
import RoleIcon from '@/components/svg/RoleIcon.vue';
import RankIcon from '@/components/svg/RankIcon.vue';
import CrownIcon from '@/components/svg/CrownIcon.vue';

export default defineComponent({
  name: 'PlayerCard',

  props: {
    teamUuid: String,
    player: Object as PropType<Player>,
    prefferedRole: String,
    prefferedRank: Number,
    rankRole: String,
    lobby: {
      type: String as PropType<LobbyType>,
      default: 'players',
    },
  },

  components: { RoleIcon, RankIcon, CrownIcon, LockIcon },

  setup(props) {
    const store = useStore();

    const drag = (ev: DragEvent) => {
      let a = null;

      if (ev?.dataTransfer) {
        a = ev.dataTransfer.setData(
          'playerTag',
          props.player?.identity.uuid || ''
        );

        a = ev.dataTransfer.setData('team', props.teamUuid || '');
        a = ev.dataTransfer.setData('from', props.lobby || '');
      }

      return a;
    };

    const editPlayer = (e: MouseEvent) => {
      e.preventDefault();

      if (props.player === undefined) return;

      store.commit(MutationTypes.EDIT_PLAYER, {
        playerId: props.player.identity.uuid,
        lobby: props.lobby,
      });
    };

    const icons = computed(() => {
  const classes = Object.entries(props.player?.stats.classes || {});

  return classes
    .filter(([, role]) => role.isActive)
    .sort(([, role], [, role2]) => role.priority - role2.priority)
    .map(([name]) => name);
});

    const state = reactive({
      icons,
    });

    const sr = computed(() => {
      if (!props.player) return 0;

      if (props.rankRole)
        return PObj.getRole(
          props.player.stats.classes,
          props.rankRole
        ).rank;

      if (props.prefferedRank) return props.prefferedRank;

      return PObj.getTopRank(props.player);
    });

    return {
      sr,
      drag,
      state,
      editPlayer,
    };
  },
});
</script>

<style lang="scss" scoped>
.text-ellip {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.wt {
  width: 160px;
}

.lh-100 {
  line-height: 50px;
}

.lh-80 {
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
}

.w-40p {
  width: 42px;
  min-width: 42px;
}

.lh-80 :deep(img),
.lh-80 :deep(svg) {
  width: 30px !important;
  height: 30px !important;
  object-fit: contain;
  flex-shrink: 0;
}

.w-100 {
  padding: 0 10px;
  min-height: 50px;
  align-items: center;
  background: transparent;
}

.role-icons {
  line-height: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 2px;
}

.role-icons > * {
  font-size: 0.8em;
  color: var(--bs-gray);
}

.role-icons > *:last-child {
  font-size: 1em;
  color: var(--bs-gray-dark);
}

.extra-icon {
  color: var(--bs-info);
}

.secondary-role {
  opacity: 0.35 !important;
  transform: scale(0.88);
  filter: grayscale(15%);
}

.secondary-role :deep(svg),
.secondary-role :deep(img) {
  opacity: 0.35 !important;
}

:global(body.dark-mode) .w-100 {
  background: transparent !important;
  color: #f1f1f1 !important;
}

:global(body.dark-mode) .role-icons > * {
  color: #cbd5e1 !important;
}

:global(body.dark-mode) .extra-icon {
  color: #38bdf8 !important;
}
</style>