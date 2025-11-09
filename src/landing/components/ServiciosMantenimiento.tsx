import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Wrench, Settings } from 'lucide-react';

export function ServiciosMantenimiento() {
  const mantenimientoMenor = [
    'Cambio de aceite',
    'Limpieza de carburador',
    'Engrase de balineras',
    'Calibración de válvulas',
    'Ajuste de frenos',
    'Revisión de luces',
  ];

  const mantenimientoMayor = [
    'Todo lo del mantenimiento menor',
    'Revisión profunda de suspensión',
    'Kit de cunas del poste',
    'Revisión completa del motor',
    'Cambio de filtros',
    'Revisión de sistema eléctrico',
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Servicios de Mantenimiento
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Mantén tu moto en perfecto estado con nuestros servicios
            profesionales
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="h-full bg-white/95 backdrop-blur-sm border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-black">
                    Mantenimiento Menor
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mantenimientoMenor.map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="h-full bg-white/95 backdrop-blur-sm border border-orange-100 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl shadow">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-black">
                    Mantenimiento Mayor
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mantenimientoMayor.map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-slate-700">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
