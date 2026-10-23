-- Use verified branch destinations instead of general business-name searches.
UPDATE public.site_settings SET value = (
  SELECT jsonb_agg(CASE item->>'id'
    WHEN 'stockist-emawa-mart' THEN item || jsonb_build_object('directions', 'https://www.google.com/maps/dir/?api=1&destination=9.007352,38.7428241&destination_place_id=ChIJsfBmVwCFSxYRelOY9oGmt18')
    WHEN 'stockist-allmart' THEN item || jsonb_build_object('directions', 'https://www.google.com/maps/dir/?api=1&destination=8.986868,38.7213186&destination_place_id=ChIJ231yVymHSxYRnioIpCNap3Y')
    ELSE item END ORDER BY ordinal)
  FROM jsonb_array_elements(value) WITH ORDINALITY AS entries(item, ordinal)
), updated_at = now() WHERE key = 'stockists';
