import { motion } from 'framer-motion';
import { CitaForm } from '../components/CitaForm';
import { LandingNavbar } from '../components/LandingNavbar';

export default function CitaPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <LandingNavbar />
      <div className="pt-16 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CitaForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

