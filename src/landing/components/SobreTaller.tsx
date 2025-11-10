import { motion } from "framer-motion";
import { MapPin, Phone, Clock } from "lucide-react";

export function SobreTaller() {
  const infoItems = [
    {
      icon: MapPin,
      title: "Dirección",
      content: ["Barrio Riguero, Talleres Modernos", "1c n, 1 c abajo"],
      isLink: false,
    },
    {
      icon: Phone,
      title: "WhatsApp",
      content: ["+505 84809632"],
      link: "https://wa.me/50584809632",
      isLink: true,
    },
    {
      icon: Clock,
      title: "Horario",
      content: ["Lunes a sábado | 8:00 a.m.", "- 5:00 p.m."],
      isLink: false,
    },
    {
      icon: Phone, // Placeholder, se reemplazará con SVG en el render
      title: "Redes Sociales",
      content: ["@taller.terry"],
      link: "https://www.tiktok.com/@taller.terry",
      isLink: true,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50/20">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm uppercase tracking-wider text-orange-500 mb-4 font-montserrat font-semibold"
          ></motion.p>
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 font-montserrat">
            MST MOTO SERVICIOS TERRY
          </h2>
          <p className="text-xl text-orange-500 font-semibold font-montserrat">
            ¡TU MOTO COMO NUEVA!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            const isTikTok = item.title === "Redes Sociales";
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <div className="h-full bg-white border-2 border-orange-500/20 rounded-xl p-6 hover:border-orange-500/50 hover:shadow-xl transition-all duration-300 shadow-lg">
                  {/* Icon Container */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      {isTikTok ? (
                        <svg
                          className="h-8 w-8 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                      ) : (
                        <Icon className="h-8 w-8 text-white" strokeWidth={2} />
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-black text-lg mb-4 text-center font-montserrat">
                    {item.title}
                  </h3>

                  {/* Content */}
                  <div className="space-y-1">
                    {item.content.map((line, lineIndex) => (
                      <div key={lineIndex} className="text-center">
                        {item.isLink && item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 transition-colors font-montserrat text-sm md:text-base font-semibold"
                          >
                            {line}
                          </a>
                        ) : (
                          <p className="text-black/70 font-montserrat text-sm md:text-base">
                            {line}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
