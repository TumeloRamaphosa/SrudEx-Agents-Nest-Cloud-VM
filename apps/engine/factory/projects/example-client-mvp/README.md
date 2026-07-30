# Project Sandbox

This folder is copied for each client project.

The container mounts `workspace/` at `/workspace` and exposes model endpoints through:

- `OLLAMA_BASE_URL`
- `MESH_LLM_BASE_URL`

Start with dry-run:

```bash
npm run factory:project:start -- --slug example-client-mvp
```

Start live:

```bash
npm run factory:project:start -- --slug example-client-mvp --live
```
