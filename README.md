# Urus at its Peak — prototype (GitHub Pages)

Static site, no build step.

| Path | What |
|---|---|
| `/` | Prototype: registration web + mailings toggle (no data is sent) |
| `/landing/` | Production landing. Test with `?wave=E&email=jane@media.com&title=Ms&first_name=Jane&last_name=Doe` (add `&rsvp=no` for the decline screen). Sections and legal docs by hash: `#program`, `#travel`, `#faq`, `#privacy-policy`, `#cookie-policy`, `#terms-of-use` |
| `/emails/` | Raw HTML e-mails (`01-invitation.html`, `02-registration-confirmed.html`, `03-reply-declined.html`) |

## Deploy
1. Create a repo and push the contents of this folder to the root of `main`.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
3. The site is served at `https://<user>.github.io/<repo>/`. All paths are relative, so it works under a project subpath.

`.nojekyll` disables Jekyll processing. `robots.txt` and `noindex` meta keep it out of search engines, but a Pages URL is public to anyone who has it.
