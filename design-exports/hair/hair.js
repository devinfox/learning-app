/* Soft blonde bob — original detailed silhouette, light polish only.
   Preserves asymmetrical left swoop, layered bangs, lively flipped sides.
   Polish: ~20% less deep brown, fewer tiny highlights, amber section edges
   (not white separators), face hole ~3–4% wider, slightly softer tip points.

   Export scales design-space → 1100×1400 or Lottie 100×100.
*/

(function (root) {
  /* Design space (pre-adjust) — original fit proportions */
  const F = {
    cx: 50,
    /* face opening ~3–4% wider than original 36.5–63.5 */
    faceL: 35.2,
    faceR: 64.8,
    browY: 41.2,
    outL: 17,
    outR: 83,
    crownY: 17,
    partX: 64,
    tipY: 81,
    earY: 52,
  };

  const ADJUST = {
    raise: 4.2,
    widen: 1.14,
  };

  /* Warm amber edges for section definition — not pale white or heavy brown */
  const C = {
    outline: '#C48928',
    outlineSoft: '#D4A038',
    outlineDeep: '#A86A18',
    line: '#D4A040',
    bg: '#0E0802',
    glowHot: '#FFC93A',
    glowMid: '#B9700F',
  };

  const f = (n) => Math.round(n * 1000) / 1000;

  function adjX(x) {
    return 50 + (x - 50) * ADJUST.widen;
  }
  function adjY(y) {
    return y - ADJUST.raise;
  }

  function scaleOpts(format) {
    if (format === 'lottie') {
      return { s: 1, ox: 0, oy: 0, w: 100, h: 100, stroke: 0.65, strokeSoft: 0.5, lineW: 0.35 };
    }
    const s = 11;
    return {
      s,
      ox: 550 - 50 * s,
      oy: 420 - 54 * s,
      w: 1100,
      h: 1400,
      stroke: 9,
      strokeSoft: 7,
      lineW: 4,
    };
  }

  function X(x, t) { return f(t.ox + adjX(x) * t.s); }
  function Y(y, t) { return f(t.oy + adjY(y) * t.s); }
  function S(n, t) { return f(n * t.s * ADJUST.widen); }

  function cubic(p0, c1, c2, p3, t) {
    const m = 1 - t;
    const a = m * m * m, b = 3 * m * m * t, c = 3 * m * t * t, d = t * t * t;
    return [
      a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0],
      a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1],
    ];
  }

  function cubicD(p0, c1, c2, p3, t) {
    const m = 1 - t;
    const a = 3 * m * m, b = 6 * m * t, c = 3 * t * t;
    return [
      a * (c1[0] - p0[0]) + b * (c2[0] - c1[0]) + c * (p3[0] - c2[0]),
      a * (c1[1] - p0[1]) + b * (c2[1] - c1[1]) + c * (p3[1] - c2[1]),
    ];
  }

  function toSegs(pts) {
    const segs = [];
    for (let i = 0; i + 8 <= pts.length; i += 6) {
      segs.push([
        [pts[i], pts[i + 1]], [pts[i + 2], pts[i + 3]],
        [pts[i + 4], pts[i + 5]], [pts[i + 6], pts[i + 7]],
      ]);
    }
    return segs;
  }

  function sampleChain(pts, per) {
    const segs = toSegs(pts);
    const out = [];
    segs.forEach((s, si) => {
      for (let k = si === 0 ? 0 : 1; k <= per; k++) {
        const t = k / per;
        const p = cubic(s[0], s[1], s[2], s[3], t);
        let d = cubicD(s[0], s[1], s[2], s[3], t);
        let len = Math.hypot(d[0], d[1]);
        if (len < 1e-6) {
          d = cubicD(s[0], s[1], s[2], s[3], Math.min(0.999, t + 0.01));
          len = Math.hypot(d[0], d[1]) || 1;
        }
        out.push({ p, n: [-d[1] / len, d[0] / len] });
      }
    });
    return out;
  }

  function widthAt(ws, u) {
    if (ws.length === 1) return ws[0];
    const x = u * (ws.length - 1);
    const i = Math.min(ws.length - 2, Math.floor(x));
    return ws[i] + (ws[i + 1] - ws[i]) * (x - i);
  }

  function dedupe(P) {
    const out = [];
    for (const p of P) {
      const q = out[out.length - 1];
      if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.02) out.push(p);
    }
    while (out.length > 2) {
      const a = out[0], b = out[out.length - 1];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.02) out.pop();
      else break;
    }
    return out;
  }

  function smoothClosed(P, tension) {
    const pts = dedupe(P);
    const n = pts.length;
    const k = (tension == null ? 1 : tension) / 6;
    let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i];
      const p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
      const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
      d += ` C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + ' Z';
  }

  function smoothOpen(P, tension) {
    const pts = dedupe(P);
    const n = pts.length;
    const k = (tension == null ? 1 : tension) / 6;
    let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i];
      const p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
      const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
      d += ` C ${f(c1[0])} ${f(c1[1])}, ${f(c2[0])} ${f(c2[1])}, ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  }

  function lock(spine, ws, per) {
    const S = sampleChain(spine, per || 16);
    const N = S.length;
    const L = [], R = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      const w = widthAt(ws, u);
      L.push([S[i].p[0] + S[i].n[0] * w, S[i].p[1] + S[i].n[1] * w]);
      R.push([S[i].p[0] - S[i].n[0] * w, S[i].p[1] - S[i].n[1] * w]);
    }
    return smoothClosed(L.concat(R.reverse()), 1);
  }

  function line(spine, per) {
    return smoothOpen(sampleChain(spine, per || 12).map((s) => s.p), 1);
  }

  function mapSpine(spine, t) {
    const out = [];
    for (let i = 0; i < spine.length; i += 2) {
      out.push(X(spine[i], t), Y(spine[i + 1], t));
    }
    return out;
  }

  function mapWs(ws, t) {
    return ws.map((w) => S(w, t));
  }

  /* ---------------------------------------------------------------- original silhouette + layers */

  function silhouette(t) {
    const p = (x, y) => `${X(x, t)} ${Y(y, t)}`;
    return [
      `M ${p(F.outL + 2, F.tipY - 2)}`,
      `C ${p(F.outL - 1, 70)}, ${p(F.outL - 2, 58)}, ${p(F.outL + 1, F.earY)}`,
      `C ${p(F.outL + 3, 42)}, ${p(24, 30)}, ${p(34, 23)}`,
      `C ${p(42, 17)}, ${p(50, F.crownY)}, ${p(58, 18)}`,
      `C ${p(68, 19)}, ${p(76, 24)}, ${p(F.outR - 3, 32)}`,
      `C ${p(F.outR + 1, 42)}, ${p(F.outR + 2, 54)}, ${p(F.outR, 68)}`,
      `C ${p(F.outR - 1, 76)}, ${p(F.outR - 4, F.tipY - 1)}, ${p(F.outR - 8, F.tipY + 0.5)}`,
      /* right tip slightly softened (was more pointed) */
      `C ${p(F.outR - 5, F.tipY - 3)}, ${p(F.outR - 4, 72)}, ${p(F.outR - 6, 66)}`,
      `C ${p(76, 74)}, ${p(70, 78)}, ${p(F.faceR + 2, F.tipY - 2)}`,
      `C ${p(F.faceR + 1, 70)}, ${p(F.faceR + 1.5, 58)}, ${p(F.faceR, 50)}`,
      `C ${p(F.faceR - 0.5, 46)}, ${p(F.faceR - 2, F.browY + 2)}, ${p(F.faceR - 4, F.browY)}`,
      `C ${p(58, F.browY - 1.5)}, ${p(50, F.browY - 2)}, ${p(42, F.browY - 1.5)}`,
      `C ${p(F.faceL + 4, F.browY)}, ${p(F.faceL + 2, F.browY + 2)}, ${p(F.faceL, 50)}`,
      `C ${p(F.faceL - 1, 58)}, ${p(F.faceL - 1, 70)}, ${p(F.faceL - 2, F.tipY - 2)}`,
      `C ${p(30, 78)}, ${p(24, 74)}, ${p(F.outL + 6, 66)}`,
      `C ${p(F.outL + 4, 72)}, ${p(F.outL + 3, F.tipY - 3)}, ${p(F.outL + 2, F.tipY - 2)}`,
      'Z',
    ].join(' ');
  }

  function crownFill(t) {
    const p = (x, y) => `${X(x, t)} ${Y(y, t)}`;
    return [
      `M ${p(34, 26)}`,
      `C ${p(42, 18)}, ${p(50, 16)}, ${p(58, 17)}`,
      `C ${p(68, 18)}, ${p(76, 24)}, ${p(F.outR - 4, 32)}`,
      `C ${p(74, 28)}, ${p(66, 25)}, ${p(58, 24)}`,
      `C ${p(50, 23)}, ${p(42, 25)}, ${p(36, 30)}`,
      `C ${p(34, 28)}, ${p(34, 26)}, ${p(34, 26)}`,
      'Z',
    ].join(' ');
  }

  /* Crown leaves — original layered petals (asymmetrical fan from side part) */
  function crownLeaves(t) {
    const leaf = (coords, fill, stroke) => ({
      d: coords.map((c, i) => {
        if (i === 0) return `M ${X(c[0], t)} ${Y(c[1], t)}`;
        if (c.length === 6) {
          return `C ${X(c[0], t)} ${Y(c[1], t)}, ${X(c[2], t)} ${Y(c[3], t)}, ${X(c[4], t)} ${Y(c[5], t)}`;
        }
        return '';
      }).join(' ') + ' Z',
      fill,
      stroke,
    });

    return [
      leaf([
        [F.partX, 22],
        [56, 18, 46, 20, 38, 26],
        [32, 31, 29, 37, 28, 43],
        [36, 41, 44, 37, 52, 34],
        [58, 32, 62, 28, F.partX, 24],
        [F.partX + 0.5, 23, F.partX + 0.5, 22, F.partX, 22],
      ], 'hairLift', t.stroke * 0.75),
      leaf([
        [54, 25],
        [46, 23, 38, 26, 32, 33],
        [27, 39, 25, 46, 25, 52],
        [31, 48, 38, 44, 46, 40],
        [51, 37, 54, 32, 55, 28],
        [55.5, 26, 54.5, 25, 54, 25],
      ], 'hairGold', t.stroke * 0.7),
      leaf([
        [40, 29],
        [33, 29, 27, 34, 23, 41],
        [20, 47, 19, 54, 20, 60],
        [25, 56, 31, 51, 37, 47],
        [42, 43, 45, 38, 46, 33],
        [46, 30, 43, 29, 40, 29],
      ], 'hairDeep', t.stroke * 0.65),
      leaf([
        [F.partX + 0.5, 23],
        [70, 24, 76, 29, 80, 36],
        [84, 43, 86, 50, 86.5, 57],
        [82, 53, 77, 48, 72, 43],
        [68, 39, 65, 32, F.partX + 1, 27],
        [F.partX, 25, F.partX, 23, F.partX + 0.5, 23],
      ], 'hairGold', t.stroke * 0.7),
      leaf([
        [74, 30],
        [80, 32, 85, 38, 88, 46],
        [90.5, 53, 91, 60, 90.5, 66],
        [86, 61, 82, 55, 77, 50],
        [74, 46, 72, 40, 71.5, 35],
        [71, 32, 72.5, 30, 74, 30],
      ], 'hairDeep', t.stroke * 0.65),
    ];
  }

  /* Layered bang scallops — keep multiple pieces, not 3 geometric panels */
  function bangScallops(t) {
    const sc = (pts, fill) => {
      const d = pts.map((c, i) => {
        if (i === 0) return `M ${X(c[0], t)} ${Y(c[1], t)}`;
        return `C ${X(c[0], t)} ${Y(c[1], t)}, ${X(c[2], t)} ${Y(c[3], t)}, ${X(c[4], t)} ${Y(c[5], t)}`;
      }).join(' ') + ' Z';
      return { d, fill };
    };
    return [
      sc([
        [38, 36],
        [41, 41, 44, 44, 47, 44.5],
        [50, 44, 52, 41, 54, 36],
        [50, 35.5, 44, 35.5, 38, 36],
      ], 'hairGold'),
      sc([
        [48, 34.5],
        [51, 40, 55, 43.5, 59, 44],
        [63, 43.5, 66, 40, 68, 35],
        [63, 34, 55, 33.5, 48, 34.5],
      ], 'hairLift'),
      sc([
        [58, 34],
        [62, 39.5, 66, 42.5, 70, 43],
        [73.5, 42, 76, 38.5, 77, 35],
        [73, 33.5, 65, 33, 58, 34],
      ], 'hairGold'),
      sc([
        [34, 37.5],
        [36, 41.5, 39, 43.5, 42, 44],
        [45, 43, 47, 40, 48, 37],
        [43, 36.5, 38, 36.5, 34, 37.5],
      ], 'hairDeep'),
      /* extra small left-swoop piece for asymmetry */
      sc([
        [30, 34],
        [28, 38, 27, 43, 28, 47],
        [32, 46, 36, 43, 38, 39],
        [36, 35, 33, 33.5, 30, 34],
      ], 'hairLift'),
    ];
  }

  /* Left fall — layered, lively flip (slightly rounded tip) */
  function leftPanels(t) {
    const poly = (coords, fill, stroke) => ({
      d: coords.map((c, i) => {
        if (i === 0) return `M ${X(c[0], t)} ${Y(c[1], t)}`;
        return `C ${X(c[0], t)} ${Y(c[1], t)}, ${X(c[2], t)} ${Y(c[3], t)}, ${X(c[4], t)} ${Y(c[5], t)}`;
      }).join(' ') + ' Z',
      fill,
      stroke,
    });
    return [
      poly([
        [20, 38],
        [15, 50, 14, 62, 16, 72],
        [18, 78, 22.5, 81.5, 28.5, 81],
        [26, 74, 24, 66, 24, 58],
        [24, 50, 26, 43, 30, 38],
        [26, 36, 22, 36, 20, 38],
      ], 'hairDeep', t.stroke * 0.85),
      poly([
        [26, 36],
        [21, 48, 20, 60, 21.5, 72],
        [23, 78, 28.5, 81, 34.5, 80],
        [32, 74, 31, 66, 31.5, 58],
        [32, 50, 34, 43, 38, 38],
        [34, 36, 29, 35, 26, 36],
      ], 'hairGold', t.stroke * 0.8),
      poly([
        [32, 35],
        [28, 47, 27, 59, 28.5, 71],
        [30, 77, 34.5, 80, 40, 78.5],
        [38.5, 73, 38, 65, 38.5, 57],
        [39, 49, 41, 42, 44, 38],
        [40, 35.5, 35.5, 34.5, 32, 35],
      ], 'hairLift', t.stroke * 0.75),
    ];
  }

  /* Right fall — still different from left; tip less stabby */
  function rightPanels(t) {
    const poly = (coords, fill, stroke) => ({
      d: coords.map((c, i) => {
        if (i === 0) return `M ${X(c[0], t)} ${Y(c[1], t)}`;
        return `C ${X(c[0], t)} ${Y(c[1], t)}, ${X(c[2], t)} ${Y(c[3], t)}, ${X(c[4], t)} ${Y(c[5], t)}`;
      }).join(' ') + ' Z',
      fill,
      stroke,
    });
    return [
      poly([
        [80, 38],
        [85, 50, 86, 62, 84, 72],
        [82, 78, 77.5, 81, 72, 80.5],
        [74, 74, 76, 66, 76, 58],
        [76, 50, 74, 43, 70, 38],
        [74, 36, 78, 36, 80, 38],
      ], 'hairDeep', t.stroke * 0.85),
      poly([
        [74, 36],
        [79, 48, 80, 60, 78.5, 72],
        [77, 78, 72, 80.5, 66.5, 79.5],
        [68, 74, 69, 66, 68.5, 58],
        [68, 50, 66, 43, 62, 38],
        [66, 36, 71, 35, 74, 36],
      ], 'hairGold', t.stroke * 0.8),
      poly([
        [68, 35],
        [72, 47, 73, 59, 71.5, 71],
        [70, 76.5, 66, 79.5, 61, 78.5],
        [61.5, 73, 62, 65, 61.5, 57],
        [61, 49, 59, 42, 56, 38],
        [60, 35.5, 64.5, 34.5, 68, 35],
      ], 'hairLift', t.stroke * 0.75),
    ];
  }

  function sideCaps(t) {
    const poly = (coords, fill) => ({
      d: coords.map((c, i) => {
        if (i === 0) return `M ${X(c[0], t)} ${Y(c[1], t)}`;
        return `C ${X(c[0], t)} ${Y(c[1], t)}, ${X(c[2], t)} ${Y(c[3], t)}, ${X(c[4], t)} ${Y(c[5], t)}`;
      }).join(' ') + ' Z',
      fill,
      stroke: t.stroke * 0.65,
    });
    return [
      poly([
        [22, 34],
        [17, 42, 15, 52, 16, 60],
        [20, 56, 25, 51, 30, 47],
        [29, 41, 27, 36, 22, 34],
      ], 'hairDeep'),
      poly([
        [78, 34],
        [83, 42, 85, 52, 84, 60],
        [80, 56, 75, 51, 70, 47],
        [71, 41, 73, 36, 78, 34],
      ], 'hairDeep'),
    ];
  }

  /* ~20% less deep underlayer mass: slightly lower opacity in export, fewer deep pieces */
  function deepOverlaps(t) {
    /* keep depth under bangs and side roots — not a full second hairstyle */
    return [
      {
        d: (() => {
          const p = (x, y) => `${X(x, t)} ${Y(y, t)}`;
          return `M ${p(28, 34)} C ${p(24, 42)}, ${p(22, 52)}, ${p(23, 58)} C ${p(28, 55)}, ${p(33, 50)}, ${p(36, 44)} C ${p(34, 38)}, ${p(31, 34)}, ${p(28, 34)} Z`;
        })(),
        opacity: 0.38,
      },
      {
        d: (() => {
          const p = (x, y) => `${X(x, t)} ${Y(y, t)}`;
          return `M ${p(72, 33)} C ${p(76, 40)}, ${p(79, 50)}, ${p(80, 58)} C ${p(75, 54)}, ${p(70, 49)}, ${p(67, 43)} C ${p(68, 37)}, ${p(70, 33)}, ${p(72, 33)} Z`;
        })(),
        opacity: 0.36,
      },
      {
        d: (() => {
          const p = (x, y) => `${X(x, t)} ${Y(y, t)}`;
          return `M ${p(18, 70)} C ${p(17, 76)}, ${p(20, 80)}, ${p(26, 81)} C ${p(24, 76)}, ${p(22, 72)}, ${p(21, 68)} C ${p(19.5, 68.5)}, ${p(18.5, 69)}, ${p(18, 70)} Z`;
        })(),
        opacity: 0.32,
      },
      {
        d: (() => {
          const p = (x, y) => `${X(x, t)} ${Y(y, t)}`;
          return `M ${p(82, 70)} C ${p(83, 76)}, ${p(80, 80)}, ${p(74, 81)} C ${p(76, 76)}, ${p(78, 72)}, ${p(79, 68)} C ${p(80.5, 68.5)}, ${p(81.5, 69)}, ${p(82, 70)} Z`;
        })(),
        opacity: 0.3,
      },
    ];
  }

  function flowLines(t) {
    /* keep major flow only — dropped ~1/3 of the smaller lines */
    const spines = [
      [F.partX, 24, 54, 23, 44, 27, 36, 34],
      [F.partX, 26, 56, 28, 48, 33, 42, 40],
      [F.partX + 0.5, 24, 72, 27, 78, 34, 82, 42],
      [F.partX + 0.5, 27, 74, 33, 80, 40, 84, 50],
      [24, 48, 21, 58, 22, 68, 26, 76],
      [31, 47, 28, 58, 29, 68, 33, 76],
      [76, 48, 79, 58, 78, 68, 74, 76],
      [69, 47, 72, 58, 71, 68, 67, 76],
    ];
    return spines.map((s) => line(mapSpine(s, t), 12));
  }

  /* Major curved highlights only — removed ~1/3 of the smallest streaks */
  function highlights(t) {
    const items = [
      [[48, 24, 42, 27, 37, 33, 34, 39], [0.45, 1.3, 1.15, 0.28]],
      [[56, 25, 51, 29, 47, 35, 45, 40], [0.38, 1.05, 0.95, 0.22]],
      [[70, 28, 74, 34, 78, 40, 80, 46], [0.42, 1.2, 1.05, 0.26]],
      [[24, 52, 22, 60, 23, 68, 26, 75], [0.75, 1.7, 1.5, 0.32]],
      [[76, 52, 78, 60, 77, 68, 74, 75], [0.75, 1.7, 1.5, 0.32]],
      [[31, 50, 29, 59, 30, 68, 33, 74], [0.55, 1.2, 1.05, 0.24]],
    ];
    return items.map(([spine, ws]) =>
      lock(mapSpine(spine, t), mapWs(ws, t), 14)
    );
  }

  function bounceLight(t) {
    const p = (x, y) => `${X(x, t)} ${Y(y, t)}`;
    return {
      left: `M ${p(18, 62)} C ${p(17, 70)}, ${p(20, 76)}, ${p(26, 77)} C ${p(24, 72)}, ${p(22, 67)}, ${p(21, 62)} C ${p(20, 61.5)}, ${p(18.5, 61.5)}, ${p(18, 62)} Z`,
      right: `M ${p(82, 62)} C ${p(83, 70)}, ${p(80, 76)}, ${p(74, 77)} C ${p(76, 72)}, ${p(78, 67)}, ${p(79, 62)} C ${p(80, 61.5)}, ${p(81.5, 61.5)}, ${p(82, 62)} Z`,
    };
  }

  /* ------------------------------------------------------------------ build */

  function buildHairSVG(opts) {
    const o = opts || {};
    const format = o.format || 'export';
    const showGlow = o.glow !== false && format !== 'lottie';
    const t = scaleOpts(format);

    const leaves = crownLeaves(t);
    const scallops = bangScallops(t);
    const left = leftPanels(t);
    const right = rightPanels(t);
    const caps = sideCaps(t);
    const deep = deepOverlaps(t);
    const lines = flowLines(t);
    const sheens = highlights(t);
    const bounce = bounceLight(t);

    const defs = `
  <defs>
    <linearGradient id="hairGold" x1="0.22" y1="0.05" x2="0.78" y2="0.95">
      <stop offset="0" stop-color="#FFE9A8"/>
      <stop offset="0.28" stop-color="#FFD56A"/>
      <stop offset="0.62" stop-color="#F0B02E"/>
      <stop offset="1" stop-color="#D99420"/>
    </linearGradient>
    <linearGradient id="hairDeep" x1="0.28" y1="0" x2="0.75" y2="1">
      <stop offset="0" stop-color="#E8B040"/>
      <stop offset="0.45" stop-color="#D09020"/>
      <stop offset="1" stop-color="#A86A18"/>
    </linearGradient>
    <linearGradient id="hairLift" x1="0.18" y1="0" x2="0.82" y2="1">
      <stop offset="0" stop-color="#FFF6D0"/>
      <stop offset="0.4" stop-color="#FFE08A"/>
      <stop offset="1" stop-color="#F5B838"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#FFFEF5" stop-opacity="0.88"/>
      <stop offset="0.55" stop-color="#FFF0B8" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#FFE090" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="bounce" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="#B8C8FF" stop-opacity="0"/>
      <stop offset="0.55" stop-color="#B8C8FF" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#B8C8FF" stop-opacity="0.28"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="0.5" cy="0.42" r="0.55">
      <stop offset="0" stop-color="${C.glowHot}" stop-opacity="0.92"/>
      <stop offset="0.42" stop-color="${C.glowMid}" stop-opacity="0.5"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

    const glow = showGlow
      ? `
  <g id="Backdrop">
    <rect x="0" y="0" width="${t.w}" height="${t.h}" fill="${C.bg}"/>
    <ellipse cx="${t.w / 2}" cy="${t.h * 0.38}" rx="${t.w * 0.42}" ry="${t.h * 0.36}" fill="url(#bgGlow)"/>
  </g>`
      : '';

    /* Amber-gold section edges — no white separators */
    const path = (d, fill, strokeW) =>
      `    <path d="${d}" fill="url(#${fill})" stroke="${strokeW >= t.stroke * 0.85 ? C.outline : C.outlineSoft}" stroke-width="${f(strokeW)}" stroke-linejoin="round" stroke-linecap="round"/>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t.w} ${t.h}" width="${t.w}" height="${t.h}">
  <title>Lottie soft bob</title>${defs}${glow}
  <g id="Back Cap">
${path(silhouette(t), 'hairGold', t.stroke)}
${path(crownFill(t), 'hairGold', t.strokeSoft)}
  </g>
  <g id="Left Lock">
${left.map((p) => path(p.d, p.fill, p.stroke)).join('\n')}
  </g>
  <g id="Right Lock">
${right.map((p) => path(p.d, p.fill, p.stroke)).join('\n')}
  </g>
  <g id="Side Caps">
${caps.map((p) => path(p.d, p.fill, p.stroke)).join('\n')}
  </g>
  <g id="Shadows" fill="url(#hairDeep)">
${deep.map((s) => `    <path d="${s.d}" opacity="${s.opacity}"/>`).join('\n')}
  </g>
  <g id="Bounce Light" fill="url(#bounce)" opacity="0.8">
    <path d="${bounce.left}"/>
    <path d="${bounce.right}"/>
  </g>
  <g id="Front Bangs">
${scallops.map((p) => path(p.d, p.fill, t.strokeSoft * 0.9)).join('\n')}
  </g>
  <g id="Crown Leaves">
${leaves.map((p) => path(p.d, p.fill, p.stroke)).join('\n')}
  </g>
  <g id="Flow Lines" fill="none" stroke="${C.line}" stroke-width="${f(t.lineW)}" stroke-linecap="round" opacity="0.32">
${lines.map((d) => `    <path d="${d}"/>`).join('\n')}
  </g>
  <g id="Highlights" fill="url(#sheen)" opacity="0.8">
${sheens.map((d) => `    <path d="${d}"/>`).join('\n')}
  </g>
</svg>`;
  }

  function buildHairLayers() {
    const t = scaleOpts('lottie');
    return {
      fit: { ...F, raise: ADJUST.raise, widen: ADJUST.widen },
      silhouette: silhouette(t),
      crownFill: crownFill(t),
      leftPanels: leftPanels(t),
      rightPanels: rightPanels(t),
      sideCaps: sideCaps(t),
      bangScallops: bangScallops(t),
      crownLeaves: crownLeaves(t),
      deepOverlaps: deepOverlaps(t),
      bounceLight: bounceLight(t),
      flowLines: flowLines(t),
      highlights: highlights(t),
    };
  }

  root.buildHairSVG = buildHairSVG;
  root.buildHairLayers = buildHairLayers;
  root.LOTTIE_HAIR_FIT = F;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildHairSVG, buildHairLayers, LOTTIE_HAIR_FIT: F };
  }
})(typeof window !== 'undefined' ? window : globalThis);
