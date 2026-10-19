import * as THREE from "three";
import { GPUComputationRenderer, type Variable } from "three/addons/misc/GPUComputationRenderer.js";
import { hexToRgb, type ParticleSettings } from "./settings";
import {
  pointsFragmentShader,
  pointsVertexShader,
  positionShader,
  velocityShader,
} from "./shaders";
import type { Story } from "./story";

/** Салхины үеийн энэ progress хүртэл ширхэгийн давхарга статик зургийг орлоно (HeroScrollStage-тэй тааруулсан). */
export const REVEAL_END = 0.02;

export type PointerState = { x: number; y: number; vx: number; vy: number; active: number };

export type FrameInput = {
  delta: number;
  story: Story;
  /** CSS px */
  width: number;
  height: number;
  dpr: number;
  /** Камерын зай (z = 0 хавтгайд 1 нэгж = 1 px). */
  camDist: number;
  pointer: PointerState;
  settings: ParticleSettings;
};

/**
 * Зургийг `count` ширхэг болгож, scroll-оор утас → нэхмэл → даавууны гадаргуу руу хувиргана.
 * Тооцоолол бүхэлдээ GPU дээр (ping-pong FBO): CPU зөвхөн uniform шинэчилнэ.
 */
export class ParticleSystem {
  readonly points: THREE.Points;
  readonly cols: number;
  readonly rows: number;

  private gpu: GPUComputationRenderer;
  private position: Variable;
  private velocity: Variable;
  private material: THREE.ShaderMaterial;
  private imageWidth: number;
  private imageAspect: number;
  private focusY: number;
  private time = 0;
  /** Симуляци ба render хоёр material-д нэг объектоор холбогдсон (утас/нэхмэл/даавууны хэлбэр). */
  private shared = {
    uViewport: { value: new THREE.Vector2(1, 1) },
    uGrid: { value: new THREE.Vector2(1, 1) },
    uGather: { value: 0 },
    uSpin: { value: 0 },
    uKnit: { value: 0 },
    uRows: { value: 16 },
    uStitches: { value: 24 },
    uClothRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    uWave: { value: 0 },
    uClothTime: { value: 0 },
  };

  constructor(
    renderer: THREE.WebGLRenderer,
    opts: {
      count: number;
      /** Сүлжээний өргөн/өндөр харьцаа (дэлгэцийнхтэй ойролцоо). */
      aspect: number;
      image: THREE.Texture;
      /** Зургийн босоо фокус (CSS object-position Y, 0 = дээр). */
      focusY: number;
    },
  ) {
    this.cols = Math.max(2, Math.round(Math.sqrt(opts.count * opts.aspect)));
    this.rows = Math.max(2, Math.round(opts.count / this.cols));
    const { width, height } = opts.image.image as { width: number; height: number };
    this.imageWidth = width;
    this.imageAspect = width / height;
    this.focusY = opts.focusY;

    const gpu = new GPUComputationRenderer(this.cols, this.rows, renderer);
    // Float render target дэмжихгүй хуучин төхөөрөмж (displacement тул HalfFloat хангалттай).
    if (!renderer.extensions.has("EXT_color_buffer_float")) gpu.setDataType(THREE.HalfFloatType);

    this.position = gpu.addVariable("texturePosition", positionShader, gpu.createTexture());
    this.velocity = gpu.addVariable("textureVelocity", velocityShader, gpu.createTexture());
    gpu.setVariableDependencies(this.position, [this.position, this.velocity]);
    gpu.setVariableDependencies(this.velocity, [this.position, this.velocity]);

    this.position.material.uniforms.uDelta = { value: 0 };
    this.shared.uGrid.value.set(this.cols, this.rows);
    Object.assign(this.velocity.material.uniforms, this.shared, {
      uTime: { value: 0 },
      uDelta: { value: 0 },
      uWind: { value: 0 },
      uCloth: { value: 0 },
      uTurbulence: { value: 0 },
      uDrift: { value: 0 },
      uCurlScale: { value: 1 },
      uPointer: { value: new THREE.Vector2(-1e5, -1e5) },
      uPointerVel: { value: new THREE.Vector2() },
      uPointerActive: { value: 0 },
      uPointerRadius: { value: 100 },
      uPointerStrength: { value: 0 },
    });

    const error = gpu.init();
    if (error) throw new Error(`GPUComputationRenderer: ${error}`);
    this.gpu = gpu;

    // Ширхэг бүрийн "хаяг" — симуляцийн texel-ийн төв (position.xy-д).
    const count = this.cols * this.rows;
    const refs = new Float32Array(count * 3);
    for (let y = 0, i = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++, i += 3) {
        refs[i] = (x + 0.5) / this.cols;
        refs[i + 1] = (y + 0.5) / this.rows;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(refs, 3));

    this.material = new THREE.ShaderMaterial({
      vertexShader: pointsVertexShader,
      fragmentShader: pointsFragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        ...this.shared,
        uPosition: { value: null },
        uVelocity: { value: null },
        uImage: { value: opts.image },
        uCrop: { value: new THREE.Vector4(0, 0, 1, 1) },
        uImageLod: { value: 0 },
        uSpacing: { value: 4 },
        uDpr: { value: 1 },
        uFiberSize: { value: 2 },
        uFiberAlpha: { value: 0.5 },
        uTint: { value: new THREE.Vector3(1, 1, 1) },
        uTintMix: { value: 0 },
        uReveal: { value: 0 },
        uYarn: { value: new THREE.Vector3(1, 1, 1) },
        uFade: { value: 0 },
        uCamDist: { value: 1000 },
      },
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 1; // даавуун дээр (crossfade)
  }

  get count() {
    return this.cols * this.rows;
  }

  update({ delta, story, width, height, dpr, camDist, pointer, settings: s }: FrameInput) {
    // Даавуу бүрэн орж ирсний дараа ширхэгүүд үл харагдана — симуляцийг ч зогсооно.
    // Буцааж гүйлгэхэд даавууны гадаргуугаас үргэлжилнэ.
    this.points.visible = story.clothFade < 1;
    if (!this.points.visible) return;
    this.time += delta;

    const sh = this.shared;
    sh.uViewport.value.set(width, height);
    sh.uGather.value = story.gather;
    sh.uSpin.value = story.spin;
    sh.uKnit.value = story.knit;
    sh.uRows.value = story.rows;
    sh.uStitches.value = story.stitches;
    sh.uClothRect.value.set(...story.rect);
    sh.uWave.value = story.wave;
    sh.uClothTime.value = story.time;

    const v = this.velocity.material.uniforms;
    v.uTime.value = this.time;
    v.uDelta.value = delta;
    v.uWind.value = story.wind;
    v.uCloth.value = story.clothSnap;
    v.uTurbulence.value = s.turbulence;
    v.uDrift.value = s.drift;
    v.uCurlScale.value = s.curlScale;
    v.uPointer.value.set(pointer.x, pointer.y);
    v.uPointerVel.value.set(pointer.vx, pointer.vy);
    v.uPointerActive.value = pointer.active;
    v.uPointerRadius.value = s.pointerRadius;
    v.uPointerStrength.value = s.pointerStrength;
    this.position.material.uniforms.uDelta.value = delta;

    this.gpu.compute();

    const u = this.material.uniforms;
    u.uPosition.value = this.gpu.getCurrentRenderTarget(this.position).texture;
    u.uVelocity.value = this.gpu.getCurrentRenderTarget(this.velocity).texture;
    u.uDpr.value = dpr;
    u.uCamDist.value = camDist;
    u.uYarn.value.set(...story.yarnSrgb);
    u.uFade.value = story.clothFade;
    // Сүлжээ дэлгэцийг бүрэн бүрхэнэ: зайг хоёр тэнхлэгийн томоор нь.
    const spacing = Math.max(width / this.cols, height / this.rows);
    u.uSpacing.value = spacing;
    u.uFiberSize.value = s.fiberSize;
    u.uFiberAlpha.value = s.fiberAlpha;
    u.uTint.value.set(...hexToRgb(s.tint));
    u.uTintMix.value = s.tintMix;
    u.uReveal.value = THREE.MathUtils.smoothstep(story.revealWind, 0, REVEAL_END);

    // CSS `object-cover` + object-position: 50% focusY.
    const view = width / height;
    const crop = u.uCrop.value as THREE.Vector4;
    if (view > this.imageAspect) {
      const sy = this.imageAspect / view;
      crop.set(0, (1 - sy) * (1 - this.focusY), 1, sy); // texture flipY: v=0 доор
    } else {
      const sx = view / this.imageAspect;
      crop.set((1 - sx) * 0.5, 0, sx, 1);
    }
    // Ширхэг бүр зургийн өөрт ногдох талбайн дундаж өнгийг авна (aliasing-гүй).
    u.uImageLod.value = Math.max(0, Math.log2((this.imageWidth * crop.z) / this.cols));
  }

  dispose() {
    this.gpu.dispose();
    this.points.geometry.dispose();
    this.material.dispose();
  }
}
