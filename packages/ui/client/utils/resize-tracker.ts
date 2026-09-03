type ROCallback = (entry: ResizeObserverEntry) => void
interface ROCallbackEntry {
  fn: ROCallback
  meta: { once: boolean }
}

class ResizeTracker {
  #resizeObserver: ResizeObserver
  #callbacks: WeakMap<Element, Set<ROCallbackEntry>>

  constructor() {
    this.#callbacks = new WeakMap()
    this.#resizeObserver = new ResizeObserver(this.#manager)
  }

  #manager = (entries: ResizeObserverEntry[]): void => {
    for (const entry of entries) {
      const callbacks = this.#callbacks.get(entry.target)

      if (!callbacks) {
        continue
      }

      for (const callback of callbacks) {
        callback.fn(entry)

        if (callback.meta.once) {
          callbacks.delete(callback)
        }
      }

      if (callbacks.size === 0) {
        this.#removeElement(entry.target)
      }
    }
  }

  #removeElement(element: Element): void {
    this.#callbacks.delete(element)
    this.#resizeObserver.unobserve(element)
  }

  onResize(element: Element, fn: ROCallback, once: boolean = false) {
    let callbacks = this.#callbacks.get(element)

    if (!callbacks) {
      callbacks = new Set()
      this.#callbacks.set(element, callbacks)
      this.#resizeObserver.observe(element)
    }

    const callback: ROCallbackEntry = { fn, meta: { once } }

    callbacks.add(callback)

    return () => {
      const callbacks = this.#callbacks.get(element)

      if (!callbacks) {
        return
      }

      callbacks.delete(callback)

      if (callbacks.size === 0) {
        this.#removeElement(element)
      }
    }
  }
}

/**
 * @internal
 */
export const resizeTracker = new ResizeTracker()
