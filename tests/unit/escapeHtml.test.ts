import { describe, expect, it } from 'vitest'

import { escapeHtml } from '@/lib/escapeHtml'

describe('escapeHtml', () => {
  it('neutralise les caractères HTML', () => {
    expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;',
    )
  })

  it('accepte les valeurs vides et les nombres', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
    expect(escapeHtml(42)).toBe('42')
  })
})
