<template>
  <img class="s-2em" :src="rankIcon" />
</template>

<script setup>
import { computed } from "vue";

import bronze from "@/assets/rank_icons/bronze.png";
import silver from "@/assets/rank_icons/silver.png";
import gold from "@/assets/rank_icons/gold.png";
import platinum from "@/assets/rank_icons/platinum.png";
import diamond from "@/assets/rank_icons/diamond.png";
import master from "@/assets/rank_icons/master.png";
import grandmaster from "@/assets/rank_icons/grandmaster.png";
import champion from "@/assets/rank_icons/champion.png";

const props = defineProps(["rank"]);

const rankIcon = computed(() => {
  if (props.rank < 1500) return bronze;       // 0 - 1499
  if (props.rank < 2000) return silver;      // 1500 - 1999
  if (props.rank < 2500) return gold;        // 2000 - 2499
  if (props.rank < 3000) return platinum;    // 2500 - 2999
  if (props.rank < 3500) return diamond;     // 3000 - 3499
  if (props.rank < 4000) return master;      // 3500 - 3999
  if (props.rank < 4500) return grandmaster; // 4000 - 4499
  return champion;                           // 4500+
});
</script>