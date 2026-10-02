# misch.ke

[![Deploy misch.ke](https://github.com/Saritus/misch-ke/actions/workflows/deploy.yml/badge.svg)](https://github.com/Saritus/misch-ke/actions/workflows/deploy.yml)

Source code and deployment configuration for **[misch.ke](https://misch.ke/)** — the personal portfolio and CV site of **Sebastian Mischke**.

The site is intentionally lightweight: plain HTML, CSS and JavaScript, served by Nginx on a VPS, proxied through Cloudflare, secured with HTTPS, and deployed automatically with GitHub Actions.

---

## Overview

`misch.ke` is a personal developer portfolio rather than a traditional résumé page. It presents professional experience, selected projects, technologies, education and contact information in a modern, responsive interface.

The current site focuses on:

- backend and software engineering
- AI-assisted document-processing systems
- developer tooling and automation
- industrial and automotive software
- deep-learning and computer-vision research
- selected personal and open-source projects

The frontend deliberately avoids a framework for now. There is no build step, package manager or runtime dependency required to serve the site.

## Live site

**Production:** https://misch.ke/

`www.misch.ke` serves the same site.

---

## Tech stack

### Frontend

- HTML5
- modern CSS
- vanilla JavaScript
- responsive layout
- CSS animations and transitions
- `IntersectionObserver` reveal effects
- `prefers-reduced-motion` support
- semantic markup
- basic SEO / structured metadata

### Production infrastructure

- Ubuntu VPS
- Nginx
- Let's Encrypt / Certbot
- Cloudflare DNS and proxy
- UFW firewall
- SSH key authentication

### CI/CD

- Git
- GitHub
- GitHub Actions
- SSH
- `rsync`

---

## Architecture

Production traffic follows this path:

```text
Visitor
   │
   │ HTTPS
   ▼
Cloudflare
   │
   │ HTTPS — Full (strict)
   ▼
Nginx on the VPS
   │
   ▼
/var/www/misch.ke
   │
   ▼
Static HTML / CSS / JavaScript
```

Cloudflare provides public DNS and acts as a reverse proxy. The origin server also has a valid Let's Encrypt certificate, so Cloudflare can use **Full (strict)** TLS mode.

---

## Repository structure

```text
.
├── .github/
│   └── workflows/
│       └── deploy.yml
├── favicon.svg
├── index.html
├── robots.txt
├── script.js
├── sitemap.xml
├── styles.css
└── README.md
```

### `index.html`

Contains the semantic structure and content:

- hero / introduction
- about section
- professional experience
- selected work and projects
- technology stack
- education
- contact section

### `styles.css`

Contains the complete visual design:

- layout
- typography
- responsive behavior
- cards
- timeline
- terminal-style hero visual
- animations
- hover states
- mobile adaptations
- reduced-motion handling

### `script.js`

Contains lightweight client-side behavior:

- reveal-on-scroll effects
- terminal-card pointer tilt
- current-year footer value
- active navigation highlighting
- contact email construction

### `favicon.svg`

SVG favicon used by the site.

### `robots.txt`

Allows normal search-engine crawling and references the sitemap.

### `sitemap.xml`

Minimal sitemap for the production domain.

---

## Running locally

Because the site is static, no build system is required.

### Simple option

Open:

```text
index.html
```

directly in a browser.

### Local web server

Using Python:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Or, if Node.js is available:

```bash
npx serve .
```

A local HTTP server is useful when browser behavior differs from `file://`.

---

## Development workflow

The normal workflow is:

```text
edit
  ↓
test locally
  ↓
git add
  ↓
git commit
  ↓
git push
  ↓
GitHub Actions
  ↓
automatic production deployment
```

Example:

```bash
git add .
git commit -m "Improve experience section"
git push
```

A push to `main` automatically starts the production deployment workflow.

---

## Automatic deployment

Production deployment is defined in:

```text
.github/workflows/deploy.yml
```

The workflow runs when:

- a commit is pushed to `main`
- it is started manually from the GitHub Actions UI

The deployment process is:

1. check out the repository
2. configure the dedicated SSH deployment key
3. verify that required website files exist
4. connect to the VPS
5. synchronize the repository to the Nginx document root with `rsync`

The production document root is:

```text
/var/www/misch.ke/
```

The workflow uses:

```text
rsync -az --delete
```

This means the public directory mirrors the deployed repository content. Files removed from the repository are also removed from production unless explicitly excluded.

The workflow excludes repository-only files such as:

```text
.git/
.github/
README.md
```

so they are not published by Nginx.

---

## GitHub Actions secrets

The deployment uses repository-level GitHub Actions secrets.

### `DEPLOY_SSH_KEY`

Private SSH key used only by GitHub Actions to authenticate to the production server.

The matching public key is installed in the deployment user's:

```text
~/.ssh/authorized_keys
```

This deployment key is separate from personal SSH keys.

### `SSH_KNOWN_HOSTS`

Contains the trusted SSH host key for the production server.

This allows strict SSH host verification instead of blindly trusting whichever machine answers at the configured address.

### Never commit secrets

Do not commit any of the following:

- private SSH keys
- passwords
- API tokens
- Cloudflare credentials
- GitHub secrets
- server credentials

---

## Server-side assumptions

The deployment expects the server to provide:

- SSH
- a non-root deployment user
- `rsync`
- Nginx
- write access for the deployment user to `/var/www/misch.ke`

The deployment user should own the document root, for example:

```bash
sudo chown -R sebastian:sebastian /var/www/misch.ke
```

The production deployment intentionally does not log in as `root`.

---

## Nginx

Nginx serves:

```text
/var/www/misch.ke
```

A minimal HTTP server block looks conceptually like:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name misch.ke www.misch.ke;

    root /var/www/misch.ke;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Certbot adds the HTTPS configuration.

After changing Nginx configuration, always validate it first:

```bash
sudo nginx -t
```

Then reload it:

```bash
sudo systemctl reload nginx
```

Static file updates do **not** require an Nginx reload.

---

## HTTPS

The origin server uses a Let's Encrypt certificate managed by Certbot.

The certificate covers:

```text
misch.ke
www.misch.ke
```

Renewal can be tested with:

```bash
sudo certbot renew --dry-run
```

Cloudflare is configured with:

```text
SSL/TLS mode: Full (strict)
```

That means HTTPS is used on both connections:

```text
visitor → Cloudflare
Cloudflare → origin server
```

---

## DNS

Cloudflare is the authoritative DNS provider.

The important records are conceptually:

```text
A    misch.ke        → production origin
A    www.misch.ke    → production origin
```

Both are proxied through Cloudflare.

The domain registrar and DNS provider are separate. Moving the VPS does not require transferring the domain; only DNS needs to be updated.

---

## Firewall and SSH security

The VPS uses UFW with a deny-by-default incoming policy.

The expected public ports are:

```text
22/tcp   SSH
80/tcp   HTTP
443/tcp  HTTPS
```

Other services should not be exposed unless there is a specific reason.

For example, a future MySQL/MariaDB instance should normally listen only locally or inside a Docker network instead of exposing port `3306` publicly.

SSH administration uses:

- SSH keys
- a normal user with `sudo`
- disabled direct root login
- disabled password authentication

---

## Updating the site

For normal content or design changes:

```bash
git add .
git commit -m "Describe the change"
git push
```

No manual `scp`, FTP upload, Nginx restart or server login is required.

After the GitHub Actions workflow completes successfully, the new version is live.

If a browser appears to show an old version:

1. hard-refresh the page
2. test in a private/incognito window
3. check Cloudflare caching if necessary

For aggressively cached assets, versioned filenames or cache-busting query strings can be introduced later.

---

## Manual deployment fallback

Automatic deployment should normally be used.

If GitHub Actions is unavailable, a manual deployment is still possible.

Example with `scp`:

```bash
scp -r ./* sebastian@SERVER:/var/www/misch.ke/
```

Example with `rsync`:

```bash
rsync -az --delete \
  --exclude '.git/' \
  --exclude '.github/' \
  --exclude 'README.md' \
  ./ sebastian@SERVER:/var/www/misch.ke/
```

Replace `SERVER` with the configured production host.

---

## Rollback

Git history is the source of truth.

To undo a bad production change:

```bash
git log --oneline
git revert <commit>
git push
```

The normal GitHub Actions workflow then deploys the reverted version.

Using `git revert` is generally safer than rewriting the shared `main` branch history.

---

## Troubleshooting

### GitHub Action cannot connect

Check:

- `DEPLOY_SSH_KEY` exists and contains the complete private key
- the matching public key exists in `~/.ssh/authorized_keys`
- `SSH_KNOWN_HOSTS` matches the server host key
- SSH port `22` is reachable
- the deployment user still exists
- the deployment user can write to `/var/www/misch.ke`

### `Permission denied (publickey)`

Verify the authorized keys:

```bash
cat ~/.ssh/authorized_keys
```

and permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### `rsync` permission errors

Check:

```bash
ls -ld /var/www/misch.ke
```

The deployment user needs write permission.

### Cloudflare 5xx errors

Check Nginx:

```bash
sudo systemctl status nginx
sudo nginx -t
```

Check listening ports:

```bash
sudo ss -tulpn
```

Ports `80` and `443` should be available publicly.

### HTTPS problems

Check certificate status:

```bash
sudo certbot certificates
```

Test renewal:

```bash
sudo certbot renew --dry-run
```

Cloudflare should remain in **Full (strict)** mode while the origin certificate is valid.

---

## Maintenance

Useful occasional server checks:

```bash
sudo apt update
sudo apt upgrade
```

Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
```

Firewall:

```bash
sudo ufw status verbose
```

Certificates:

```bash
sudo certbot renew --dry-run
```

Disk:

```bash
df -h
```

Memory:

```bash
free -h
```

---

## Possible future improvements

The current architecture is intentionally simple, but it can grow when needed.

Potential additions:

- richer project case studies
- project screenshots and demos
- downloadable CV
- improved social-preview metadata
- self-hosted analytics
- HTML/CSS validation in CI
- Lighthouse performance checks
- automated image optimization
- preview deployments for pull requests
- Dockerized services
- PHP or Node.js backend functionality
- contact-form API
- database-backed content
- small interactive demos

Backend services should be added only when a feature actually needs them. A static architecture remains preferable while the site can remain static.

---

## Design philosophy

The project follows a few principles:

- **Fast by default** — no unnecessary framework or runtime.
- **Readable source** — understandable without a complex toolchain.
- **Progressive enhancement** — core content remains usable without JavaScript.
- **Responsive** — desktop and mobile are first-class targets.
- **Accessible motion** — animation respects `prefers-reduced-motion`.
- **Automated deployment** — production updates require no manual file copying.
- **Secure origin** — SSH keys, firewall rules, HTTPS and strict Cloudflare TLS are baseline infrastructure.

---

## Author

**Sebastian Mischke**

- Website: https://misch.ke/
- GitHub: https://github.com/Saritus

---

## License

No explicit open-source license is currently included.

Unless a license is added, the repository and its contents remain under the default copyright terms of the author.
