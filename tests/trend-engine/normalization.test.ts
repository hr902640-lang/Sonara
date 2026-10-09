import test from "node:test";
import assert from "node:assert/strict";
import { bounded, normalizeRank } from "../../lib/normalization";
test("normalization remains bounded", () => { assert.equal(bounded(150), 100); assert.equal(normalizeRank(1, 50), 100); });
