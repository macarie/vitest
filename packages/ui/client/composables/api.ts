import type { BrowserUI } from 'vitest'
import { resizeTracker } from '../utils/resize-tracker'
import { viewport } from './browser'
import { browserState, findById } from './client'
import { currentModule, showDashboard, updateBrowserPanel } from './navigation'
import { activeFileId } from './params'

export const ui: BrowserUI = {
  setCurrentFileId(fileId: string) {
    activeFileId.value = fileId
    currentModule.value = findById(fileId)
    showDashboard(false)
  },
  async setIframeViewport(width: number, height: number): Promise<void> {
    const { promise, resolve } = Promise.withResolvers<'observer' | 'timeout'>()
    const iframe = document.querySelector('iframe')

    const timeout = setTimeout(() => {
      resolve('timeout')
    }, 50 /* assuming at least 20fps */)

    if (iframe) {
      resizeTracker.onResize(iframe, ({ contentRect }) => {
        if (contentRect.width === width && contentRect.height === height) {
          clearTimeout(timeout)
          resolve('observer')
        }
      }, true)
    }

    viewport.value = [width, height]
    if (browserState?.provider === 'webdriverio') {
      updateBrowserPanel()
    }

    return promise.then((result) => {
      if (result === 'timeout') {
        console.warn(
          `No frame was rendered by ${browserState?.config.browser.name ?? 'the browser'} within 50ms after the viewport was resized. Browsers may pause rendering when their window is in the background or fully covered by another window.`,
        )
      }
    })
  },
}
