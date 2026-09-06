import Image from "next/image";

import { HeroVideoPlayback } from "@/components/hero-video-playback";

/**
 * The looping vial carousel behind the hero.
 *
 * This renders on the server with no JavaScript gate. An earlier version mounted
 * the <video> only after hydration, once a matchMedia check passed — which meant
 * anything that interfered with hydration left the hero as a bare poster with no
 * error to show for it. Viewport and reduced-motion are now handled in CSS, so
 * the element is always in the HTML and its visibility is not conditional on JS
 * running at all.
 *
 * mp4 is listed before webm on purpose: Safari's VP9 support is unreliable, and
 * it can select a webm source it then fails to paint.
 */
export function HeroVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src="/hero/vials-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center scale-[1.02]"
      />

      <video
        className="hero-video absolute inset-0 h-full w-full object-cover object-center scale-[1.02]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero/vials-poster.webp"
      >
        <source src="/hero/vials-loop.mp4" type="video/mp4" />
        <source src="/hero/vials-loop.webm" type="video/webm" />
      </video>

      <HeroVideoPlayback />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(closest-side at 50% 48%, rgb(9 12 11 / 0.92) 0%, rgb(9 12 11 / 0.78) 42%, rgb(9 12 11 / 0.25) 72%, transparent 100%)",
        }}
      />
      {/* Feathered on all four edges. The top ramp is a cool near-black rather
          than the warm lamp colour: the amber ground bleeding through here read
          as an orange stripe under the nav. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--hero-edge) 0%, rgb(9 12 11 / 0.55) 6%, transparent 22%, transparent 58%, var(--hero-edge) 100%), linear-gradient(to right, var(--hero-edge) 0%, transparent 14%, transparent 86%, var(--hero-edge) 100%)",
        }}
      />
    </div>
  );
}
