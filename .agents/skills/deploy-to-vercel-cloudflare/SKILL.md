---
name: deploy-to-vercel-cloudflare
description: Deploy a Next.js app to Vercel with a custom domain managed by Cloudflare DNS (studex-group.com). Use when deploying any new site or subdomain under the StudEx Group domain.
---

# Deploy to Vercel + Cloudflare

This skill covers deploying a Next.js application to Vercel with a custom domain on Cloudflare (studex-group.com).

## Prerequisites

- **Vercel token**: Stored as `VERCEL_TOKEN` org secret. Get from Vercel → Settings → Tokens.
- **Vercel team scope**: `stud-ex-s-projects`
- **Cloudflare**: Domain `studex-group.com` managed via Cloudflare (nameservers: javon.ns.cloudflare.com, suzanne.ns.cloudflare.com). DNS records must be added manually in Cloudflare dashboard (CAPTCHA blocks programmatic access).
- **Cloudflare DNS proxy**: Set to "DNS only" (grey cloud) for Vercel domains — Vercel needs direct connection for SSL.

## Deployment Steps

### 1. Prepare the Next.js app

```bash
# Ensure next.config.js does NOT have output: "standalone" (Vercel handles its own build)
# Remove or comment it out:
# const nextConfig = { output: "standalone" };  <-- REMOVE
const nextConfig = {};

# Verify build works locally
cd /path/to/app
npm install
npm run build
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
sudo npm install -g vercel

# Deploy to production (replace APP_DIR with your app path)
cd /path/to/app
vercel deploy --prod --yes --scope stud-ex-s-projects --token "${VERCEL_TOKEN}"
```

The output will show:
- `Production` URL (e.g., `https://app-name-xxx.vercel.app`)
- `Aliased` URL (e.g., `https://app-name.vercel.app`)

### 3. Add custom domain to Vercel project

For a subdomain (e.g., `factory.studex-group.com`):
```bash
vercel domains add factory.studex-group.com PROJECT_NAME --scope stud-ex-s-projects --token "${VERCEL_TOKEN}"
```

For the root domain:
```bash
vercel domains add studex-group.com PROJECT_NAME --scope stud-ex-s-projects --token "${VERCEL_TOKEN}"
vercel domains add www.studex-group.com PROJECT_NAME --scope stud-ex-s-projects --token "${VERCEL_TOKEN}"
```

### 4. Configure Cloudflare DNS

Tell the user to add these DNS records in Cloudflare dashboard (https://dash.cloudflare.com → studex-group.com → DNS):

**For root domain:**
| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | @ | 76.76.21.21 | DNS only (grey cloud) |
| CNAME | www | cname.vercel-dns.com | DNS only (grey cloud) |

**For a subdomain (e.g., factory):**
| Type | Name | Value | Proxy |
|------|------|-------|-------|
| CNAME | factory | cname.vercel-dns.com | DNS only (grey cloud) |

### 5. Verify domain

```bash
# Check DNS propagation
dig +short YOUR_DOMAIN @8.8.8.8

# Verify Vercel sees the domain
vercel domains verify YOUR_DOMAIN --scope stud-ex-s-projects --token "${VERCEL_TOKEN}"

# Test HTTP (works immediately)
curl -sI http://YOUR_DOMAIN

# Test HTTPS (may take 5-15 minutes for SSL cert provisioning)
curl -sI https://YOUR_DOMAIN
```

### 6. Verify SSL

SSL certs are auto-provisioned by Vercel. Check status:
```bash
vercel certs ls --scope stud-ex-s-projects --token "${VERCEL_TOKEN}"
```

If SSL isn't working after 15 minutes, check:
- Cloudflare proxy is set to "DNS only" (grey cloud, NOT orange)
- No conflicting A/AAAA/CNAME records for the same hostname
- Domain is verified: `vercel domains verify YOUR_DOMAIN --scope stud-ex-s-projects --token "${VERCEL_TOKEN}"`

## Current Deployments

| Domain | Project | Status |
|--------|---------|--------|
| studex-group.com | dark-factory | Live |
| www.studex-group.com | dark-factory | Live |
| dark-factory-wheat.vercel.app | dark-factory | Live (Vercel default) |

## Adding a New Subdomain Site

To add another site (e.g., Global Markets at `markets.studex-group.com`):

1. Build the Next.js app
2. `vercel deploy --prod --yes --scope stud-ex-s-projects --token "${VERCEL_TOKEN}"`
3. `vercel domains add markets.studex-group.com PROJECT_NAME --scope stud-ex-s-projects --token "${VERCEL_TOKEN}"`
4. Tell user to add in Cloudflare: CNAME → markets → cname.vercel-dns.com (DNS only)
5. Wait 5-15 min for SSL, verify with `curl -sI https://markets.studex-group.com`

## Troubleshooting

- **"An A, AAAA, or CNAME record with that host already exists"**: Delete the conflicting record in Cloudflare first, then add the new one.
- **SSL not provisioning**: Ensure Cloudflare proxy is "DNS only" (grey cloud). Vercel can't issue certs when traffic goes through Cloudflare's proxy.
- **"missing_scope" error**: Add `--scope stud-ex-s-projects` to all vercel commands.
- **CAPTCHA on Cloudflare dashboard**: Cannot automate Cloudflare DNS changes from this VM. Must ask user to add records manually or provide API token.
