import { ReactNode } from 'react';
import { useInView } from '../../hooks/useAnimations';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'fadeIn' | 'scaleIn';
  delay?: number;
}

const animationMap = {
  fadeUp: 'animate-[fadeUp_0.6s_cubic-bezier(0.4,0,0.2,1)_both]',
  fadeLeft: 'animate-[fadeLeft_0.6s_cubic-bezier(0.4,0,0.2,1)_both]',
  fadeRight: 'animate-[fadeRight_0.6s_cubic-bezier(0.4,0,0.2,1)_both]',
  fadeIn: 'animate-[fadeIn_0.5s_cubic-bezier(0.4,0,0.2,1)_both]',
  scaleIn: 'animate-[scaleIn_0.5s_cubic-bezier(0.4,0,0.2,1)_both]',
};

const AnimatedSection = ({
  children,
  className = '',
  animation = 'fadeUp',
  delay = 0,
}: AnimatedSectionProps) => {
  const [ref, isInView] = useInView(0.1);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isInView ? animationMap[animation] : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
