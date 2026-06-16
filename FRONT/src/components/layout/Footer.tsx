import AnimatedSection from '../ui/AnimatedSection';

const Footer = () => {
  return (
    <footer className="w-full py-8 px-margin-desktop bg-surface-container-lowest border-t border-outline-variant/20 mt-auto">
      <AnimatedSection animation="fadeUp">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-headline text-headline-sm font-bold text-on-surface transition-[transform] duration-200 ease-out hover:scale-105">
            Mikaly
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-[color] duration-200 ease-out">Product</a>
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-[color] duration-200 ease-out">Pricing</a>
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-[color] duration-200 ease-out">Privacy Policy</a>
            <a href="#" className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-[color] duration-200 ease-out">Contact Support</a>
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">© 2025 Mikaly. Tous droits réservés.</div>
        </div>
      </AnimatedSection>
    </footer>
  );
};

export default Footer;
