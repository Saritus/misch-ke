# misch.ke — static portfolio

A dependency-free static portfolio for Sebastian Mischke.

## Files

- `index.html` — content and semantic structure
- `styles.css` — responsive visual design
- `script.js` — reveal effects, terminal tilt, active nav and email link
- `favicon.svg`
- `robots.txt`
- `sitemap.xml`

## Deploy from Windows

The current Nginx setup serves `/var/www/misch.ke`.

If that directory is owned by the `sebastian` user, extract this folder locally and run:

```cmd
scp -r C:\path\to\misch-ke-site\* sebastian@207.180.209.119:/var/www/misch.ke/
```

Then SSH into the server and verify:

```bash
nginx -t
curl -I https://misch.ke
```

No Nginx config change is needed for this static version.

## Optional next steps

- Self-host a profile photo and add it to the hero/about section.
- Put this site in a Git repository.
- Add automated deployment (GitHub Actions -> server via SSH).
- Add a `/projects/` section with richer case studies.
- Add a small Node/PHP backend only when a feature actually needs it.
