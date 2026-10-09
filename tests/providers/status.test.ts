import test from "node:test";
import assert from "node:assert/strict";
import { providers } from "../../lib/providers";
test("providers declare capabilities", () => assert.ok(providers.every(provider => provider.capabilities.length > 0)));
