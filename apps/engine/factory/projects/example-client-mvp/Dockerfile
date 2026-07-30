FROM node:22-slim

WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates curl python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=development
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434
ENV MESH_LLM_BASE_URL=http://host.docker.internal:9337/v1

CMD ["sleep", "infinity"]
