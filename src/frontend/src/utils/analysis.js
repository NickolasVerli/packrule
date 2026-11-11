import { CLASSIFICATIONS } from './constants'

export function countByClassification(findings) {
  const counts = Object.fromEntries(Object.keys(CLASSIFICATIONS).map((key) => [key, 0]))
  findings.forEach((finding) => {
    counts[finding.classification] += 1
  })
  return counts
}

export function indexById(items) {
  return Object.fromEntries(items.map((item) => [item.id, item]))
}
