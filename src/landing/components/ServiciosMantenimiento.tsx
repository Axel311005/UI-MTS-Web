import { motion } from 'framer-motion';
import { Wrench, Settings } from 'lucide-react';

const serviciosMenor = [
  'Cambio de aceite',
  'Limpieza de carburador',
  'Calibración de válvulas',
  'Ajuste de frenos',
  'Revisión de luces',
  'Lubricación de cadena',
];

const serviciosMayor = [
  'Todo el mantenimiento menor',
  'Revisión profunda de suspensión',
  'Revisión completa del motor',
  'Cambio de filtros',
  'Revisión de sistema eléctrico',
  'Diagnóstico completo',
];

export function ServiciosMantenimiento() {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-orange-50/20 to-white relative overflow-hidden">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-orange-600 mb-3 font-montserrat">
            SERVICIOS
          </p>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 mb-4 sm:mb-5 leading-[1.08] font-title">
            SERVICIOS DE MANTENIMIENTO
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed font-montserrat">
            Mantenimiento profesional para mantener tu moto en perfecto estado
          </p>
        </motion.div>

        {/* Cards Container */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8 w-full">
          {/* Card 1: Mantenimiento Menor */}
          <motion.div
            className="w-full sm:w-auto flex justify-center items-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="service-hover-card service-card-menor">
              <div className="service-card-content">
                <Wrench className="w-10 h-10 mb-3" />
                <h3 className="service-card-title">Mantenimiento Menor</h3>
                <p className="service-card-subtitle">Servicio Básico</p>
              </div>
              <div className="service-card-list">
                {serviciosMenor.map((servicio, index) => (
                  <div key={index} className="service-list-item">
                    {servicio}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 2: Mantenimiento Mayor */}
          <motion.div
            className="w-full sm:w-auto flex justify-center items-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="service-hover-card service-card-mayor">
              <div className="service-card-content">
                <Settings className="w-10 h-10 mb-3" />
                <h3 className="service-card-title">Mantenimiento Mayor</h3>
                <p className="service-card-subtitle">Servicio Completo</p>
              </div>
              <div className="service-card-list">
                {serviciosMayor.map((servicio, index) => (
                  <div key={index} className="service-list-item">
                    {servicio}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        /* Service Hover Card */
        .service-hover-card {
          position: relative;
          width: 100%;
          max-width: 380px;
          min-width: 280px;
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          cursor: pointer;
          overflow: hidden;
        }

        .service-card-menor {
          background: #ffb74d;
        }

        .service-card-mayor {
          background: #ff9800;
        }

        .service-hover-card::before,
        .service-hover-card::after {
          position: absolute;
          content: "";
          width: 20%;
          height: 20%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.5s;
        }

        .service-card-menor::before,
        .service-card-menor::after {
          background-color: #ffd54f;
        }

        .service-card-mayor::before,
        .service-card-mayor::after {
          background-color: #ff8c00;
        }

        .service-hover-card::before {
          top: 0;
          right: 0;
          border-radius: 0 15px 0 100%;
        }

        .service-hover-card::after {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 15px;
        }

        .service-hover-card:hover::before,
        .service-hover-card:hover::after {
          width: 100%;
          height: 100%;
          border-radius: 15px;
          transition: all 0.5s;
        }

        .service-card-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          text-align: center;
          color: white;
          transition: opacity 0.3s;
        }

        .service-hover-card:hover .service-card-content {
          opacity: 0;
        }

        .service-card-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .service-card-subtitle {
          font-size: 0.9rem;
          opacity: 0.95;
        }

        .service-card-list {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1.5rem;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 5;
          color: white;
        }

        .service-hover-card:hover .service-card-list {
          opacity: 1;
        }

        .service-list-item {
          padding: 0.6rem 0;
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          color: #ffffff;
        }

        .service-list-item:last-child {
          border-bottom: none;
        }

        @media (max-width: 640px) {
          .service-hover-card {
            min-height: 260px;
            max-width: 100%;
            min-width: 100%;
          }

          .service-card-content {
            padding: 1.25rem;
          }

          .service-card-title {
            font-size: 1.25rem;
          }

          .service-card-subtitle {
            font-size: 0.8rem;
          }

          .service-card-list {
            padding: 1.25rem;
          }

          .service-list-item {
            font-size: 0.85rem;
            padding: 0.5rem 0;
            font-weight: 700;
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .service-hover-card {
            max-width: 350px;
          }
        }
      `}</style>
    </section>
  );
}
