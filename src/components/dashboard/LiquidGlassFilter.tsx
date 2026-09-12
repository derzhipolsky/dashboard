import { useLayoutEffect } from 'react';

export function LiquidGlassFilter() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const userAgent = navigator.userAgent;
    const isAppleMobile = /iPad|iPhone|iPod/.test(userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isDesktopChromium = /Chrome|Chromium|Edg|OPR|SamsungBrowser/.test(userAgent)
      && !isAppleMobile;
    const isWebKit = /AppleWebKit/.test(userAgent) && !isDesktopChromium;
    const isFirefox = /Firefox/.test(userAgent) && !isAppleMobile;
    const supportsSvgBackdropFilter = typeof CSS !== 'undefined'
      && CSS.supports('backdrop-filter', 'blur(1px) url("#liquid-glass-soft-refraction")');
    const needsFallback = isWebKit || isFirefox || !supportsSvgBackdropFilter;
    const mobileQuery = window.matchMedia('(pointer: coarse), (max-width: 767px)');

    const syncRenderingMode = () => {
      root.classList.toggle('liquid-glass-webkit', isWebKit);
      root.classList.toggle('liquid-glass-firefox', isFirefox);
      root.classList.toggle('liquid-glass-mobile', mobileQuery.matches);
      root.classList.toggle('liquid-glass-fallback', needsFallback);
    };

    syncRenderingMode();
    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', syncRenderingMode);
    } else {
      mobileQuery.addListener(syncRenderingMode);
    }

    return () => {
      if (typeof mobileQuery.removeEventListener === 'function') {
        mobileQuery.removeEventListener('change', syncRenderingMode);
      } else {
        mobileQuery.removeListener(syncRenderingMode);
      }
      root.classList.remove(
        'liquid-glass-webkit',
        'liquid-glass-firefox',
        'liquid-glass-mobile',
        'liquid-glass-fallback',
      );
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="liquid-filter-definitions"
    >
      <defs>
        <filter
          id="liquid-glass-refraction"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={`${import.meta.env.BASE_URL}liquid-glass-displacement.png`}
            preserveAspectRatio="none"
            result="surfaceDisplacement"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="surfaceDisplacement"
            scale="42"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter
          id="liquid-glass-icon-refraction"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014 0.02"
            numOctaves="1"
            seed="13"
            result="iconNoise"
          />
          <feGaussianBlur in="iconNoise" stdDeviation="0.8" result="iconMap" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="iconMap"
            scale="28"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter
          id="liquid-glass-soft-refraction"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            href={`${import.meta.env.BASE_URL}liquid-glass-displacement-wide.png`}
            preserveAspectRatio="none"
            result="softSurfaceDisplacement"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softSurfaceDisplacement"
            scale="32"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

      </defs>
    </svg>
  );
}
