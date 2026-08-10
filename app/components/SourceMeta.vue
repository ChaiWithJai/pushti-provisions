<script setup lang="ts">
import { Download16 as Download, Launch16 as Launch } from '@carbon/icons-vue'
import type { BoxingDocument } from '~/types/content'
defineProps<{ document: BoxingDocument }>()
</script>

<template>
  <div class="source-actions">
    <a class="cds--btn cds--btn--primary" :href="document.source.pdfUrl" download>
      Download canonical PDF <Download :size="16" />
    </a>
    <a class="cds--btn cds--btn--tertiary" :href="document.source.driveUrl" target="_blank" rel="noopener noreferrer">
      View in Drive <Launch :size="16" />
    </a>
  </div>
</template>
