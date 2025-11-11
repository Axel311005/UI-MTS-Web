import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle } from "lucide-react";

export function PerfilCliente() {
  const problemas = [
    "Chasis doblado o torcido",
    "Manubrio desalineado",
    "Suspensión afectada",
    "Rodamientos desgastados",
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-orange-50/10 to-white">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 font-montserrat">
              Ideal para Motos que Presentan
            </h2>
            <p className="text-xl text-black/70 max-w-2xl mx-auto font-montserrat">
              Identificamos y solucionamos los problemas más comunes en tu moto
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {problemas.map((problema, index) => (
              <motion.div
                key={problema}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white border-2 border-orange-500/30 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-orange-500 transition-all duration-300 flex items-center gap-4"
              >
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <span className="text-lg font-semibold text-black font-montserrat">
                  {problema}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="bg-white border-2 border-orange-500/30 rounded-2xl p-8 shadow-xl text-center hover:shadow-2xl hover:border-orange-500 transition-all duration-300"
          >
            <div className="inline-block p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <p className="text-xl md:text-2xl text-black font-semibold font-montserrat leading-relaxed">
              Si tu moto presenta alguno de estos problemas, somos la solución
              que necesitas
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
