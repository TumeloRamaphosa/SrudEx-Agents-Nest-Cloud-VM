# phone and homies — Hermes WebUI + local/remote model integration plan

## Goal

Use Hermes WebUI as the single chat dashboard. It talks to the StudEx Agent OS OpenAI-compatible endpoint at `http://localhost:5000/v1`. StudEx routes each model name to the right backend:

- `finance-agent` → local StudEx Finance agent
- `grok-*` / `xai/*` → Grok / xAI API
- `quinn/*` / `qwen/*` → Quinn / Qwen / custom OpenAI-compatible endpoint
- `local/<model>` / `llama/<model>` → local `llama-server` (phone or VM)

## Auth placeholders (do not commit real keys)

Copy `studex-agent-os/.env.example` to `studex-agent-os/.env` and fill in the keys you want to use:

```bash
cp studex-agent-os/.env.example studex-agent-os/.env
```

```ini
GROK_API_KEY=                         # from https://console.x.ai
GROK_BASE_URL=https://api.x.ai/v1

QUINN_API_KEY=                         # your Quinn / Qwen / custom endpoint key
QUINN_BASE_URL=                        # e.g. https://dashscope.aliyun.com/compatible-mode/v1

LOCAL_LLAMA_API_KEY=                   # usually empty for local-hermes-portable
LOCAL_LLAMA_BASE_URL=http://localhost:9090/v1
```

## 1. Phone local model (local-hermes-portable)

### Recommended models by phone RAM

| Free RAM* | Model | Quant | Why |
|-----------|-------|-------|-----|
| ~2 GB | `unsloth/Qwen3.5-0.8B-GGUF` | Q4_K_M | fits almost any Android phone |
| ~3-4 GB | `unsloth/Qwen3.5-2B-GGUF` | Q4_K_M | good instruction following |
| ~4-6 GB | `unsloth/Qwen3.5-4B-GGUF` | Q4_K_M | best quality for upper-mid phones |
| ~7 GB+ | `unsloth/Qwen3.5-9B-GGUF` | Q4_K_M | flagship phone quality |
| ~6 GB+ | `unsloth/LFM2-8B-A1B-GGUF` | Q4_K_M | fast MoE, good agentic tasks, avoid heavy coding/knowledge |

*Free RAM = roughly 40-50% of total RAM on Android.

### Linux setup on the phone

The easiest fully-featured Linux environment on Android is **Termux + proot-distro Ubuntu**:

```bash
# 1. Install Termux from F-Droid (the Play Store build is old)
# 2. In Termux:
termux-wake-lock
pkg update
pkg install -y proot-distro git curl
proot-distro install ubuntu
proot-distro login ubuntu

# 3. Inside Ubuntu proot:
apt update
apt install -y curl git

git clone https://github.com/techjarves/local-hermes-portable.git
cd local-hermes-portable
chmod +x linux.sh
./linux.sh
```

When the menu appears:
- Choose `2] Run Hardware Analysis and Model Fit` to see what fits.
- Download the GGUF it recommends into `models/`.
- Choose `1] Start Chat Server and Web UI` to start `llama-server` on `http://localhost:9090`.

### Connect the phone to the desktop/VM

Install Tailscale on the phone (or run `tailscale up` inside proot if you have the binary). Once the phone has a Tailscale IP, set the desktop `LOCAL_LLAMA_BASE_URL` to:

```ini
LOCAL_LLAMA_BASE_URL=http://<phone-tailscale-ip>:9090/v1
```

## 2. Hermes WebUI setup

Hermes WebUI is already configured with a `custom` OpenAI-compatible provider pointing at StudEx:

- Provider: `custom`
- Base URL: `http://localhost:5000/v1`
- API key: `dummy` (or leave blank; real provider keys live in `.env`)

When you start a chat, pick the model from the dropdown:

- `finance-agent` for the StudEx Finance agent
- `grok-2-latest` / `grok-3-mini` for Grok (requires `GROK_API_KEY`)
- `quinn/default` or `qwen/<model>` for Quinn/Qwen (requires `QUINN_BASE_URL` and `QUINN_API_KEY`)
- `local/<gguf-model-name>` for the phone/VM `llama-server`

## 3. Dockerized Hermes WebUI (optional VM deploy)

The repo has `Dockerfile` support. A minimal compose entry:

```yaml
services:
  hermes-webui:
    build: .
    ports:
      - "8789:8789"
    environment:
      - HERMES_WEBUI_PORT=8789
      - HERMES_WEBUI_HOST=0.0.0.0
    volumes:
      - hermes-state:/root/.hermes
volumes:
  hermes-state:
```

For **Orgo** (or any VM host), deploy this container and point it at StudEx Agent OS:

```ini
STUDEX_API_BASE=http://<studex-host>:5000/v1
```

## 4. Loop until done

Run the integration check script. With `--loop` it polls every 10 seconds and stops when every provider you configured is reachable:

```bash
cd scripts
python3 hermes-integration-loop.py --loop
```

When it reports all green, the Hermes dashboard is ready.
