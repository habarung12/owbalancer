<template>
  <img class="s-2em" :src="rankIcon" />
</template>

<script setup>
import { computed } from 'vue';

import bronze from "@/assets/rank_icons/bronze.png";
import silver from "@/assets/rank_icons/silver.png";
import gold from "@/assets/rank_icons/gold.png";
import platinum from "@/assets/rank_icons/platinum.png";
import emerald from "@/assets/rank_icons/emerald.png";
import diamond from "@/assets/rank_icons/diamond.png";
import master from "@/assets/rank_icons/master.png";
import grandmaster from "@/assets/rank_icons/grandmaster.png";
import champion from "@/assets/rank_icons/champion.png";

const props = defineProps(["rank"]);

const rankIcon = computed(() => {
  if (props.rank < 1000) return bronze;
  if (props.rank < 1500) return silver;
  if (props.rank < 2000) return gold;
  if (props.rank < 2500) return platinum;
  if (props.rank < 3000) return emerald;
  if (props.rank < 3500) return diamond;
  if (props.rank < 4000) return master;
  if (props.rank < 4500) return grandmaster;
  return champion;
});
</script>