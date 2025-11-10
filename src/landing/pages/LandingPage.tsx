import { lazy, Suspense } from 'react';
import { LandingNavbar } from '../components/LandingNavbar';
import { HeroSection } from '../components/HeroSection';
import { SEO } from '../components/SEO';

// Lazy load components que no están en pantalla inicial
const SobreTaller = lazy(() =>
  import('../components/SobreTaller').then((m) => ({ default: m.SobreTaller }))
);
const ServicioEstrella = lazy(() =>
  import('../components/ServicioEstrella').then((m) => ({
    default: m.ServicioEstrella,
  }))
);
const ServiciosMantenimiento = lazy(() =>
  import('../components/ServiciosMantenimiento').then((m) => ({
    default: m.ServiciosMantenimiento,
  }))
);
const PerfilCliente = lazy(() =>
  import('../components/PerfilCliente').then((m) => ({
    default: m.PerfilCliente,
  }))
);
const SeccionEducativa = lazy(() =>
  import('../components/SeccionEducativa').then((m) => ({
    default: m.SeccionEducativa,
  }))
);
const Testimonios = lazy(() =>
  import('../components/Testimonios').then((m) => ({ default: m.Testimonios }))
);
const Footer = lazy(() =>
  import('../components/Footer').then((m) => ({ default: m.Footer }))
);

// Loading fallback
const SectionLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="animate-pulse text-white/50 font-montserrat">
      Cargando...
    </div>
  </div>
);

export function LandingPage() {
  return (
    <>
      <SEO />
      <div className="min-h-screen bg-white">
        <LandingNavbar />
        <HeroSection />
        <Suspense fallback={<SectionLoader />}>
          <SobreTaller />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ServicioEstrella />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ServiciosMantenimiento />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <PerfilCliente />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <SeccionEducativa />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Testimonios />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Footer />
        </Suspense>
      </div>
    </>
  );
}
