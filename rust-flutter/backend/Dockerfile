# syntax=docker/dockerfile:1

# ---- Builder stage: compiles a release binary of the api crate ----
FROM rust:1.98.1-slim-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY . .

RUN cargo build --release --locked -p api

# ---- Runtime stage: minimal image with only the compiled binary ----
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --system --no-create-home --uid 10001 appuser

COPY --from=builder /build/target/release/api /usr/local/bin/api

USER appuser
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/api"]
