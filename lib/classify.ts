import type { Priority } from './supabase'

const HOT_KEYWORDS = [
  'stripe', 'paddle', 'lemonsqueezy', 'lemon squeezy', 'gumroad',
  'billing', 'payments', 'payment', 'subscription', 'monetize', 'monetization',
  'credits', 'usage-based', 'usage based', 'saas', 'api',
  'revenue', 'pricing', 'checkout', 'invoice', 'invoicing',
]

const WARM_KEYWORDS = [
  'launch', 'users', 'waitlist', 'beta', 'growth',
  'startup', 'product', 'tool', 'platform', 'software',
  'app', 'dashboard', 'workflow', 'automation',
]

export function classifyPriority(text: string): Priority {
  const lower = text.toLowerCase()
  if (HOT_KEYWORDS.some((kw) => lower.includes(kw))) return 'hot'
  if (WARM_KEYWORDS.some((kw) => lower.includes(kw))) return 'warm'
  return 'cold'
}
