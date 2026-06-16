import AnimatedSection from '../components/ui/AnimatedSection';

const About = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AnimatedSection animation="scaleIn">
        <div className="text-center">
          <span className="material-symbols-outlined text-8xl text-primary/30 mb-6 block animate-[pulse_2s_ease-in-out_infinite]">info</span>
          <h1 className="font-headline text-headline-lg text-on-surface mb-4">À propos</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Mikaly — L'art de la table, réinventé. Découvrez notre histoire et notre passion pour la gastronomie.
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default About;
