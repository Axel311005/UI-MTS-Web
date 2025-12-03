import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Wrench, TrendingDown } from 'lucide-react';
import { useState } from 'react';

const problemas = [
  {
    icon: AlertTriangle,
    text: 'Chasis doblado o torcido',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
  },
  {
    icon: Wrench,
    text: 'Manubrio desalineado',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: TrendingDown,
    text: 'Suspensión afectada',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    icon: AlertTriangle,
    text: 'Rodamientos desgastados',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
  },
];

export function PerfilCliente() {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleCardClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else {
      setCurrentProblemIndex((prev) => (prev + 1) % problemas.length);
      setIsOpen(false);
    }
  };

  const currentProblem = problemas[currentProblemIndex];
  const Icon = currentProblem.icon;

  return (
    <section className="py-20 bg-gradient-to-b from-white via-orange-50/20 to-white">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-neutral-900 mb-4 font-title">
              Ideal para Motos que Presentan
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto font-montserrat">
              Identificamos y solucionamos los problemas más comunes en tu moto
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center items-center mb-12 sm:mb-16"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProblemIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`book-card-single ${isOpen ? 'book-open' : ''}`}
                onClick={handleCardClick}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleCardClick();
                }}
              >
                <p
                  className={`book-text-single ${
                    isOpen ? 'book-text-visible' : ''
                  }`}
                >
                  {currentProblem.text}
                </p>
                <div className="book-cover-single">
                  <div className="book-cover-content-single">
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-3" />
                    <p className="book-text-single">Click Me</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="flex justify-center"
          >
            <div className="text-only-card">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600 mb-3" />
              <p className="text-only-card-text font-montserrat">
                Si tu moto presenta alguno de estos problemas, somos la solución
                que necesitas
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .book-card-single {
          position: relative;
          border-radius: 10px;
          width: 220px;
          height: 300px;
          background: linear-gradient(135deg, #ff8c00 0%, #ff9500 50%, #ffa500 100%);
          -webkit-box-shadow: 1px 1px 12px #000;
          box-shadow: 1px 1px 12px #000;
          -webkit-transform: preserve-3d;
          -ms-transform: preserve-3d;
          transform: preserve-3d;
          -webkit-perspective: 2000px;
          perspective: 2000px;
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          margin: 0 auto;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .book-card-single > p.book-text-single {
          z-index: 1;
          position: relative;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .book-card-single:hover > p.book-text-single,
        .book-card-single.book-open > p.book-text-single,
        .book-text-visible {
          opacity: 1;
        }

        .book-cover-single {
          top: 0;
          position: absolute;
          background: linear-gradient(135deg, #ff8c00 0%, #ff9500 50%, #ffa500 100%);
          width: 100%;
          height: 100%;
          border-radius: 10px;
          cursor: pointer;
          -webkit-transition: all 0.5s;
          transition: all 0.5s;
          -webkit-transform-origin: 0;
          -ms-transform-origin: 0;
          transform-origin: 0;
          -webkit-box-shadow: 1px 1px 12px #000;
          box-shadow: 1px 1px 12px #000;
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-align: center;
          -ms-flex-align: center;
          align-items: center;
          -webkit-box-pack: center;
          -ms-flex-pack: center;
          justify-content: center;
        }

        .book-cover-content-single {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .book-card-single:hover .book-cover-single,
        .book-card-single.book-open .book-cover-single {
          -webkit-transition: all 0.5s;
          transition: all 0.5s;
          -webkit-transform: rotatey(-80deg);
          -ms-transform: rotatey(-80deg);
          transform: rotatey(-80deg);
        }

        .book-text-single {
          font-size: 22px;
          font-weight: 900;
          text-align: center;
          padding: 1rem;
          font-family: 'Montserrat', sans-serif;
          text-shadow: 0 3px 8px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 0, 0, 0.4);
          color: #fff;
          letter-spacing: 0.5px;
          line-height: 1.4;
        }

        /* Text Only Card */
        .text-only-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 1rem;
        }

        .text-only-card-text {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.6;
          color: #374151;
          max-width: 600px;
        }

        @media (max-width: 640px) {
          .book-card-single {
            width: 180px;
            height: 250px;
          }

          .book-text-single {
            font-size: 18px;
            font-weight: 900;
          }

          .text-only-card {
            padding: 0.75rem;
          }

          .text-only-card-text {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
