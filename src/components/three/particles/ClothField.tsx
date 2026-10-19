"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { TextureLoader } from "three";
import { Cloth } from "./Cloth";
import type { Story } from "./story";

/** Даавуу. 3D бэлэн болсны дараа idle үед (эсвэл утасны үе эхлэхэд) mount хийгдэнэ (ParticleCanvas). */
export function ClothField({
  story,
  normalSrc,
  roughnessSrc,
}: {
  story: Story;
  normalSrc: string;
  roughnessSrc: string;
}) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const [normal, roughness] = useLoader(TextureLoader, [normalSrc, roughnessSrc]);
  const cloth = useMemo(() => new Cloth(gl, { normal, roughness }), [gl, normal, roughness]);
  useEffect(() => () => cloth.dispose(), [cloth]);

  // Даавуу утасны үеэс өмнө (idle үед) mount хийгддэг — анх харагдах үед гацахгүй.
  useEffect(() => cloth.prepare(gl, camera, scene), [gl, camera, scene, cloth]);

  useFrame(() => cloth.update(story));

  return <primitive object={cloth.group} />;
}
