import { useCallback, useEffect, useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ScrollSections } from './components/ScrollSections';
import { PhoneScene } from './three/PhoneScene';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const phoneSceneRef = useRef<PhoneScene | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNightSection, setIsNightSection] = useState(false);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const scene = new PhoneScene(mountEl);
    phoneSceneRef.current = scene;

    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const initialP = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    scene.setTargetScroll(initialP);

    return () => {
      scene.dispose();
      phoneSceneRef.current = null;
    };
  }, []);

  const handleScrollProgress = useCallback((progress: number) => {
    phoneSceneRef.current?.setTargetScroll(progress);
    setScrollProgress(progress);
  }, []);

  const handleNightChange = useCallback((isNight: boolean) => {
    setIsNightSection((prev) => (prev === isNight ? prev : isNight));
  }, []);

  return (
    <div className="relative min-h-screen w-full selection:bg-[#3182F6]/20 selection:text-[#1B64DA]">
      <div
        className={`fixed inset-0 z-0 transition-colors duration-700 ease-out pointer-events-none ${
          isNightSection ? 'bg-[#0D1320]' : 'bg-[#F9FAFB]'
        }`}
        aria-hidden="true"
      />

      <div
        ref={canvasMountRef}
        className="fixed inset-0 z-10 pointer-events-none"
        aria-hidden="true"
      />

      <Navbar scrollProgress={scrollProgress} isNightSection={isNightSection} />

      <main>
        <ScrollSections
          onScrollProgress={handleScrollProgress}
          onNightChange={handleNightChange}
        />
      </main>
    </div>
  );
}
