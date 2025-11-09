import { MapPin, Phone, Clock, Instagram } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Información del taller */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-orange-400">
              MST MOTO SERVICIOS TERRY
            </h3>
            <p className="text-slate-300 mb-4">¡TU MOTO COMO NUEVA!</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-orange-400" />
                <span className="text-slate-300">
                  Talleres modernos 1 c norte 1 c oeste
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-orange-400" />
                <a
                  href="https://wa.me/50584809632"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  +505 84809632
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-400" />
                <span className="text-slate-300">
                  Lunes a sábado | 8:00 a.m. - 5:00 p.m.
                </span>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  to="/cotizacion"
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Cotización
                </Link>
              </li>
              <li>
                <Link
                  to="/cita"
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Agendar Cita
                </Link>
              </li>
              <li>
                <Link
                  to="/seguimiento"
                  className="text-slate-300 hover:text-orange-400 transition-colors"
                >
                  Seguimiento
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Síguenos</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/TallerTerry"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-800 rounded-full hover:bg-orange-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://wa.me/50584809632"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-slate-800 rounded-full hover:bg-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} MST Moto Servicios Terry – Todos los derechos
              reservados
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                to="/privacidad"
                className="text-slate-400 hover:text-orange-400 transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                to="/terminos"
                className="text-slate-400 hover:text-orange-400 transition-colors"
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
