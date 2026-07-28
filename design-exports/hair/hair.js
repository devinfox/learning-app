/* Soft blonde bob — cleaned for Lottie.
   Fewer underlayer shapes, 3 rounded bang masses, soft amber edges,
   4 highlight blades only. Fitted to LottieBuddy 100×100 head space.

   Lottie groups:
     Back Cap | Left Lock | Right Lock | Shadows | Front Bangs | Highlights
*/

(function (root) {
  const F = {
    cx: 50,
    /* wide face opening for eyes + brows */
    faceL: 32,
    faceR: 68,
    browY: 37,
    outL: 16,
    outR: 84,
    crownY: 14,
    tipY: 78,
    earY: 51,
  };

  const ADJUST = {
    raise: 5.2,
    widen: 1.12,
  };

  /* Soft amber-gold edges (not dark brown helmet outline) */
  const C = {
    edge: '#C48928',
    edgeSoft: '#D4A040',
    deep: '#A86A18',
    line: '#E0B050',
    bg: '#0E0802',
    glowHot: '#FFC93A',
    glowMid: '#B9700F',
    bounce: '#B8C8FF',
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
      return { s: 1, ox: 0, oy: 0, w: 100, h: 100, stroke: 0.55, strokeSoft: 0.4 };
    }
    const s = 11;
    return {
      s,
      ox: 550 - 50 * s,
      oy: 420 - 54 * s,
      w: 1100,
      h: 1400,
      stroke: 7,
      strokeSoft: 5,
    };
  }

  function X(x, t) { return f(t.ox + adjX(x) * t.s); }
  function Y(y, t) { return f(t.oy + adjY(y) * t.s); }

  function p(x, y, t) {
    return `${X(x, t)} ${Y(y, t)}`;
  }

  function pathD(cmds, t) {
    return cmds
      .map((c) => {
        if (c[0] === 'M') return `M ${p(c[1], c[2], t)}`;
        if (c[0] === 'C') {
          return `C ${p(c[1], c[2], t)}, ${p(c[3], c[4], t)}, ${p(c[5], c[6], t)}`;
        }
        if (c[0] === 'Z') return 'Z';
        return '';
      })
      .join(' ');
  }

  /* ---------------------------------------------------------------- geometry (design space) */

  /** Back cap — single soft dome + light mass; flattened top for antennae */
  function backCap(t) {
    /* Outer horseshoe silhouette — rounded tips, wider face hole */
    const silhouette = pathD([
      ['M', F.outL + 3, F.tipY - 3],
      /* left outer up — soft */
      ['C', F.outL, 68, F.outL - 1, 56, F.outL + 2, F.earY],
      ['C', F.outL + 4, 40, 26, 28, 36, 20],
      /* flattened crown — dips slightly at antenna roots (~42 & 58) */
      ['C', 42, 15.5, 46, F.crownY + 0.5, 50, F.crownY],
      ['C', 54, F.crownY + 0.5, 58, 15.5, 64, 20],
      ['C', 74, 28, F.outR - 4, 40, F.outR - 2, F.earY],
      ['C', F.outR + 1, 56, F.outR, 68, F.outR - 3, F.tipY - 3],
      /* right tip — rounded, not pointed */
      ['C', F.outR - 1, F.tipY + 1, F.outR - 6, F.tipY + 2.5, F.outR - 11, F.tipY],
      ['C', F.outR - 8, 72, F.outR - 7, 64, F.outR - 8, 58],
      /* inner right up */
      ['C', F.outR - 10, 70, 72, 76, F.faceR + 1, F.tipY - 4],
      ['C', F.faceR + 0.5, 68, F.faceR + 1, 54, F.faceR, 46],
      ['C', F.faceR - 0.5, 41, F.faceR - 2, F.browY + 1, F.faceR - 5, F.browY],
      /* wide brow / face opening */
      ['C', 58, F.browY - 1.2, 50, F.browY - 1.8, 42, F.browY - 1.2],
      ['C', F.faceL + 5, F.browY, F.faceL + 2, F.browY + 1, F.faceL, 46],
      ['C', F.faceL - 1, 54, F.faceL - 0.5, 68, F.faceL - 1, F.tipY - 4],
      /* left tip — rounded */
      ['C', 28, 76, F.outL + 10, 70, F.outL + 8, 58],
      ['C', F.outL + 7, 64, F.outL + 8, 72, F.outL + 11, F.tipY],
      ['C', F.outL + 6, F.tipY + 2.5, F.outL + 1, F.tipY + 1, F.outL + 3, F.tipY - 3],
      ['Z'],
    ], t);

    /* Soft crown mass (main gold fill under bangs) */
    const crown = pathD([
      ['M', 34, 22],
      ['C', 42, 15, 50, 13, 58, 14],
      ['C', 68, 15.5, 76, 22, 80, 30],
      ['C', 74, 26, 66, 23, 58, 22],
      ['C', 50, 21, 42, 22.5, 36, 27],
      ['C', 34, 25, 34, 22, 34, 22],
      ['Z'],
    ], t);

    return { silhouette, crown };
  }

  /** Left side lock — slightly shorter, rounded end */
  function leftLock(t) {
    return pathD([
      ['M', 22, 34],
      ['C', 16, 46, 15, 58, 17, 68],
      ['C', 18.5, 74, 22, 78, 28, 78.5],
      ['C', 33, 78.5, 37, 76, 39, 72],
      ['C', 36, 66, 34, 58, 34.5, 50],
      ['C', 35, 42, 37, 36, 40, 32],
      ['C', 34, 31, 27, 31, 22, 34],
      ['Z'],
    ], t);
  }

  /** Right side lock — less dramatic outward point, softer curve */
  function rightLock(t) {
    return pathD([
      ['M', 78, 34],
      ['C', 84, 46, 85, 58, 83, 68],
      ['C', 81.5, 74, 78, 77.5, 72.5, 78],
      ['C', 67.5, 78, 63.5, 75.5, 61.5, 71.5],
      ['C', 64.5, 65.5, 66.5, 57.5, 66, 49.5],
      ['C', 65.5, 41.5, 63.5, 35.5, 60.5, 32],
      ['C', 66, 31, 73, 31, 78, 34],
      ['Z'],
    ], t);
  }

  /** Minimal deep overlaps only — not a full second hairstyle (~40–50% less brown) */
  function shadows(t) {
    return [
      /* behind left bang root */
      {
        d: pathD([
          ['M', 28, 32],
          ['C', 24, 38, 22, 46, 23, 52],
          ['C', 26, 50, 30, 46, 33, 42],
          ['C', 32, 36, 30, 32.5, 28, 32],
          ['Z'],
        ], t),
        opacity: 0.28,
      },
      /* behind right bang / side join */
      {
        d: pathD([
          ['M', 70, 31],
          ['C', 74, 36, 77, 44, 78, 52],
          ['C', 74, 49, 70, 45, 67, 40],
          ['C', 68, 35, 69, 32, 70, 31],
          ['Z'],
        ], t),
        opacity: 0.26,
      },
      /* deep tuck under left tip */
      {
        d: pathD([
          ['M', 20, 66],
          ['C', 19, 72, 21, 76.5, 26, 77.5],
          ['C', 24, 72, 22.5, 68, 22, 64],
          ['C', 21, 64.5, 20.5, 65, 20, 66],
          ['Z'],
        ], t),
        opacity: 0.22,
      },
      /* deep tuck under right tip */
      {
        d: pathD([
          ['M', 80, 66],
          ['C', 81, 72, 79, 76.5, 74, 77.5],
          ['C', 76, 72, 77.5, 68, 78, 64],
          ['C', 79, 64.5, 79.5, 65, 80, 66],
          ['Z'],
        ], t),
        opacity: 0.22,
      },
    ];
  }

  /**
   * Front fringe — three clean rounded masses only:
   * 1) large viewer-left swooping bang
   * 2) soft central section (raised)
   * 3) smaller viewer-right section
   */
  function frontBangs(t) {
    const leftSwoop = pathD([
      ['M', 58, 20],
      ['C', 48, 17, 36, 20, 28, 28],
      ['C', 22, 34, 20, 42, 22, 48],
      ['C', 28, 46, 36, 42, 44, 38],
      ['C', 50, 34.5, 54, 29, 56, 24],
      ['C', 57, 22, 58, 20.5, 58, 20],
      ['Z'],
    ], t);

    const center = pathD([
      ['M', 44, 19],
      ['C', 48, 17.5, 52, 17.5, 56, 19],
      ['C', 58, 24, 58.5, 30, 57, 35],
      ['C', 54, 36.5, 50, 37, 46, 36],
      ['C', 43, 31, 42.5, 24.5, 44, 19],
      ['Z'],
    ], t);

    const right = pathD([
      ['M', 58, 20],
      ['C', 66, 19, 74, 23, 80, 30],
      ['C', 84, 36, 86, 43, 85, 49],
      ['C', 80, 46, 74, 42, 68, 38],
      ['C', 64, 34, 61, 28, 59, 23],
      ['C', 58.5, 21.5, 58, 20.5, 58, 20],
      ['Z'],
    ], t);

    return { leftSwoop, center, right };
  }

  /** Exactly four soft highlight blades */
  function highlights(t) {
    return {
      crown: pathD([
        ['M', 42, 18],
        ['C', 46, 16.5, 52, 16, 58, 17],
        ['C', 56, 20, 52, 22, 48, 22.5],
        ['C', 44.5, 21.5, 42.5, 19.5, 42, 18],
        ['Z'],
      ], t),
      mainBang: pathD([
        ['M', 36, 26],
        ['C', 32, 30, 29, 35, 28, 40],
        ['C', 32, 39, 37, 36.5, 41, 33.5],
        ['C', 40, 30, 38.5, 27.5, 36, 26],
        ['Z'],
      ], t),
      leftSide: pathD([
        ['M', 24, 48],
        ['C', 22.5, 54, 22.5, 60, 24, 66],
        ['C', 26.5, 64, 28, 58, 28.5, 52],
        ['C', 27.5, 49.5, 25.5, 48, 24, 48],
        ['Z'],
      ], t),
      rightSide: pathD([
        ['M', 76, 48],
        ['C', 77.5, 54, 77.5, 60, 76, 66],
        ['C', 73.5, 64, 72, 58, 71.5, 52],
        ['C', 72.5, 49.5, 74.5, 48, 76, 48],
        ['Z'],
      ], t),
    };
  }

  /** Faint lavender bounce light along lower edges */
  function bounceLight(t) {
    return {
      left: pathD([
        ['M', 18, 62],
        ['C', 17, 70, 20, 76, 26, 77],
        ['C', 24, 72, 22, 67, 21, 62],
        ['C', 20, 61.5, 18.5, 61.5, 18, 62],
        ['Z'],
      ], t),
      right: pathD([
        ['M', 82, 62],
        ['C', 83, 70, 80, 76, 74, 77],
        ['C', 76, 72, 78, 67, 79, 62],
        ['C', 80, 61.5, 81.5, 61.5, 82, 62],
        ['Z'],
      ], t),
    };
  }

  /* ------------------------------------------------------------------ build */

  function buildHairSVG(opts) {
    const o = opts || {};
    const format = o.format || 'export';
    const showGlow = o.glow !== false && format !== 'lottie';
    const t = scaleOpts(format);

    const cap = backCap(t);
    const left = leftLock(t);
    const right = rightLock(t);
    const shade = shadows(t);
    const bangs = frontBangs(t);
    const hi = highlights(t);
    const bounce = bounceLight(t);

    const sw = f(t.stroke);
    const sws = f(t.strokeSoft);

    const defs = `
  <defs>
    <linearGradient id="hairGold" x1="0.25" y1="0.05" x2="0.75" y2="0.95">
      <stop offset="0" stop-color="#FFF0C0"/>
      <stop offset="0.35" stop-color="#FFD56A"/>
      <stop offset="0.7" stop-color="#F0B02E"/>
      <stop offset="1" stop-color="#D99420"/>
    </linearGradient>
    <linearGradient id="hairLift" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#FFF8D8"/>
      <stop offset="0.45" stop-color="#FFE48A"/>
      <stop offset="1" stop-color="#F5C048"/>
    </linearGradient>
    <linearGradient id="hairAmber" x1="0.3" y1="0.1" x2="0.7" y2="1">
      <stop offset="0" stop-color="#F0C040"/>
      <stop offset="0.55" stop-color="#E0A028"/>
      <stop offset="1" stop-color="#C88818"/>
    </linearGradient>
    <linearGradient id="hairDeep" x1="0.35" y1="0.2" x2="0.7" y2="1">
      <stop offset="0" stop-color="#D49428"/>
      <stop offset="0.5" stop-color="#B87818"/>
      <stop offset="1" stop-color="#8A5810"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0.2" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#FFFEF8" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="#FFF2C0" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#FFE8A0" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="bounce" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0" stop-color="${C.bounce}" stop-opacity="0"/>
      <stop offset="0.55" stop-color="${C.bounce}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${C.bounce}" stop-opacity="0.35"/>
    </linearGradient>
    <radialGradient id="bgGlow" cx="0.5" cy="0.4" r="0.52">
      <stop offset="0" stop-color="${C.glowHot}" stop-opacity="0.9"/>
      <stop offset="0.45" stop-color="${C.glowMid}" stop-opacity="0.48"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

    const glow = showGlow
      ? `
  <g id="Backdrop">
    <rect x="0" y="0" width="${t.w}" height="${t.h}" fill="${C.bg}"/>
    <ellipse cx="${t.w / 2}" cy="${t.h * 0.36}" rx="${t.w * 0.4}" ry="${t.h * 0.34}" fill="url(#bgGlow)"/>
  </g>`
      : '';

    const edge = (d, fill, strokeW) =>
      `    <path d="${d}" fill="url(#${fill})" stroke="${C.edge}" stroke-width="${strokeW}" stroke-linejoin="round" stroke-linecap="round"/>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t.w} ${t.h}" width="${t.w}" height="${t.h}">
  <title>Lottie soft bob</title>${defs}${glow}
  <g id="Back Cap">
${edge(cap.silhouette, 'hairGold', sw)}
${edge(cap.crown, 'hairLift', sws)}
  </g>
  <g id="Left Lock">
${edge(left, 'hairAmber', sw)}
  </g>
  <g id="Right Lock">
${edge(right, 'hairAmber', sw)}
  </g>
  <g id="Shadows" fill="url(#hairDeep)">
${shade.map((s, i) => `    <path d="${s.d}" opacity="${s.opacity}"/>`).join('\n')}
  </g>
  <g id="Bounce Light" fill="url(#bounce)" opacity="0.85">
    <path d="${bounce.left}"/>
    <path d="${bounce.right}"/>
  </g>
  <g id="Front Bangs">
${edge(bangs.leftSwoop, 'hairLift', sw)}
${edge(bangs.center, 'hairGold', sws)}
${edge(bangs.right, 'hairGold', sws)}
  </g>
  <g id="Highlights" fill="url(#sheen)">
    <path d="${hi.crown}" opacity="0.88"/>
    <path d="${hi.mainBang}" opacity="0.82"/>
    <path d="${hi.leftSide}" opacity="0.72"/>
    <path d="${hi.rightSide}" opacity="0.72"/>
  </g>
</svg>`;
  }

  function buildHairLayers() {
    const t = scaleOpts('lottie');
    const cap = backCap(t);
    const bangs = frontBangs(t);
    const hi = highlights(t);
    const bounce = bounceLight(t);
    return {
      fit: {
        ...F,
        raise: ADJUST.raise,
        widen: ADJUST.widen,
      },
      backCap: {
        silhouette: cap.silhouette,
        crown: cap.crown,
      },
      leftLock: leftLock(t),
      rightLock: rightLock(t),
      shadows: shadows(t),
      bounceLight: bounce,
      frontBangs: bangs,
      highlights: hi,
    };
  }

  root.buildHairSVG = buildHairSVG;
  root.buildHairLayers = buildHairLayers;
  root.LOTTIE_HAIR_FIT = F;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { buildHairSVG, buildHairLayers, LOTTIE_HAIR_FIT: F };
  }
})(typeof window !== 'undefined' ? window : globalThis);
