<template>
  <div class="slider-block">
    <div class="slider-header">
      <span class="slider-label">Dispersion</span>
      <span class="slider-value">±{{ options.range }}</span>
    </div>
    <div class="slider-track dispersion-track">
      <input
        type="range"
        class="styled-range"
        min="0"
        max="120"
        step="1"
        v-model.number="options.range"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useStore } from '@/store';

export default defineComponent({
  name: 'Dispersion',
  setup() {
    const store = useStore();
    const options = ref(computed(() => store.state.balancerOptions));
    return { options };
  },
});
</script>

<style lang="scss" scoped>
.slider-block {
  margin-bottom: 16px;
}
.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.slider-label {
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-dim);
}
.slider-value {
  font-family: var(--mono);
  font-size: .82rem;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 2px 8px;
  border-radius: 6px;
}
.slider-track {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}
.dispersion-track::before {
  content: '';
  position: absolute;
  left: 0; right: 0;
  height: 6px;
  border-radius: 99px;
  background: linear-gradient(to right, #6aa3e0 0%, #5fd3c4 30%, var(--surface-3) 50%, #f99e1a 70%, #e0685f 100%);
  pointer-events: none;
}
.styled-range {
  width: 100%;
  height: 6px;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  outline: none;
  cursor: pointer;
  position: relative;
  z-index: 1;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--accent);
    box-shadow: 0 2px 6px rgba(0,0,0,.4);
    cursor: pointer;
    transition: transform .14s, box-shadow .14s;
  }
  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 0 0 4px var(--accent-soft), 0 2px 6px rgba(0,0,0,.4);
  }
  &::-moz-range-thumb {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--accent);
    cursor: pointer;
  }
}
</style>
