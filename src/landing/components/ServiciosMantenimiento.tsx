import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Wrench, Settings } from "lucide-react";

export function ServiciosMantenimiento() {
  const mantenimientoMenor = [
    "Cambio de aceite",
    "Limpieza de carburador",
    "Engrase de balineras",
    "Calibración de válvulas",
    "Ajuste de frenos",
    "Revisión de luces",
  ];

  const mantenimientoMayor = [
    "Todo lo del mantenimiento menor",
    "Revisión profunda de suspensión",
    "Kit de cunas del poste",
    "Revisión completa del motor",
    "Cambio de filtros",
    "Revisión de sistema eléctrico",
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-orange-50/10 to-white">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 font-montserrat">
            Servicios de Mantenimiento
          </h2>
          <p className="text-xl text-black/70 max-w-2xl mx-auto font-montserrat">
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
            whileHover={{ y: -5 }}
          >
            <Card className="h-full bg-white border-2 border-orange-500/30 shadow-xl hover:shadow-2xl hover:border-orange-500 transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500"></div>
              <CardHeader className="bg-gradient-to-br from-white to-orange-50/30 pb-6 pt-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <Wrench className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl text-black font-bold font-montserrat">
                    Mantenimiento Menor
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-4">
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
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <span className="text-black/80 font-montserrat text-base">
                        {item}
                      </span>
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
            whileHover={{ y: -5 }}
          >
            <Card className="h-full bg-white border-2 border-orange-500/30 shadow-xl hover:shadow-2xl hover:border-orange-500 transition-all duration-300 rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500"></div>
              <CardHeader className="bg-gradient-to-br from-white to-orange-50/30 pb-6 pt-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <Settings className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl text-black font-bold font-montserrat">
                    Mantenimiento Mayor
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-4">
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
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <span className="text-black/80 font-montserrat text-base">
                        {item}
                      </span>
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
