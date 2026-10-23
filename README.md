# Tona Coffee Refresh

Build a new responsive multi-page Tona Coffee website from the provided content. Use the attached tona-website-prototype.html only to extract/reuse available logo and brand visual elements/assets; do NOT reuse its current parchment/cherry editorial document design. Create a fresh bold modern Ethiopian coffee brand site with Tona orange #EE4927, deep teal #164D4F, white and light neutral backgrounds; use orange for navigation/buttons/CTA and teal for trust/supporting sections. Include Home, About, Products, For Business, Events, and Contact pages/sections with the supplied copy; WhatsApp order/enquiry CTAs to +251986212224; product cards for Yirgacheffe, Sidama, Guji and Gesha; business samples, event information, and contact/request form fields. Make it feel warm, community-led, premium, and grounded in Ethiopian coffee ceremony. Extract any usable logo, leaf patterns, coffee imagery/icons from the attached file, and use them appropriately. If direct asset extraction is impossible, recreate clean brand-consistent visual motifs and clear placeholders rather than adopting the prototype layout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d9bc391b-cc56-4de6-8833-1ec4a7eca71a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

<!-- production redeploy trigger: 2026-09-05 12:20 Africa/Addis_Ababa -->


## Admin data connections

Products, events, registrations, stockists, quotations, contact requests and hosted-event inquiries share Neon data with the public site. Public catalogues refresh on page focus. Draft/archived products and unavailable coffee stay hidden. Registration capacity counts guests, excludes cancellations and is checked in a transaction. Admin event dates are entered in East Africa Time (UTC+03:00).

Apply `database/migrations/004_contact_coffee_interest.sql` before deploying contact interest support. This adds a nullable column without changing existing submissions.

Image uploads require server-only `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3` and `AWS_REGION` for a Neon `admin-media` bucket with public reads and authenticated writes. Uploaded images use unique keys, retain HTTPS URLs in records, and are resized in Admin before upload. Credentials must never use a public/VITE prefix. Existing Cloudinary image URLs continue to display.

Run `node tests/ui-contracts.mjs` for form/schema checks. For database integration checks, create an isolated branch, supply its connection string in a private file, and run:

```sh
TONA_QA_DATABASE_URL_FILE=/path/to/private-qa-url node tests/admin-connections.mjs --isolated-database
```

Integration tests create and delete only test records on that isolated database. They stub the authenticated actor and outgoing notifications in temporary compiled modules, so a real signed-in browser check is still required. To include upload/download checks, supply `TONA_QA_STORAGE_FILE` pointing to a private JSON file containing the isolated branch's AWS storage variables. Never point these tests at production.
