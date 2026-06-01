-- Replace Cloudflare-blocked sources with working alternatives
-- uneed/theresanaiforthat/futurepedia → devto/github_trending/hn_launches
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_source_check;
ALTER TABLE leads ADD CONSTRAINT leads_source_check
  CHECK (source IN ('product_hunt','hacker_news','betalist','devto','github_trending','hn_launches'));
