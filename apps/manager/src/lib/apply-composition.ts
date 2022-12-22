import Mongo from "../database/mongo"

type Container = {
  role: string
}

export async function applyComposition(containers: Container[]): Promise<any[]> {
  const conts = JSON.parse(JSON.stringify(containers))

  const out = []
  const desiredComposition = await Mongo.Misc
    .findById('config.service-composition')
    .lean()
    .exec()

  if (!desiredComposition) return []

  for (const collection of desiredComposition.data) {
    if (!collection?.name || !collection.services?.length) continue

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
      id: c.role ?? c.imageName ?? c.id,
      min: 0,
      max: 0,
      found: [ c ]
    })
  }

  if (untracked.services.length)
    out.push(untracked)

  return out
}
