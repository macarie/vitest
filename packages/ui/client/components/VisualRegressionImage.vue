<script setup lang="ts">
import type { TestArtifactAttachment } from '@vitest/runner/types/tasks'
import { computed } from 'vue'
import { internalOrExternalUrl, isExternalAttachment } from '~/composables/attachments'
import VisualRegressionImageContainer from './VisualRegressionImageContainer.vue'

const props = defineProps<{
  attachment: TestArtifactAttachment
}>()

const href = computed<string>(() => internalOrExternalUrl(props.attachment))
</script>

<template>
  <VisualRegressionImageContainer>
    <a
      target="_blank"
      :href="href"
      :referrerPolicy="isExternalAttachment(attachment) ? 'no-referrer' : undefined"
    >
      <img
        :src="href"
      >
    </a>
  </VisualRegressionImageContainer>
</template>
