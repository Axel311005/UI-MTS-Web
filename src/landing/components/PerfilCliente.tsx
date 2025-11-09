import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function PerfilCliente() {
  const problemas = [
    'Chasis doblado o torcido',
    'Manubrio desalineado',
    'Suspensión afectada',
    'Rodamientos desgastados',
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              IDEAL PARA MOTOS QUE PRESENTAN:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {problemas.map((problema, index) => (
              <motion.div
                key={problema}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center gap-4 border-l-4 border-orange-500"
              >
                <AlertTriangle className="h-8 w-8 text-orange-500 flex-shrink-0" />
                <span className="text-lg font-semibold text-slate-800">{problema}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-12 bg-white rounded-xl p-8 shadow-lg text-center"
          >
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-xl text-slate-700">
              Si tu moto presenta alguno de estos problemas, somos la solución que necesitas
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

