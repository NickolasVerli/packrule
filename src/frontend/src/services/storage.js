const KEY_PREFIX = 'packrule:'

function read(name) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + name)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(name, items) {
  localStorage.setItem(KEY_PREFIX + name, JSON.stringify(items))
}

export function createCollection(name, initialItems = []) {
  if (read(name) === null) write(name, initialItems)

  return {
    list: () => read(name) ?? [],
    find: (id) => (read(name) ?? []).find((item) => item.id === id) ?? null,
    insert(data) {
      const item = { ...data, id: crypto.randomUUID() }
      write(name, [...(read(name) ?? []), item])
      return item
    },
    update(id, data) {
      const items = read(name) ?? []
      const updated = { ...items.find((item) => item.id === id), ...data, id }
      write(name, items.map((item) => (item.id === id ? updated : item)))
      return updated
    },
    remove(id) {
      write(name, (read(name) ?? []).filter((item) => item.id !== id))
    },
    removeWhere(predicate) {
      write(name, (read(name) ?? []).filter((item) => !predicate(item)))
    },
  }
}
