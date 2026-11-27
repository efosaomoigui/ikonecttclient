# Website Promotion

Administrators can open Administration → Website Promotion in the existing staff workspace. Upload PNG, JPEG or WebP artwork up to 1 MB, supply an accessible title and image description, optionally set an action label/link, and publish. Drafts, future campaigns and expired campaigns are not returned by the public endpoint. Start/end times entered in Admin use the operator's local time and are stored as UTC timestamps.

The public website shows a large centered, image-only overlay after five seconds on the homepage and residential, business or company overview. The action button sits on the image. Artwork stays uncropped and scales within the viewport. The close button and Escape dismiss it. Marketing copy fields remain stored in Admin, while only artwork and the configured button are visually displayed.

A browser sees each saved campaign version at most once in 24 hours. Saving a campaign creates a new version. The promotion does not interrupt enquiry forms, focused input fields or the open Help Assistant. The overlay respects reduced motion and disappears when navigating away from an eligible page. Unavailable backend responses simply leave promotions hidden.

Artwork is stored with campaign settings in PostgreSQL; it is not written to ephemeral hosting disk. The public API is GET /api/v1/promotions/active. GET and PATCH /api/v1/admin/promotion require staff.manage. Writes produce an audit event without copying artwork into the audit log. Only the Admin promotion endpoint accepts JSON bodies up to 2 MB; existing endpoints retain their limits. Image type signatures, upload size, schedule ordering and action URLs are validated. SVG, HTML, script URLs and credential-bearing links are refused.

Apply the website_promotion Prisma migration on the destination backend. Preserve PostgreSQL storage/backups and allow a 2 MB request body at the reverse proxy for the authenticated promotion settings route. This feature needs the normal backend connection on the chosen host.

The supplied Black Friday artwork is configured only in the local development database as a labelled presentation sample, expiring after 24 hours. It is not a seeded public offer or a Git asset. Upload and publish approved production artwork through Admin on the destination backend.

Verification: publication/pausing, schedule enforcement, permission checks, image validation, unsafe-link rejection, five-second timing, dismissal, frequency limiting and live local backend rendering are covered by automated checks. Native browser visual signoff remains a release review step.
