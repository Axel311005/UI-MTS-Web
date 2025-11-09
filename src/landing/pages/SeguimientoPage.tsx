import { motion } from 'framer-motion';
import { SeguimientoForm } from '../components/SeguimientoForm';
import { LandingNavbar } from '../components/LandingNavbar';

export function SeguimientoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-white">
      <LandingNavbar />
      <div className="pt-32 pb-12">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-montserrat">
                Seguimiento de Servicio
              </h1>
              <p className="text-xl text-white/70 font-montserrat">
                Consulta el estado de tu moto en servicio
              </p>
            </motion.div>
            <SeguimientoForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

