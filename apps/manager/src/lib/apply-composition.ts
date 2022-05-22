import { desiredComposition } from "../data/network-composition"

type Container = {
  role: string
}

export function applyComposition(containers: Container[]) {
  const conts = JSON.parse(JSON.stringify(containers))

  const out = []

  for (const collection of desiredComposition) {
    const current = {
      name: collection.name,
      services: collection.services.map(s => ({ ...s, found: [] as Container[] }))
    }

    for (const c of conts) {
      for (const s of current.services) {
        if (s.id !== c.role) continue

        s.found.push(c)
        c._tracked = true
      }
    }

    out.push(current)
  }

  const untracked = {
    name: 'untracked',
    services: []
  }
  for (const c of conts) {
    if (c._tracked) continue
    untracked.services.push({
      id: c.role,
      min: 0,
      max: 0,
      found: c
    })
  }

  if (untracked.services.length)
    out.push(untracked)

  return out
}
