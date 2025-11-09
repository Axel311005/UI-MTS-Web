import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export function SeccionEducativa() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
              <BookOpen className="h-12 w-12 text-orange-400" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            EL CHASIS DE UNA MOTO
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
            Es su estructura principal, similar al esqueleto del cuerpo humano,
            que une y soporta todos los demás componentes de la motocicleta. Un
            chasis bien alineado es fundamental para la seguridad, estabilidad y
            rendimiento de tu moto.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
