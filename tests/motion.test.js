"use strict";
const test = require("node:test");
const assert = require("node:assert");
const M = require("../motion.js");

test("clamp bounds a value", () => {
  assert.equal(M.clamp(5, 0, 10), 5);
  assert.equal(M.clamp(-3, 0, 10), 0);
  assert.equal(M.clamp(99, 0, 10), 10);
});

test("computeDockLayout: a row that fits stays one row at full scale", () => {
  const r = M.computeDockLayout(2000, 10, 88);
  assert.equal(r.rows, 1);
  assert.equal(r.scale, 1);
  assert.equal(r.scaledW, 88);
  assert.equal(r.slots.length, 10);
});

test("computeDockLayout: single row is centered and ascends left to right", () => {
  const r = M.computeDockLayout(2000, 10, 88);
  for (let i = 1; i < r.slots.length; i++) {
    assert.ok(r.slots[i].cx > r.slots[i - 1].cx, "slots ascend within the row");
    assert.equal(r.slots[i].row, 0);
  }
  const mid = (r.slots[0].cx + r.slots[9].cx) / 2;
  assert.ok(Math.abs(mid - 1000) < 0.001, "row midpoint is stage center");
});

test("computeDockLayout: many blobs wrap to multiple balanced rows", () => {
  const r = M.computeDockLayout(1200, 20, 88);
  assert.ok(r.rows >= 2, "20 blobs wrap past a single row");
  assert.equal(r.slots.length, 20);
  // slot indices fill row 0 left->right, then row 1, ... (click order)
  const rowOf = r.slots.map((s) => s.row);
  for (let i = 1; i < rowOf.length; i++) {
    assert.ok(rowOf[i] >= rowOf[i - 1], "rows fill in order");
  }
  // later rows sit lower on the stage
  assert.ok(r.slots[r.slots.length - 1].cy > r.slots[0].cy, "wrapped rows step down");
  assert.ok(r.height > 0);
});

test("computeDockLayout: every slot stays within the stage width", () => {
  const r = M.computeDockLayout(360, 20, 70);
  for (const s of r.slots) {
    assert.ok(s.cx - r.scaledW / 2 >= -0.001, "slot left edge within stage");
    assert.ok(s.cx + r.scaledW / 2 <= 360 + 0.001, "slot right edge within stage");
  }
  assert.ok(r.scale <= 1);
});

test("scatterLayout: returns `count` points, all within the loose region", () => {
  const pts = M.scatterLayout(1000, 800, 18, 88, 88, { margin: 24, top: 140 });
  assert.equal(pts.length, 18);
  for (const p of pts) {
    assert.ok(p.x >= 24 - 0.001 && p.x <= 1000 - 88 - 24 + 0.001, "x within margins");
    assert.ok(p.y >= 140 - 0.001 && p.y <= 800 - 88 - 24 + 0.001, "y below the dock band");
  }
});

test("scatterLayout: is deterministic for the same inputs", () => {
  const a = M.scatterLayout(1000, 800, 18, 88, 88, { margin: 24, top: 140 });
  const b = M.scatterLayout(1000, 800, 18, 88, 88, { margin: 24, top: 140 });
  assert.deepEqual(a, b);
});

test("softReflect passes through inside bounds", () => {
  const r = M.softReflect(5, 3, 0, 10, 0.6);
  assert.deepEqual(r, { pos: 5, vel: 3 });
});

test("softReflect bounces off the low wall", () => {
  const r = M.softReflect(-4, -10, 0, 10, 0.5);
  assert.equal(r.pos, 0);
  assert.ok(r.vel > 0, "velocity points back inward");
  assert.equal(r.vel, 5);
});

test("softReflect bounces off the high wall", () => {
  const r = M.softReflect(14, 10, 0, 10, 0.5);
  assert.equal(r.pos, 10);
  assert.ok(r.vel < 0, "velocity points back inward");
});

test("wanderVelocity is deterministic and bounded", () => {
  const a = M.wanderVelocity(3.2, 1.7, { amp: 16 });
  const b = M.wanderVelocity(3.2, 1.7, { amp: 16 });
  assert.deepEqual(a, b);
  assert.ok(Math.abs(a.vx) <= 16 + 1e-9);
  assert.ok(Math.abs(a.vy) <= 16 + 1e-9);
});
