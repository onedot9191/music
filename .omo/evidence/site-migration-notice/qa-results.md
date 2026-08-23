# Site migration notice QA

- Source revision: current working tree after the migration-notice implementation
- Captured states: desktop 1280x900, tablet 768x900, mobile 375x812
- Capture files are valid JPEG images and match the dimensions in their filenames.
- Visible state: the modal contains the migration reason, the Cloudflare Pages link, and the dismissal button.
- Hidden state: `http://127.0.0.1:8080/` leaves `#site-migration-modal` without the `active` class and `isVisible()` returns `false`.
- Interaction state: a temporary copy of the current source enabled the Vercel branch on localhost; the modal changed from visible to hidden after clicking `기존 주소에서 계속 이용`.
- Navigation target: `https://music-8pz.pages.dev/`.
- Product hostname tests separately cover `music.vercel.app` as visible and `music-8pz.pages.dev` as hidden.
