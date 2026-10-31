import { Component, Suspense, lazy, useEffect, useState } from 'react';

const SolarScene = lazy(() => import('./SolarScene').then((module) => ({ default: module.SolarScene })));

class SolarHeroErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function FallbackArt() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <img
        src="/solar-fallback.svg"
        alt=""
        className="h-full w-full object-contain opacity-90"
      />
    </div>
  );
}

export function SolarHero() {
  const [supportsWebGL, setSupportsWebGL] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setSupportsWebGL(Boolean(gl));
    setIsSmallScreen(window.matchMedia('(max-width: 1023px)').matches);

    const handleResize = () => {
      setIsSmallScreen(window.matchMedia('(max-width: 1023px)').matches);
    };

    const timeout = window.setTimeout(() => setVisible(true), 20);
    window.addEventListener('resize', handleResize);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isSmallScreen) {
    return (
      <div className="pointer-events-none absolute inset-0 lg:hidden">
        <FallbackArt />
      </div>
    );
  }

  if (!supportsWebGL) {
    return (
      <div className="pointer-events-none absolute inset-0">
        <FallbackArt />
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 w-full h-full transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%), linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%)',
        WebkitMaskComposite: 'source-in',
        maskImage: 'linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%), linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%)',
        maskComposite: 'intersect',
      }}
    >
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'radial-gradient(closest-side at 50% 58%, rgba(124,108,230,0.28), rgba(96,165,250,0.12) 55%, transparent 100%)',
          filter: 'blur(22px)',
        }}
      />
      <SolarHeroErrorBoundary fallback={<FallbackArt />}>
        <Suspense fallback={<FallbackArt />}>
          <div className="absolute inset-0 w-full h-full">
            <SolarScene />
          </div>
        </Suspense>
      </SolarHeroErrorBoundary>
    </div>
  );
}
