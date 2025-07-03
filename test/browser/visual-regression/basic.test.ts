import { describe } from 'vitest'
import { render } from '../fixtures/expect-dom/utils'

describe('components', (it) => {
  it('button', async ({ expect }) => {
    const { container } = render(/* html */`
      <button>Button</button>
    `)

    await expect(container).toMatchScreenshot()
  })

  it('accordion', async ({ expect }) => {
    const { container } = render(/* html */`
      <div>Accordion</div>
    `)

    await expect(container).toMatchScreenshot()
  })
})
