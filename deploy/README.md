# EasyTransfer Deployment

This deployment runs:

- Socket.IO signaling server on `127.0.0.1:3000`, published through Nginx.
- coturn STUN/TURN on `3478/tcp`, `3478/udp`, and relay ports `49160-49200/udp`.

## Cloudflare DNS

Replace the example hostnames with your real domain names.

| Name | Type | Target | Proxy status |
| --- | --- | --- | --- |
| `file.ch3nyang.top` | `CNAME` | `<github-user>.github.io` | Proxied or DNS only |
| `signal.ch3nyang.top` | `A` | `82.29.67.202` | Proxied |
| `turn.ch3nyang.top` | `A` | `82.29.67.202` | DNS only |

Notes:

- `signal` can be proxied by Cloudflare because it uses HTTPS/WSS on port `443`.
- `turn` must be DNS only because regular Cloudflare proxy does not proxy TURN UDP traffic.
- Keep SSL/TLS mode as `Full` or `Full (strict)` after the origin certificate is installed.

## GitHub Variables and Secret

Set these repository variables for the client build:

```text
VITE_SIGNAL_SERVER_URL=https://signal.ch3nyang.top
VITE_TURN_URL=turn:turn.ch3nyang.top:3478
VITE_TURN_USERNAME=easytransfer
VITE_STUN_URL=stun:turn.ch3nyang.top:3478
```

Set this repository secret:

```text
VITE_TURN_CREDENTIAL=<same value as TURN_PASSWORD on the server>
```

## Server Commands

Create `/opt/easytransfer/deploy/.env` from `deploy/.env.example`, replace the example domains and password, then start services:

```bash
cd /opt/easytransfer/deploy
docker compose --env-file .env up -d --build
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 49160:49200/udp
```

After editing `.env` later, restart the containers:

```bash
cd /opt/easytransfer/deploy
docker compose --env-file .env up -d
```

After DNS points to the VPS, install the Nginx site. The checked-in Nginx
template expects a certificate at `/etc/ssl/easytransfer/`. You can use a
Cloudflare Origin Certificate, or a self-signed certificate when Cloudflare SSL
mode is `Full`.

```bash
cd /opt/easytransfer
set -a
. deploy/.env
set +a
sudo mkdir -p /etc/ssl/easytransfer
sudo openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
  -keyout /etc/ssl/easytransfer/signal.ch3nyang.top.key \
  -out /etc/ssl/easytransfer/signal.ch3nyang.top.crt \
  -subj "/CN=$SIGNAL_DOMAIN" \
  -addext "subjectAltName=DNS:$SIGNAL_DOMAIN"
sudo cp deploy/nginx/easytransfer-signal.conf /etc/nginx/sites-available/easytransfer-signal
sudo sed -i "s/signal.ch3nyang.top/$SIGNAL_DOMAIN/g" /etc/nginx/sites-available/easytransfer-signal
sudo ln -sf /etc/nginx/sites-available/easytransfer-signal /etc/nginx/sites-enabled/easytransfer-signal
sudo nginx -t
sudo systemctl reload nginx
```

If you want a Let's Encrypt certificate instead, temporarily disable Cloudflare
proxy or disable Cloudflare's forced HTTP-to-HTTPS redirect for
`signal.ch3nyang.top`, then run:

```bash
sudo certbot --nginx -d "$SIGNAL_DOMAIN"
```
