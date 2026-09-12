#!/usr/bin/env bash
# Canonical backend CI checks: formatting, linting, build, tests.
# Used identically by GitHub Actions and Azure DevOps so both platforms stay in sync.
set -euo pipefail

cd "$(dirname "$0")/../../rust-flutter/backend"

echo "==> cargo fmt --check"
cargo fmt --check

echo "==> cargo clippy --all-targets --all-features -- -D warnings"
cargo clippy --all-targets --all-features -- -D warnings

echo "==> cargo build --locked"
cargo build --locked

echo "==> cargo test --workspace"
cargo test --workspace
