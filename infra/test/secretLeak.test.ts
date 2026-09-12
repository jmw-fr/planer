import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// Guard against committing plaintext secrets in stack config (contract C-CFG-3 / SC-006).
const infraDir = path.resolve(__dirname, "..");
const stackFiles = fs
  .readdirSync(infraDir)
  .filter((f) => /^Pulumi\..*\.yaml$/.test(f))
  .map((f) => path.join(infraDir, f));

// Keys that must never carry a plaintext value in committed config.
const FORBIDDEN_PLAINTEXT_KEYS = ["dbPassword", "adminPassword", "backendDbPassword", "keycloakDbPassword"];

describe("no plaintext secrets in committed stack config (SC-006)", () => {
  it("finds stack config files", () => {
    expect(stackFiles.length).toBeGreaterThan(0);
  });

  for (const file of stackFiles) {
    it(`${path.basename(file)} contains no plaintext secret keys`, () => {
      const content = fs.readFileSync(file, "utf8");
      for (const key of FORBIDDEN_PLAINTEXT_KEYS) {
        // A plaintext assignment looks like "key: value"; encrypted secrets use
        // a `secure:` sub-key and are acceptable. Fail only on bare assignments.
        const bareAssignment = new RegExp(`${key}\\s*:\\s*(?!\\s*$)(?!.*secure:)\\S`);
        expect(content).not.toMatch(bareAssignment);
      }
    });
  }
});
