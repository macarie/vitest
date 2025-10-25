<script setup lang="ts">
import type { TestArtifact } from 'vitest'
import { computed } from 'vue'
import SmallTabs from './SmallTabs.vue'
import SmallTabsPane from './SmallTabsPane.vue'
import VisualRegressionImage from './VisualRegressionImage.vue'
import VisualRegressionSlider from './VisualRegressionSlider.vue'

const props = defineProps<{
  artifact: TestArtifact
}>()

const groups = computed(() => ({
  diff: props.artifact.attachments.find(({ name }) => name === 'diff'),
  reference: props.artifact.attachments.find(({ name }) => name === 'reference'),
  actual: props.artifact.attachments.find(({ name }) => name === 'actual'),
}))
</script>

<template>
  <SmallTabs>
    <SmallTabsPane v-if="groups.diff" name="diff" title="Diff">
      <VisualRegressionImage :attachment="groups.diff" />
    </SmallTabsPane>
    <SmallTabsPane v-if="groups.reference" name="reference" title="Reference">
      <VisualRegressionImage :attachment="groups.reference" />
    </SmallTabsPane>
    <SmallTabsPane v-if="groups.actual" name="actual" title="Actual">
      <VisualRegressionImage :attachment="groups.actual" />
    </SmallTabsPane>
    <SmallTabsPane v-if="groups.reference && groups.actual" name="slider" title="Slider">
      <VisualRegressionSlider :actual="groups.actual" :reference="groups.reference" />
    </SmallTabsPane>
  </SmallTabs>
</template>
