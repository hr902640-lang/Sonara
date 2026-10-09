import test from "node:test";
import assert from "node:assert/strict";
import { normalizedTitle } from "../../lib/song-matching";
test("song titles normalize conservatively", () => assert.equal(normalizedTitle({ title: "Fear Song (Official Video)" }), "fear song"));
