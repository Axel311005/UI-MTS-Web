import { motion } from 'framer-motion';
import { Settings2 } from 'lucide-react';

export function SeccionEducativa() {
  return (
    <section className="py-20 sm:py-24 md:py-28 bg-gradient-to-b from-white via-orange-50/30 to-white text-black relative overflow-hidden">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              className="inline-flex items-center justify-center mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30"></div>
                <div className="relative p-5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-xl">
                  <Settings2 className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 font-title text-neutral-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              EL CHASIS DE UNA MOTO
            </motion.h2>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-neutral-700 leading-relaxed font-montserrat max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Es su estructura principal, similar al esqueleto del cuerpo
              humano, que une y soporta todos los demás componentes de la
              motocicleta. Un chasis bien alineado es fundamental para la
              seguridad, estabilidad y rendimiento de tu moto.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
