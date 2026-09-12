#!/usr/bin/env bash
# Canonical frontend CI checks: bootstrap, analyze, format check, tests.
# Used identically by GitHub Actions and Azure DevOps so both platforms stay in sync.
set -euo pipefail

cd "$(dirname "$0")/../../rust-flutter/app"

echo "==> dart pub get (resolve workspace)"
dart pub get

echo "==> melos bootstrap"
melos bootstrap

echo "==> melos run analyze"
melos run analyze

echo "==> melos run format-check"
melos run format-check

echo "==> melos run test"
melos run test
