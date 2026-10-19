/**
 * GLSL. Симуляцийн төлөв нь эх байрлалаас (зургийн цэг) хэр холдсон —
 * displacement (px) — тул жижиг утга, HalfFloat дээр ч нарийвчлал алдахгүй.
 *
 *   texturePosition: xyz = displacement (px), w = release
 *   textureVelocity: xyz = хурд (px/s),       w = release (0 = зурагт, 1 = салхинд)
 */

/** Ashima simplex 3D + analytic gradient (MIT, Ian McEwan / Stefan Gustavson). */
const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v, out vec3 gradient) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  vec4 m2 = m * m;
  vec4 m4 = m2 * m2;
  vec4 pdotx = vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3));
  vec4 temp = m2 * m * pdotx;
  gradient = -8.0 * (temp.x * x0 + temp.y * x1 + temp.z * x2 + temp.w * x3);
  gradient += m4.x * p0 + m4.y * p1 + m4.z * p2 + m4.w * p3;
  gradient *= 105.0;
  return 105.0 * dot(m4, pdotx);
}

float snoise(vec3 v) { vec3 g; return snoise(v, g); }

// Curl = ∇ × (n1, n2, n3) — хуваагдалгүй (divergence-free) урсгал, утаа/ноос шиг эргэлдэнэ.
vec3 curlNoise(vec3 p) {
  vec3 g1; vec3 g2; vec3 g3;
  snoise(p, g1);
  snoise(p + vec3(31.416, 17.13, 9.71), g2);
  snoise(p + vec3(-13.7, 47.33, 21.9), g3);
  return vec3(g3.y - g2.z, g1.z - g3.x, g2.x - g1.y);
}

`;

const hashGlsl = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 seeds(vec2 uv) {
  vec2 q = uv * 1789.13;
  return vec3(hash12(q), hash12(q + 17.31), hash12(q + 41.07));
}
`;

/**
 * Даавууны гадаргуу. Cloth material ба ширхэгүүд (даавуунд буух үед) хоёулаа ашиглана —
 * тиймээс ширхэгүүд намирах долгионтой яг давхцаж, crossfade үсрэлтгүй.
 * Зүүн ирмэг бэхлэгдсэн туг шиг намирна.
 */
export const clothGlsl = /* glsl */ `
uniform vec4 uClothRect;
uniform float uWave;
uniform float uClothTime;

vec3 clothPosition(vec2 uv) {
  float pin = uv.x;
  float t = uClothTime;
  float ph1 = uv.x * 5.0 - t * 1.6 + uv.y * 1.2;
  float ph2 = uv.x * 9.0 - t * 2.3 - uv.y * 2.4;
  float ph3 = uv.y * 4.0 - t * 1.1 + uv.x * 2.0;
  float z = (sin(ph1) * 0.7 + sin(ph2) * 0.22 + sin(ph3) * 0.15) * pin;
  vec3 wave = vec3(
    -pin * pin * 0.035 * uClothRect.z * (1.0 + 0.4 * sin(ph1)),
    sin(ph1 * 0.8 + 0.5) * pin * uClothRect.w * 0.025,
    z * uClothRect.z * 0.12
  ) * uWave;
  return vec3(uClothRect.xy + (uv - 0.5) * uClothRect.zw, 0.0) + wave;
}

vec3 clothNormal(vec2 uv) {
  const float e = 0.003;
  vec3 du = clothPosition(uv + vec2(e, 0.0)) - clothPosition(uv - vec2(e, 0.0));
  vec3 dv = clothPosition(uv + vec2(0.0, e)) - clothPosition(uv - vec2(0.0, e));
  return normalize(cross(du, dv));
}
`;

/** Утас ба нэхмэлийн хэлбэр — симуляци (зорилт) ба render (ширхэгийн чиглэл) хуваалцана. */
const structureGlsl = /* glsl */ `
uniform vec2 uViewport;
uniform vec2 uGrid;
uniform float uGather;
uniform float uSpin;
uniform float uKnit;
uniform float uRows;
uniform float uStitches;

const float TAU = 6.2831853;

// Утсан дээрх байрлал (0..1) — эх зургийн x-ээс авна, тиймээс нийлэх зам богино.
float threadParam(vec2 uv, vec3 s) { return uv.x + (s.x - 0.5) / uGrid.x; }

float threadRadius() { return clamp(uViewport.y * 0.03, 10.0, 26.0); }

vec3 threadAxis(float t) {
  return vec3((t - 0.5) * uViewport.x * 1.15, sin(t * TAU + 0.6) * uViewport.y * 0.05, 0.0);
}

// 3 ply-тэй мушгирсан утас; ширхэг бүр ply дотроо дахин мушгирна. uSpin = scroll-оор ээрэх.
vec3 threadPos(float t, vec3 s) {
  float R = threadRadius();
  float turns = uViewport.x * 1.15 / (R * 7.0);
  float ply = floor(s.y * 3.0);
  float th = t * TAU * turns + ply * TAU / 3.0 + uSpin;
  float ph = s.x * TAU + t * TAU * turns * 2.6 + uSpin * 1.7;
  vec2 yz = vec2(cos(th), sin(th)) * R * 0.52 + vec2(cos(ph), sin(ph)) * R * 0.48 * sqrt(s.z);
  return threadAxis(t) + vec3(0.0, yz);
}

// Ширхэг бүр өөрийн мөчид нийлнэ — нэг дор биш.
float gatherWeight(vec3 s) {
  return smoothstep(0.0, 1.0, clamp(uGather * 1.5 - s.x * 0.5, 0.0, 1.0));
}

float knitRow(vec2 uv) { return min(floor(uv.y * uRows), uRows - 1.0); }

// Мөрүүд доороосоо дээш нэг нэгээр нэхэгдэнэ.
float knitWeight(vec2 uv) {
  float r = knitRow(uv) / max(uRows - 1.0, 1.0);
  return smoothstep(0.0, 1.0, clamp(uKnit * 1.6 - r * 0.6, 0.0, 1.0));
}

// Сүлжмэлийн мөр: x = τ + a·sin 2θ, y = b·cos θ, z = c·cos 2θ — гогцоонууд
// дээд/доод мөрийнхөө гогцоотой орооцолдоно. Утас өөрөө мушгиа хэвээр.
vec3 knitPos(vec2 uv, float along, vec3 s) {
  float row = knitRow(uv);
  float rowH = uClothRect.w / uRows;
  float tau = clamp(along, 0.0, 1.0) * uStitches;
  float th = tau * TAU;
  vec3 c = vec3(tau + 0.2 * sin(2.0 * th), 0.62 * cos(th), 0.35 * cos(2.0 * th));
  vec3 p = vec3(
    uClothRect.x + (c.x / uStitches - 0.5) * uClothRect.z,
    uClothRect.y + ((row + 0.5) / uRows - 0.5) * uClothRect.w + c.y * rowH,
    c.z * rowH
  );
  float ph = s.x * TAU + tau * TAU * 1.5 + uSpin * 0.5;
  p.yz += vec2(cos(ph), sin(ph)) * rowH * 0.2 * sqrt(s.z);
  return p;
}
`;

export const velocityShader = /* glsl */ `
uniform float uTime;
uniform float uDelta;
uniform float uWind;
uniform float uCloth;
uniform float uTurbulence;
uniform float uDrift;
uniform float uCurlScale;
uniform vec2 uPointer;
uniform vec2 uPointerVel;
uniform float uPointerActive;
uniform float uPointerRadius;
uniform float uPointerStrength;

${simplexNoise}
${hashGlsl}
${clothGlsl}
${structureGlsl}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 disp = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  vec3 origin = vec3((uv - 0.5) * uViewport, 0.0);
  vec3 p = origin + disp;
  vec3 s = seeds(uv);

  // 1. Салхи. Фронт зүүнээс баруун тийш, ирмэг нь noise-оор урагдсан. Ширхэг бүрийн
  // санамсаргүй хэсэг бага — эс бөгөөс фронтын ард тусгаар "пиксел" цэгүүд үлдэнэ.
  float front = uv.x * 0.55 + snoise(vec3(uv * 4.0, 0.0)) * 0.1 + snoise(vec3(uv * 12.0, 3.0)) * 0.04
    + s.x * 0.07 + 0.15;
  float release = smoothstep(0.0, 0.12, uWind * 1.3 - front);
  // Зорилтот байрлал бүр scroll-оос шууд хамаарна — буцааж гүйлгэхэд өмнөх хэлбэр рүүгээ буцна.
  vec3 carry = vec3(0.35 + 0.65 * s.y, (s.z - 0.35) * 0.5, (s.z - 0.5) * 0.6) * uDrift * uViewport.y;
  vec3 target = origin + carry * release;

  // 2. Утас: тэнхлэгээ тойрон эргэлдсээр (спираль) нийлнэ.
  float g = gatherWeight(s);
  float t = threadParam(uv, s);
  vec3 axis = threadAxis(t);
  vec3 off = target - axis;
  float a = g * 4.0;
  off.yz = mat2(cos(a), sin(a), -sin(a), cos(a)) * off.yz;
  target = axis + off * (1.0 - g) + (threadPos(t, s) - axis) * g;

  // 3. Нэхмэл: утаснаас мөр мөрөөр салж, бага зэрэг хөөрч байрандаа очно.
  float kw = knitWeight(uv);
  target = mix(target, knitPos(uv, t, s), kw);
  target.z += sin(kw * 3.14159) * uViewport.y * 0.06;

  // 4. Даавуу: гадаргуу дээр буух — Cloth mesh-тэй ижил функц.
  target = mix(target, clothPosition(uv), uCloth);

  // Хэлбэртэй үед хатуу пүрш (ээрэлтийг дагана), салхинд сул.
  float structure = max(g, max(kw, uCloth));
  float k = mix(mix(60.0, 1.8, release), 28.0, structure);
  float damping = mix(mix(14.0, 1.6, release), 9.0, structure);
  vec3 acc = (target - p) * k;

  vec3 q = p / uViewport.y * uCurlScale + vec3(0.0, 0.0, uTime * 0.08);
  acc += curlNoise(q) * uTurbulence * release * (1.0 - 0.9 * structure);

  // Хулгана / хурууны салхи: түлхэлт + хөдөлгөөний чиглэлд урсгал.
  vec2 d = p.xy - uPointer;
  float f = exp(-dot(d, d) / (uPointerRadius * uPointerRadius)) * uPointerActive;
  acc.xy += (normalize(d + 1e-4) * uPointerStrength + uPointerVel * 0.8) * f;
  acc.z += (s.y - 0.5) * uPointerStrength * 0.6 * f;

  vel += acc * uDelta;
  vel *= exp(-damping * uDelta);
  gl_FragColor = vec4(vel, release);
}
`;

export const positionShader = /* glsl */ `
uniform float uDelta;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec4 vel = texture2D(textureVelocity, uv);
  gl_FragColor = vec4(pos.xyz + vel.xyz * uDelta, vel.w);
}
`;

export const pointsVertexShader = /* glsl */ `
uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform sampler2D uImage;
uniform vec4 uCrop;
uniform float uImageLod;
uniform float uSpacing;
uniform float uDpr;
uniform float uFiberSize;
uniform float uFiberAlpha;
uniform vec3 uTint;
uniform float uTintMix;
// 0 = статик зураг доороо харагдаж байна (scroll эхлээгүй) — зөвхөн хөдөлсөн ширхэг харагдана.
uniform float uReveal;
uniform vec3 uYarn;
// 1 = даавуу бүрэн орж ирсэн, ширхэгүүд уусна.
uniform float uFade;
uniform float uCamDist;

varying vec3 vColor;
varying float vAlpha;
varying vec2 vDir;
varying float vThin;

${hashGlsl}
${clothGlsl}
${structureGlsl}

void main() {
  // position.xy = симуляцийн texture дахь энэ ширхэгийн uv.
  vec2 ref = position.xy;
  vec4 pos = texture2D(uPosition, ref);
  vec4 vel = texture2D(uVelocity, ref);
  vec3 p = vec3((ref - 0.5) * uViewport, 0.0) + pos.xyz;
  vec3 s = seeds(ref);

  // fiber: 0 = зургийн пиксел, 1 = чөлөөт ноосон ширхэг. Бөөрөнхий "пиксел" үе богино;
  // хулганаар түлхэгдсэн (loose) ширхэг бүрэн утас болохгүй — зөөлөн долгио шиг.
  float loose = clamp((length(pos.xyz) - uSpacing * 2.0) / (uSpacing * 4.0), 0.0, 1.0);
  float fiber = smoothstep(0.0, 0.25, max(vel.w, loose * 0.6));

  vec3 img = textureLod(uImage, uCrop.xy + ref * uCrop.zw, uImageLod).rgb;
  vec3 color = mix(img, uTint, uTintMix * fiber);

  // Утас/нэхмэл: утасны өнгө (ширхэг бүр бага зэрэг өөр), чиглэл нь утасны дагуу.
  float g = gatherWeight(s);
  float kw = knitWeight(ref);
  float yarn = max(g, kw);
  vColor = mix(color, uYarn * (0.8 + 0.4 * s.y), yarn);

  float speed = length(vel.xy);
  vec2 dir = speed > 0.001 ? vel.xy / speed : vec2(1.0, 0.0);
  if (yarn > 0.0) {
    float t = threadParam(ref, s);
    float e = 0.5 / uGrid.x;
    vec3 tangent = mix(
      threadPos(t + e, s) - threadPos(t - e, s),
      knitPos(ref, t + e, s) - knitPos(ref, t - e, s),
      kw
    );
    vec2 along = length(tangent.xy) > 1e-4 ? normalize(tangent.xy) : vec2(1.0, 0.0);
    if (dot(along, dir) < 0.0) along = -along;
    float settled = yarn * (1.0 - clamp(speed / 400.0, 0.0, 1.0));
    dir = normalize(mix(dir, along, settled) + vec2(1e-5, 0.0));
  }
  vDir = dir;
  float stretch = clamp(speed / 260.0, 0.0, 1.0);
  vThin = mix(mix(1.0, mix(0.32, 0.12, stretch), fiber), 0.22, yarn);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float size = mix(uSpacing * 2.0, uSpacing * uFiberSize * (1.0 + stretch), fiber);
  gl_PointSize = size * uDpr * uCamDist / max(-mv.z, 1.0);
  vAlpha = mix(mix(uReveal, uFiberAlpha, fiber), 0.75, yarn) * (1.0 - uFade);

  gl_Position = projectionMatrix * mv;
}
`;

export const pointsFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying vec2 vDir;
varying float vThin;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  c.y = -c.y;
  // Чиглэлд сунасан эллипс — нарийн ноосон ширхэг.
  vec2 q = vec2(dot(c, vDir), dot(c, vec2(-vDir.y, vDir.x)) / vThin);
  float d = length(q) * 2.0;
  float a = (1.0 - smoothstep(mix(0.0, 0.55, vThin), 1.0, d)) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a);
}
`;
