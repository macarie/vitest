import type { AsyncExpectationResult, MatcherState } from '@vitest/expect'
import type { TestArtifact } from 'vitest'
import type { ScreenshotMatcherOptions } from '../../../../context'
import type { ScreenshotMatcherArguments, ScreenshotMatcherOutput } from '../../../shared/screenshotMatcher/types'
import type { Locator } from '../locators'
import { getBrowserState, getWorkerState } from '../../utils'
import { convertToSelector } from '../tester-utils'

const counters = new Map<string, { current: number }>([])

export default async function toMatchScreenshot(
  this: MatcherState,
  actual: Element | Locator,
  nameOrOptions?: ScreenshotMatcherOptions | string,
  options: ScreenshotMatcherOptions = typeof nameOrOptions === 'object'
    ? nameOrOptions
    : {},
): AsyncExpectationResult {
  if (this.isNot) {
    throw new Error('\'toMatchScreenshot\' cannot be used with "not"')
  }

  const currentTest = getWorkerState().current

  if (currentTest === undefined || this.currentTestName === undefined) {
    throw new Error('\'toMatchScreenshot\' cannot be used without test context')
  }

  const counterName = `${currentTest.result?.repeatCount ?? 0}${this.testPath}${this.currentTestName}`
  let counter = counters.get(counterName)

  if (counter === undefined) {
    counter = { current: 0 }

    counters.set(counterName, counter)
  }

  counter.current += 1

  const name = typeof nameOrOptions === 'string'
    ? nameOrOptions
    : `${this.currentTestName} ${counter.current}`

  const normalizedOptions: Omit<ScreenshotMatcherArguments[2], 'element'> = (
    options.screenshotOptions && 'mask' in options.screenshotOptions
      ? {
          ...options,
          screenshotOptions: {
            ...options.screenshotOptions,
            mask: (options.screenshotOptions.mask as Array<Element | Locator>)
              .map(convertToSelector),
          },
        }
      // TS believes `mask` to still be defined as `ReadonlyArray<Element | Locator>`
      : options as any
  )

  const result = await getBrowserState().commands.triggerCommand<ScreenshotMatcherOutput>(
    '__vitest_screenshotMatcher',
    [
      name,
      this.currentTestName,
      {
        element: convertToSelector(actual),
        ...normalizedOptions,
      },
    ] satisfies ScreenshotMatcherArguments,
  )

  if (result.pass === false && 'context' in currentTest) {
    const { attachArtifact } = currentTest.context

    const attachments: TestArtifact['attachments'] = []

    if (result.reference) {
      attachments.push({ name: 'reference', path: result.reference.path, metadata: result.reference.metadata })
    }

    if (result.actual) {
      attachments.push({ name: 'actual', path: result.actual.path, metadata: result.actual.metadata })
    }

    if (result.diff) {
      attachments.push({ name: 'diff', path: result.diff })
    }

    if (attachments.length > 0) {
      await attachArtifact({
        title: 'Visual Regression',
        source: 'toMatchScreenshot',
        type: 'visual-regression',
        attachments,
      })
    }
  }

  return {
    pass: result.pass,
    message: () =>
      result.pass
        ? ''
        : [
            this.utils.matcherHint('toMatchScreenshot', 'element', ''),
            '',
            result.message,
            result.reference
              ? `\nReference screenshot:\n  ${this.utils.EXPECTED_COLOR(result.reference.path)}`
              : null,
            result.actual
              ? `\nActual screenshot:\n  ${this.utils.RECEIVED_COLOR(result.actual.path)}`
              : null,
            result.diff
              ? this.utils.DIM_COLOR(`\nDiff image:\n  ${result.diff}`)
              : null,
            '',
          ]
            .filter(element => element !== null)
            .join('\n'),
  }
}
