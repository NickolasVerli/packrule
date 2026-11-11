import { createCollection } from './storage'
import { INITIAL_MARKETS, INITIAL_PRODUCTS, INITIAL_RULES, INITIAL_VERSIONS } from './seed'

export const markets = createCollection('markets', INITIAL_MARKETS)
export const products = createCollection('products', INITIAL_PRODUCTS)
export const versions = createCollection('versions', INITIAL_VERSIONS)
export const rules = createCollection('rules', INITIAL_RULES)
export const analyses = createCollection('analyses', [])
export const findings = createCollection('findings', [])
