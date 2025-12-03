import { motion } from 'framer-motion';
import { HiLocationMarker, HiPhone, HiClock } from 'react-icons/hi';
import { FaTiktok } from 'react-icons/fa';

export function SobreTaller() {
  const infoItems = [
    {
      icon: HiLocationMarker,
      title: 'Dirección',
      content: ['Barrio Riguero, Talleres Modernos', '1c n, 1 c abajo'],
      link: 'https://maps.app.goo.gl/riLpecd1xVPSbVBw6',
      isClickable: true,
    },
    {
      icon: HiPhone,
      title: 'WhatsApp',
      content: ['+505 84809632'],
      link: 'https://wa.me/50584809632',
      isClickable: true,
    },
    {
      icon: HiClock,
      title: 'Horario',
      content: ['Lunes a sábado | 8:00 a.m.', '- 5:00 p.m.'],
      isClickable: false,
    },
    {
      icon: FaTiktok,
      title: 'Redes Sociales',
      content: ['@taller.terry'],
      link: 'https://www.tiktok.com/@taller.terry',
      isClickable: true,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-orange-50/30 to-white">
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
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4 font-title">
            MST MOTO SERVICIOS TERRY
          </h2>
          <p className="text-xl text-orange-600 font-semibold font-montserrat">
            ¡TU MOTO COMO NUEVA!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            const CardContent = (
              <div
                className={`contact-card relative bg-white rounded-[10px] p-6 sm:p-8 md:p-10 overflow-hidden border-2 border-gray-200 shadow-[0px_2px_10px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col items-center justify-center cursor-pointer min-h-[220px] sm:min-h-[240px] md:min-h-[260px] w-full max-w-[320px] mx-auto ${
                  item.isClickable
                    ? 'hover:border-orange-500/60 hover:shadow-xl'
                    : ''
                }`}
              >
                {/* Icon Container con efecto animado */}
                <div className="contact-icon-wrapper mb-4 sm:mb-5 md:mb-6">
                  <div
                    className="contact-icon w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-800 ease-in-out relative overflow-hidden"
                    style={{
                      background: `linear-gradient(90deg, #f97316 0%, #f97316 20%, #ea580c 50%, #ea580c 70%, rgba(0, 0, 0, 0.05) 80%, rgba(0, 0, 0, 0.1) 100%)`,
                      backgroundPosition: '0px',
                      backgroundSize: '300px',
                    }}
                  >
                    <Icon
                      className="contact-icon-svg w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 relative z-10"
                      style={{ color: 'white', fill: 'currentColor' }}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="contact-title w-full text-center mt-0 mb-3 sm:mb-4 text-neutral-900 font-semibold uppercase tracking-[3px] sm:tracking-[4px] text-sm sm:text-base md:text-lg">
                  {item.title}
                </h3>

                {/* Content que aparece en hover */}
                <div className="contact-text w-[90%] mx-auto text-xs sm:text-sm md:text-base text-center mt-3 sm:mt-4 text-neutral-600 font-light tracking-[1px] sm:tracking-[2px] opacity-0 max-h-0 transition-all duration-300 ease-in-out leading-relaxed">
                  {item.content.map((line, lineIndex) => (
                    <div key={lineIndex} className="mb-1">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            );

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
              >
                {item.isClickable && item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {CardContent}
                  </a>
                ) : (
                  CardContent
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
