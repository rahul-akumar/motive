#!/usr/bin/env node
/**
 * convert-to-oklch.mjs
 * Converts hex, rgb, rgba, hsl, hsla color values in a file to oklch().
 * Usage: bun packages/tailwind-config/scripts/convert-to-oklch.mjs <file>
 */

import { readFileSync, writeFileSync } from 'fs'
import { parse, oklch, formatCss } from 'culori'

const file = process.argv[2]
if (!file) {
  console.error('Usage: convert-to-oklch.mjs <file>')
  process.exit(1)
}

let src = readFileSync(file, 'utf8')

function toOklch(colorStr) {
  const parsed = parse(colorStr)
  if (!parsed) return null
  const c = oklch(parsed)
  if (!c) return null

  const L = c.l.toFixed(3)
  const C = (c.c ?? 0).toFixed(3)
  const H = isNaN(c.h) ? '0' : c.h.toFixed(1)
  const alpha = c.alpha

  if (alpha !== undefined && alpha !== 1) {
    const a = typeof alpha === 'number' ? +alpha.toFixed(3) : alpha
    return `oklch(${L} ${C} ${H} / ${a})`
  }
  return `oklch(${L} ${C} ${H})`
}

// ── Hex 8-digit (#rrggbbaa) ────────────────────────────────────────────────
src = src.replace(/#([0-9a-fA-F]{8})\b/g, (match) => {
  const result = toOklch(match)
  return result ?? match
})

// ── Hex 6-digit (#rrggbb) ─────────────────────────────────────────────────
src = src.replace(/#([0-9a-fA-F]{6})\b/g, (match) => {
  const result = toOklch(match)
  return result ?? match
})

// ── Hex 3-digit (#rgb) ────────────────────────────────────────────────────
src = src.replace(/#([0-9a-fA-F]{3})\b/g, (match) => {
  const result = toOklch(match)
  return result ?? match
})

// ── rgba(...) ─────────────────────────────────────────────────────────────
src = src.replace(/rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)/g, (match) => {
  const result = toOklch(match)
  return result ?? match
})

// ── rgb(...) ──────────────────────────────────────────────────────────────
src = src.replace(/rgb\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)/g, (match) => {
  const result = toOklch(match)
  return result ?? match
})

// ── hsla(...) ─────────────────────────────────────────────────────────────
src = src.replace(/hsla\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*,\s*[\d.]+\s*\)/g, (match) => {
  const result = toOklch(match)
  return result ?? match
})

// ── hsl(...) ──────────────────────────────────────────────────────────────
src = src.replace(/hsl\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*\)/g, (match) => {
  const result = toOklch(match)
  return result ?? match
})

writeFileSync(file, src, 'utf8')
console.log(`✓ ${file}`)
