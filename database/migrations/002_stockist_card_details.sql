-- Add the approved stockist details without replacing other Admin-managed locations.
WITH current AS (
  SELECT value FROM public.site_settings WHERE key = 'stockists'
), enriched AS (
  SELECT COALESCE(jsonb_agg(
    CASE item->>'id'
      WHEN 'stockist-emawa-mart' THEN jsonb_build_object('logoUrl', '/stockists/emawa-mart.png', 'phone', '', 'instagram', '') || item
      WHEN 'stockist-allmart' THEN jsonb_build_object('logoUrl', '/stockists/allmart.png', 'phone', '', 'instagram', '') || item
      ELSE item
    END ORDER BY ordinal
  ), '[]'::jsonb) AS value
  FROM current, jsonb_array_elements(current.value) WITH ORDINALITY AS entries(item, ordinal)
), next AS (
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM jsonb_array_elements(enriched.value) AS item
    WHERE item->>'id' = 'stockist-mt-super-valu' OR lower(item->>'name') = 'mt super valu'
  ) THEN enriched.value ELSE enriched.value || jsonb_build_array(jsonb_build_object(
    'id', 'stockist-mt-super-valu', 'number', '03', 'name', 'MT Super Valu',
    'address', '', 'note', '',
    'directions', 'https://maps.app.goo.gl/cfMsVfKDRppetFwi6?g_st=it',
    'logoUrl', '/stockists/mt-super-valu.jpg', 'phone', '090 376 7778',
    'instagram', 'https://www.instagram.com/mt_super_valu/'
  )) END AS value FROM enriched
)
UPDATE public.site_settings SET value = next.value, updated_at = now()
FROM next WHERE key = 'stockists';
