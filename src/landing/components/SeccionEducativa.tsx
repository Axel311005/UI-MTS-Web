import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export function SeccionEducativa() {
  return (
    <section className="py-20 bg-gradient-to-b from-white via-black to-black text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="p-4 bg-orange-500 rounded-full shadow-lg">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 font-montserrat"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            EL CHASIS DE UNA MOTO
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl text-white/80 leading-relaxed font-montserrat"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Es su estructura principal, similar al esqueleto del cuerpo humano,
            que une y soporta todos los demás componentes de la motocicleta. Un
            chasis bien alineado es fundamental para la seguridad, estabilidad y
            rendimiento de tu moto.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
