export type COLOR = Array<string | number>

export interface FORMATTED_COLOR {
  exactMatch: boolean
  name: string
  rgb: string | null
}

export interface CACHED_COLOR {
  [key: string]: FORMATTED_COLOR
}
