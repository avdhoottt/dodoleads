import type { Priority } from './supabase'

// Already thinking about money — highest intent for DodoPayments
const HOT_KEYWORDS = [
  'stripe', 'paddle', 'lemonsqueezy', 'lemon squeezy', 'gumroad',
  'billing', 'payments', 'payment', 'subscription', 'monetize', 'monetization',
  'credits', 'usage-based', 'usage based', 'revenue', 'pricing',
  'checkout', 'invoice', 'invoicing', 'paid', 'freemium', 'paywall',
  'saas', 'mrr', 'arr', 'b2b',
]

// Building a real product — every founder here eventually needs payments
const WARM_KEYWORDS = [
  'launch', 'launched', 'shipped', 'built', 'released',
  'users', 'waitlist', 'beta', 'early access', 'sign up',
  'startup', 'product', 'tool', 'platform', 'service', 'software',
  'app', 'api', 'dashboard', 'workflow', 'automation', 'integration',
  'open source', 'self-hosted', 'cli', 'sdk', 'library',
  'maker', 'indie', 'solopreneur', 'founder',
]

export function classifyPriority(text: string): Priority {
  const lower = text.toLowerCase()
  if (HOT_KEYWORDS.some((kw) => lower.includes(kw))) return 'hot'
  if (WARM_KEYWORDS.some((kw) => lower.includes(kw))) return 'warm'
  return 'cold'
}
