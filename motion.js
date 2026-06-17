(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory();
  else root.PookieMotion = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function clamp(v, min, max) {
    return v < min ? min : (v > max ? max : v);
  }

  // The docking strip: `count` evenly spaced slots that fill left->right in
  // click order and WRAP to additional centered rows once a single row would
  // overflow stageW. Each row is independently centered; the last row may hold
  // fewer slots. `scale` shrinks blobs only if even the wrapped rows overflow.
  //
  // Returns:
  //   scale     shared render scale for docked blobs (<= maxScale)
  //   scaledW   blobW * scale
  //   rows      number of rows used
  //   rowStride vertical distance between row tops (px)
  //   slots     [{ cx, cy, row }] indexed by dock order; cy is relative to the
  //             strip top (caller adds its own ROW_TOP offset)
  //   height    total vertical space the strip occupies (px)
  function computeDockLayout(stageW, count, blobW, opts) {
    opts = opts || {};
    var margin = opts.margin != null ? opts.margin : 20;
    var gapFactor = opts.gapFactor != null ? opts.gapFactor : 1.15;
    var rowGapFactor = opts.rowGapFactor != null ? opts.rowGapFactor : 1.12;
    var maxScale = opts.maxScale != null ? opts.maxScale : 1;
    var stride = blobW * gapFactor;
    var avail = stageW - 2 * margin;
    if (avail < stride) avail = stride;             // degenerate tiny stage
    var perRow = Math.max(1, Math.floor(avail / stride));
    if (perRow >= count) perRow = count;            // everything fits one row
    var rows = Math.ceil(count / perRow);
    perRow = Math.ceil(count / rows);               // rebalance for even rows
    var scale = Math.min(maxScale, avail / (stride * perRow));
    var actualStride = stride * scale;
    var scaledW = blobW * scale;
    var rowStride = blobW * rowGapFactor * scale;
    var slots = [];
    for (var i = 0; i < count; i++) {
      var r = Math.floor(i / perRow);
      var c = i - r * perRow;
      var itemsInRow = Math.min(perRow, count - r * perRow);
      var rowWidth = actualStride * itemsInRow;
      var startX = (stageW - rowWidth) / 2;
      slots.push({ cx: startX + actualStride * (c + 0.5), cy: r * rowStride, row: r });
    }
    return { scale: scale, scaledW: scaledW, rows: rows, rowStride: rowStride, slots: slots, height: rows * rowStride };
  }

  // A deterministic scattered layout of `count` blobs across the loose play
  // area [margin .. stageW-blobW-margin] x [top .. stageH-blobH-margin]. Lays
  // out a jittered grid (one blob per cell) so blobs spread out without
  // overlapping, and never depends on hand-tuned per-blob coordinates. Used for
  // the reduced-motion static layout. Deterministic in (count, dims) so it is
  // reproducible and testable.
  function scatterLayout(stageW, stageH, count, blobW, blobH, opts) {
    opts = opts || {};
    var margin = opts.margin != null ? opts.margin : 24;
    var top = opts.top != null ? opts.top : 0;
    var x0 = margin, x1 = stageW - blobW - margin;
    var y0 = top, y1 = stageH - blobH - margin;
    if (x1 < x0) x1 = x0;
    if (y1 < y0) y1 = y0;
    var areaW = x1 - x0 || 1;
    var areaH = y1 - y0 || 1;
    var cols = Math.max(1, Math.round(Math.sqrt(count * areaW / areaH)));
    if (cols > count) cols = count;
    var rows = Math.ceil(count / cols);
    var out = [];
    for (var i = 0; i < count; i++) {
      var c = i % cols;
      var r = Math.floor(i / cols);
      var seed = i * 1.7 + 0.5;
      var jx = Math.sin(seed * 12.9) * 0.5 + 0.5;   // 0..1, deterministic
      var jy = Math.cos(seed * 7.3) * 0.5 + 0.5;
      var fx = (c + 0.15 + 0.7 * jx) / cols;        // padded within the cell
      var fy = (r + 0.15 + 0.7 * jy) / rows;
      out.push({ x: x0 + fx * areaW, y: y0 + fy * areaH });
    }
    return out;
  }

  // Smooth organic drift from summed low-frequency sines. Deterministic in
  // (t, seed) so motion is reproducible and unit-testable.
  function wanderVelocity(t, seed, opts) {
    opts = opts || {};
    var amp = opts.amp != null ? opts.amp : 16;
    var f1 = opts.f1 != null ? opts.f1 : 0.13;
    var f2 = opts.f2 != null ? opts.f2 : 0.07;
    var vx = amp * (Math.sin(t * f1 + seed) + 0.5 * Math.sin(t * f2 * 1.7 + seed * 1.3)) / 1.5;
    var vy = amp * (Math.cos(t * f2 + seed * 0.7) + 0.5 * Math.sin(t * f1 * 1.3 + seed)) / 1.5;
    return { vx: vx, vy: vy };
  }

  // Clamp pos into [min,max]; if it hit a wall, send vel back inward, damped.
  function softReflect(pos, vel, min, max, damping) {
    damping = damping != null ? damping : 0.6;
    if (pos < min) return { pos: min, vel: Math.abs(vel) * damping };
    if (pos > max) return { pos: max, vel: -Math.abs(vel) * damping };
    return { pos: pos, vel: vel };
  }

  return {
    clamp: clamp,
    computeDockLayout: computeDockLayout,
    scatterLayout: scatterLayout,
    wanderVelocity: wanderVelocity,
    softReflect: softReflect
  };
});
