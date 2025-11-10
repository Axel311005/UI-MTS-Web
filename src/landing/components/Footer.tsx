import { MapPin, Phone, Clock } from "lucide-react";
import { Link } from "react-router";
import { motion } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-12 xl:px-20 max-w-[min(100vw,1760px)] py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Información del taller */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4 text-orange-500 font-montserrat">
              MST MOTO SERVICIOS TERRY
            </h3>
            <p className="text-white/70 mb-4 font-montserrat">
              ¡TU MOTO COMO NUEVA!
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-orange-500" />
                <span className="text-white/70 font-montserrat">
                  Barrio Riguero, Talleres Modernos 1c n, 1 c abajo
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-orange-500" />
                <a
                  href="https://wa.me/50584809632"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-orange-500 transition-colors font-montserrat"
                >
                  +505 84809632
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-white/70 font-montserrat">
                  Lunes a sábado | 8:00 a.m. - 5:00 p.m.
                </span>
              </div>
            </div>
          </motion.div>

          {/* Enlaces rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold mb-4 font-montserrat">
              Enlaces Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-white/70 hover:text-orange-500 transition-colors font-montserrat"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/cotizacion"
                  className="text-white/70 hover:text-orange-500 transition-colors font-montserrat"
                >
                  Cotización
                </Link>
              </li>
              <li>
                <Link
                  to="/cita"
                  className="text-white/70 hover:text-orange-500 transition-colors font-montserrat"
                >
                  Agendar Cita
                </Link>
              </li>
              <li>
                <Link
                  to="/seguimiento"
                  className="text-white/70 hover:text-orange-500 transition-colors font-montserrat"
                >
                  Seguimiento
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Mapa y Redes sociales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-xl font-semibold mb-4 font-montserrat">
                Ubicación
              </h3>
              <div className="rounded-lg overflow-hidden shadow-lg border-2 border-orange-500/20">
                <div className="relative w-full h-48 bg-black/20 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.1234567890!2d-86.25123456789012!3d12.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA3JzI0LjQiTiA4NsKwMTUnMDQuNCJX!5e0!3m2!1ses!2sni!4v1234567890123!5m2!1ses!2sni&q=Barrio+Riguero,+Talleres+Modernos"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación de MTS Moto Servicios Terry - Barrio Riguero"
                    className="absolute inset-0"
                  ></iframe>
                </div>
                <div className="p-3 bg-black/50">
                  <a
                    href="https://maps.app.goo.gl/riLpecd1xVPSbVBw6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-400 transition-colors font-montserrat text-sm font-semibold flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 font-montserrat">
                Síguenos
              </h3>
              <div className="flex gap-4">
                <motion.a
                  href="https://www.tiktok.com/@taller.terry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 rounded-full hover:bg-orange-500 transition-colors"
                  aria-label="TikTok"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </motion.a>
                <motion.a
                  href="https://wa.me/50584809632"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/10 rounded-full hover:bg-green-500 transition-colors"
                  aria-label="WhatsApp"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Phone className="h-6 w-6" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm font-montserrat">
              © {currentYear} MST Moto Servicios Terry – Todos los derechos
              reservados
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                to="/privacidad"
                className="text-white/50 hover:text-orange-500 transition-colors font-montserrat"
              >
                Política de Privacidad
              </Link>
              <Link
                to="/terminos"
                className="text-white/50 hover:text-orange-500 transition-colors font-montserrat"
              >
                Términos de Servicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
