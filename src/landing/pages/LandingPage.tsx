import { LandingNavbar } from '../components/LandingNavbar';
import { HeroSection } from '../components/HeroSection';
import { SobreTaller } from '../components/SobreTaller';
import { ServicioEstrella } from '../components/ServicioEstrella';
import { ServiciosMantenimiento } from '../components/ServiciosMantenimiento';
import { PerfilCliente } from '../components/PerfilCliente';
import { SeccionEducativa } from '../components/SeccionEducativa';
import { Testimonios } from '../components/Testimonios';
import { Footer } from '../components/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <HeroSection />
      <SobreTaller />
      <ServicioEstrella />
      <ServiciosMantenimiento />
      <PerfilCliente />
      <SeccionEducativa />
      <Testimonios />
      <Footer />
    </div>
  );
}

