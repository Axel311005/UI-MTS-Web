import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Instagram } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

export function SobreTaller() {
  const infoItems = [
    {
      icon: MapPin,
      title: 'Dirección',
      content: 'Talleres modernos 1 c norte 1 c oeste',
    },
    {
      icon: Phone,
      title: 'WhatsApp',
      content: '+505 84809632',
      link: 'https://wa.me/50584809632',
    },
    {
      icon: Clock,
      title: 'Horario',
      content: 'Lunes a sábado | 8:00 a.m. - 5:00 p.m.',
    },
    {
      icon: Instagram,
      title: 'Redes Sociales',
      content: '@TallerTerry',
      link: 'https://instagram.com/TallerTerry',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            MST MOTO SERVICIOS TERRY
          </h2>
          <p className="text-2xl text-orange-500 font-semibold">
            ¡TU MOTO COMO NUEVA!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="h-full bg-white/95 backdrop-blur-sm border border-orange-100 shadow-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full shadow">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-800">
                      {item.title}
                    </h3>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        {item.content}
                      </a>
                    ) : (
                      <p className="text-slate-600">{item.content}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
