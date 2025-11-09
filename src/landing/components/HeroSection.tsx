import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Calendar, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLandingAuthStore } from '../store/landing-auth.store';

export function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useLandingAuthStore();

  const handleCita = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cita');
    } else {
      navigate('/cita');
    }
  };

  const handleCotizacion = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cotizacion');
    } else {
      navigate('/cotizacion');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Background overlay con efecto de moto */}
      <div className="absolute inset-0 bg-[url('/hero-image.jfif')] bg-cover bg-center opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent"></div>

      {/* Floating particles - reducido */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-orange-400/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
          >
            <Sparkles className="h-12 w-12 text-orange-400 animate-pulse" />
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            ¡TU MOTO COMO{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-400 to-orange-400">
            NUEVA!
          </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Especialistas en alineación de chasis y mantenimiento profesional
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 via-orange-600 to-pink-500 hover:from-orange-600 hover:via-orange-700 hover:to-pink-600 text-white text-lg px-10 py-7 rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 group"
                onClick={handleCita}
              >
                <span className="flex items-center">
                  <Calendar className="mr-3 h-6 w-6" />
                  Agenda tu revisión hoy mismo
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>

            <div>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 text-lg px-10 py-7 rounded-2xl backdrop-blur-md transition-all duration-300 group shadow-lg hover:shadow-xl"
                onClick={handleCotizacion}
              >
                <DollarSign className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                Cotiza en línea
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-12 border-2 border-white/40 rounded-full flex justify-center backdrop-blur-sm bg-white/10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-2 h-3 bg-white/70 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
