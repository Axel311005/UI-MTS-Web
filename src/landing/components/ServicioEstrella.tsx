import { motion } from 'framer-motion';
import { Wrench, CheckCircle, Shield, Zap, Image } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

export function ServicioEstrella() {
  const caracteristicas = [
    {
      icon: Wrench,
      title: 'Tecnología hidráulica de precisión',
      description: 'Equipos profesionales para alineación perfecta',
      imagePlaceholder: '/placeholder-tecnologia.jpg',
    },
    {
      icon: CheckCircle,
      title: 'Personal capacitado',
      description: 'Técnicos especializados en chasis de motos',
      imagePlaceholder: '/placeholder-personal.jpg',
    },
    {
      icon: Shield,
      title: 'Diagnóstico profesional',
      description: 'Análisis detallado del estado de tu moto',
      imagePlaceholder: '/placeholder-diagnostico.jpg',
    },
    {
      icon: Zap,
      title: 'Resultados garantizados',
      description: 'Tu moto recuperará su geometría original',
      imagePlaceholder: '/placeholder-resultados.jpg',
    },
  ];

  const beneficios = [
    'Alinear ejes delantero y trasero',
    'Corregir desviaciones del chasis',
    'Recuperar la geometría original de fábrica',
    'Mejorar estabilidad y seguridad',
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-orange-50/30 to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            ¿TU MOTO SUFRIÓ UN ACCIDENTE?
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 max-w-3xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Si notas que tu moto se siente inestable, el manubrio quedó torcido
            o el chasis parece doblado, ¡tenemos la solución profesional que
            necesitas!
          </motion.p>
          <motion.div
            className="inline-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              SERVICIO DE ALINEACIÓN DE CHASIS POR CHOQUE
            </span>
            <div className="mt-2 text-sm text-slate-500 font-medium">
              CON TECNOLOGÍA HIDRÁULICA PROFESIONAL
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {caracteristicas.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <Card className="h-full bg-white/80 backdrop-blur-md border-2 border-orange-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group relative">
                  {/* Image placeholder with opacity */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent z-10"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                      <Image className="h-24 w-24 text-orange-300" />
                    </div>
                    <div className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4 relative z-20">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <motion.h3
                      className="font-bold text-slate-800 text-center text-lg"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.3 }}
                    >
                      {item.title}
                    </motion.h3>
                    <motion.p
                      className="text-slate-600 text-center text-sm"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.4 }}
                    >
                      {item.description}
                    </motion.p>
                  </CardContent>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-pink-500/0 group-hover:from-orange-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-orange-100 max-w-4xl mx-auto"
        >
          <motion.h3
            className="text-3xl font-bold text-slate-900 mb-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Beneficios
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {beneficios.map((beneficio, index) => (
              <motion.div
                key={beneficio}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <CheckCircle className="h-7 w-7 text-green-500 flex-shrink-0" />
                <span className="text-slate-700 font-medium text-lg">{beneficio}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
