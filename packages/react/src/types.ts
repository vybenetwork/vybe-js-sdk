import { Account } from '@vybenetwork/core'

export interface VybeContextAttrs {
  account: Account | null
}

export enum VybeWidget {
  ReverseNFTSearch = 'reverse-nft-search',
}

export interface BaseConfig {
  widgets: (typeof VybeWidget)[keyof typeof VybeWidget][]
}
