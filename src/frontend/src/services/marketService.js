import { markets } from './collections'

export const marketService = {
  list: async () => markets.list(),
}
