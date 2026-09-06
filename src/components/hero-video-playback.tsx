"use client";

import { useEffect } from "react";

/**
 * Starts the hero clip when the browser's autoplay policy refuses to.
 *
 * A blocked autoplay is silent: no error fires, `readyState` reaches 4, and the
 * element simply sits at currentTime ~0 showing its poster frame. That is
 * indistinguishable from a working still, which is exactly how this hid.
 *
 * Browsers always honour play() inside a user gesture, so we retry on every
 * interaction until playback actually sticks, then stop listening. Rendering
 * never depends on this: the <video> is server-rendered either way.
 */
const GESTURES = ["pointerdown", "keydown", "touchstart", "scroll", "wheel"] as const;

export function HeroVideoPlayback() {
  useEffect(() => {
    const video = document.querySelector<HTMLVideoElement>("video.hero-video");
    if (!video) return;

    // Some engines only honour the muted property, not the attribute.
    video.muted = true;
    video.defaultMuted = true;

    let done = false;

    const stop = () => {
      if (done) return;
      done = true;
      for (const e of GESTURES) window.removeEventListener(e, tryPlay);
      document.removeEventListener("visibilitychange", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };

    function tryPlay() {
      if (done || !video) return;
      video
        .play()
        .then(() => {
          if (!video.paused) stop();
        })
        .catch(() => undefined);
    }

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    document.addEventListener("visibilitychange", tryPlay);
    // Deliberately not { once: true }: an early gesture can land before the
    // policy will allow playback, and we want the next one to try again.
    for (const e of GESTURES) window.addEventListener(e, tryPlay, { passive: true });

    return stop;
  }, []);

  return null;
}
