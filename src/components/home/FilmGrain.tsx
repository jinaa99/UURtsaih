/**
 * Нарийн film grain + зөөлөн vignette — бүх зүйлийн дээр, товшилтыг саадгүй нэвтрүүлнэ.
 * Grain нь SVG feTurbulence tile; хөдөлгөөн нь зөвхөн transform (compositor) тул хямд.
 */
const noise = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.17 0 0 0 0 0.15 0 0 0 0 0.13 0 0 0 0.9 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
)}")`;

export function FilmGrain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[45] overflow-hidden">
      <div
        className="film-grain absolute -inset-[50%] opacity-[0.07]"
        style={{ backgroundImage: noise, backgroundSize: "180px 180px" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_45%,transparent_58%,rgb(43_39_35/0.13)_100%)]" />
    </div>
  );
}
