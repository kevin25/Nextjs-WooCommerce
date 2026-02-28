'use client'

import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'wc-wishlist'

function getSnapshot(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

function getServerSnapshot(): number[] {
  return []
}

const listeners = new Set<() => void>()

function subscribe(cb: () => void): () => void {
  listeners.add(cb)

  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) cb()
  }
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

function persist(ids: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  listeners.forEach((cb) => cb())
}

export function useWishlist() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const has = useCallback(
    (productId: number) => ids.includes(productId),
    [ids]
  )

  const toggle = useCallback(
    (productId: number) => {
      const current = getSnapshot()
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
      persist(next)
    },
    []
  )

  const add = useCallback((productId: number) => {
    const current = getSnapshot()
    if (!current.includes(productId)) {
      persist([...current, productId])
    }
  }, [])

  const remove = useCallback((productId: number) => {
    const current = getSnapshot()
    persist(current.filter((id) => id !== productId))
  }, [])

  return { ids, has, toggle, add, remove }
}
