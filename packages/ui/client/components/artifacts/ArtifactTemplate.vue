<script setup lang="ts">
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<template>
  <div class="flex flex-col gap-4">
    <header>
      <h1>
        <slot name="title" />
      </h1>
    </header>
    <p v-if="slots.message">
      <slot name="message" />
    </p>
    <slot />
  </div>
</template>
