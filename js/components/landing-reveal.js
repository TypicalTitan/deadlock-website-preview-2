// A scroll-driven reveal of the existing Sapphire Hall still. No video, canvas, or animation loop.
import { html } from 'htm/preact';
import { useEffect, useRef } from 'preact/hooks';

export function LandingReveal({ onContinue }) {
  const scene = useRef(null);
  const stage = useRef(null);

  useEffect(() => {
    const element = scene.current;
    const viewport = stage.current;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = null;
    let mounted = true;

    const update = () => {
      frame = null;
      if (!mounted) return;
      if (reducedMotion.matches) {
        element.style.removeProperty('--reveal-scale');
        element.style.removeProperty('--reveal-shift');
        element.style.removeProperty('--reveal-shade');
        return;
      }

      // Read current geometry: the header can wrap, and mobile viewports can resize.
      const bounds = element.getBoundingClientRect();
      const distance = bounds.height - viewport.getBoundingClientRect().height;
      const progress = distance > 0 ? Math.min(1, Math.max(0, -bounds.top / distance)) : 0;
      const eased = progress * progress * (3 - 2 * progress);
      element.style.setProperty('--reveal-scale', (1.3 - 0.28 * eased).toFixed(5));
      element.style.setProperty('--reveal-shift', `${(5 * (1 - eased)).toFixed(3)}%`);
      element.style.setProperty('--reveal-shade', (0.3 - 0.24 * eased).toFixed(3));
    };

    const schedule = () => {
      if (mounted && frame === null) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    observer.observe(viewport);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    addEventListener('pageshow', schedule);
    reducedMotion.addEventListener('change', schedule);
    document.fonts.ready.then(schedule);
    schedule();

    return () => {
      mounted = false;
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      removeEventListener('pageshow', schedule);
      reducedMotion.removeEventListener('change', schedule);
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return html`
    <section class="landing-reveal" ref=${scene} aria-labelledby="landing-title">
      <div class="landing-reveal__stage" ref=${stage}>
        <img
          class="landing-reveal__image"
          src="./img/sapphire-hall-1920.jpg"
          srcset="./img/sapphire-hall-600.jpg 600w, ./img/sapphire-hall-1920.jpg 1920w"
          sizes="(max-aspect-ratio: 16/9) 178svh, 100vw"
          width="1920"
          height="1080"
          alt=""
          fetchpriority="high"
        />
        <div class="landing-reveal__shade" aria-hidden="true"></div>
        <div class="landing-reveal__intro">
          <h1 id="landing-title">[Tournament name]</h1>
          <p class="landing-reveal__hint">[Scroll to reveal]</p>
        </div>
        <button class="landing-reveal__continue" type="button" onClick=${onContinue}>
          [Continue to tournament] <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  `;
}
