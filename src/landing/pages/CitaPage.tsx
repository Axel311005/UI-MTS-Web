import { motion } from 'framer-motion';
import { CitaForm } from '../components/CitaForm';
import { LandingNavbar } from '../components/LandingNavbar';

export default function CitaPage() {

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
                Agenda tu Cita
              </h1>
              <p className="text-xl text-white/70 font-montserrat">
                Programa una revisión para tu moto
              </p>
            </motion.div>
            <CitaForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

