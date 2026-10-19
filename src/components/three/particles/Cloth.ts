import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { clothGlsl } from "./shaders";
import type { Story } from "./story";

/** Нэг texture давталтын хэмжээ (px). cotton_jersey нэг tile-д ~250 гогцоотой → дэлгэц дээр ~5.5px гогцоо. */
const TILE_PX = 1400;

/**
 * Салхинд намирах ноолуурын даавуу. Хэлбэрийг vertex shader-т `clothGlsl`-ээр тооцно
 * (ширхэгүүд даавуунд буухдаа яг ижил функц ашигладаг). Sheen = ноолуурын зөөлөн гялбаа.
 */
export class Cloth {
  readonly group = new THREE.Group();

  private material: THREE.MeshPhysicalMaterial;
  private geometry = new THREE.PlaneGeometry(1, 1, 160, 100);
  private envMap: THREE.Texture;
  private maps: THREE.Texture[];
  private uniforms = {
    uClothRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    uWave: { value: 0 },
    uClothTime: { value: 0 },
  };

  constructor(
    renderer: THREE.WebGLRenderer,
    { normal, roughness }: { normal: THREE.Texture; roughness: THREE.Texture },
  ) {
    this.maps = [normal, roughness];
    for (const map of this.maps) {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      map.needsUpdate = true;
    }

    // Зөөлөн студийн гэрэл (HDR файл татахгүй) — sheen-д ирмэгийн гялбаа өгнө.
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.material = new THREE.MeshPhysicalMaterial({
      roughness: 1,
      roughnessMap: roughness,
      normalMap: normal,
      normalScale: new THREE.Vector2(1.6, 1.6),
      sheen: 0.7,
      sheenRoughness: 0.5,
      envMap: this.envMap,
      envMapIntensity: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    this.material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${clothGlsl}`)
        .replace(
          "#include <beginnormal_vertex>",
          "vec3 objectNormal = clothNormal(uv);\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3(tangent.xyz);\n#endif",
        )
        .replace("#include <begin_vertex>", "vec3 transformed = clothPosition(uv);");
    };

    const mesh = new THREE.Mesh(this.geometry, this.material);
    mesh.frustumCulled = false;

    // Хажуугаас тусах гэрэл — намиралтын хуниас тод харагдана. Нийт гэрэл swatch-ийн өнгөтэй ойролцоо.
    const key = new THREE.DirectionalLight(0xfff3e3, 1.5);
    key.position.set(-0.9, 0.5, 0.6);
    const fill = new THREE.HemisphereLight(0xffffff, 0xe9dcc6, 0.35);
    this.group.add(mesh, key, fill);
    this.group.visible = false;
  }

  /**
   * Shader-ийг (KHR_parallel_shader_compile) болон текстурыг GPU-д урьдчилан бэлдэнэ — анх
   * харагдах frame гацахгүй. `compile` нь нуугдмал объектыг алгасдаг тул түр харагдуулна.
   */
  prepare(gl: THREE.WebGLRenderer, camera: THREE.Camera, scene: THREE.Scene) {
    for (const map of this.maps) gl.initTexture(map);
    this.group.visible = true;
    gl.compileAsync(this.group, camera, scene).catch(() => {});
    this.group.visible = false;
  }

  update(story: Story) {
    const [, , w, h] = story.rect;
    this.group.visible = story.clothFade > 0;
    if (!this.group.visible) return;

    this.uniforms.uClothRect.value.set(...story.rect);
    this.uniforms.uWave.value = story.wave;
    this.uniforms.uClothTime.value = story.time;
    for (const map of this.maps) map.repeat.set(w / TILE_PX, h / TILE_PX);

    this.material.opacity = story.clothFade;
    this.material.color.copy(story.yarn);
    // Гялбаа нь өнгөнийхөө цайвар хувилбар — ноолуур шиг зөөлөн, металлаг биш.
    this.material.sheenColor.copy(story.yarn).lerp(WHITE, 0.3);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.envMap.dispose();
  }
}

const WHITE = new THREE.Color(1, 1, 1);
