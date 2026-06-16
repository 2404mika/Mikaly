import { useEffect, useRef, useState, RefObject } from 'react';

// Hook pour détecter quand un élément entre dans le viewport
export const useInView = (threshold = 0.1): [RefObject<HTMLDivElement | null>, boolean] => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView];
};

// Classes d'animation réutilisables
export const animations = {
  // Apparition depuis le bas
  fadeUp: 'animate-[fadeUp_0.5s_cubic-bezier(0.4,0,0.2,1)_both]',
  // Apparition depuis la gauche
  fadeLeft: 'animate-[fadeLeft_0.5s_cubic-bezier(0.4,0,0.2,1)_both]',
  // Apparition depuis la droite
  fadeRight: 'animate-[fadeRight_0.5s_cubic-bezier(0.4,0,0.2,1)_both]',
  // Apparition simple
  fadeIn: 'animate-[fadeIn_0.4s_cubic-bezier(0.4,0,0.2,1)_both]',
  // Apparition avec zoom
  scaleIn: 'animate-[scaleIn_0.4s_cubic-bezier(0.4,0,0.2,1)_both]',
  // Slide vers le bas
  slideDown: 'animate-[slideDown_0.3s_cubic-bezier(0.4,0,0.2,1)_both]',
};

// Délais pour les animations séquentielles
export const delays = {
  0: 'animation-delay-[0ms]',
  1: 'animation-delay-[100ms]',
  2: 'animation-delay-[200ms]',
  3: 'animation-delay-[300ms]',
  4: 'animation-delay-[400ms]',
  5: 'animation-delay-[500ms]',
  6: 'animation-delay-[600ms]',
  7: 'animation-delay-[700ms]',
};
