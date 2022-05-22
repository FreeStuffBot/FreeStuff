
type Service = {
  id: string
  min: number
  max: number
}

type Collection = {
  name: string
  services: Service[]
}

type Composite = Collection[]

//

export const desiredComposition: Composite = [
  {
    name: 'Core',
    services: [
      { id: 'api', min: 1, max: 1 },
      { id: 'manager', min: 1, max: 1 }
    ]
  },
  {
    name: 'Tools',
    services: [
      { id: 'thumbnailer', min: 1, max: 1 },
      { id: 'link-proxy', min: 1, max: 1 }
    ]
  },
  {
    name: 'Discord',
    services: [
      { id: 'discord-gateway', min: 1, max: 1 },
      { id: 'discord-interactions', min: 1, max: 5 }
    ]
  },
  {
    name: 'Publisher',
    services: [
      { id: 'discord-publisher', min: 1, max: 10 },
      { id: 'telegram-publisher', min: 0, max: 1 },
      { id: 'twitter-publisher', min: 0, max: 1 },
      { id: 'api-publisher', min: 1, max: 1 }
    ]
  }
]