import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title = 'MTS - Servicio Profesional de Alineación de Chasis para Motos',
  description = 'Especialistas en alineación de chasis, mantenimiento profesional y reparación de motos. Tecnología hidráulica de precisión, electromecánica, escaneado eléctrico y overhaul. Servicio premium con seguimiento en tiempo real.',
  image = '/Moto Hero.png',
  url,
  type = 'website',
}: SEOProps) {
  useEffect(() => {
    // Obtener URL base de forma segura
    const baseUrl =
      url ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'https://mts.com');
    // Actualizar título
    document.title = title;

    // Función helper para actualizar o crear meta tags
    const setMetaTag = (
      name: string,
      content: string,
      attribute: string = 'name'
    ) => {
      let element = document.querySelector(
        `meta[${attribute}="${name}"]`
      ) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta description
    setMetaTag('description', description);

    // Open Graph tags
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', description, 'property');
    setMetaTag('og:image', `${baseUrl}${image}`, 'property');
    setMetaTag('og:url', baseUrl, 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:site_name', 'MTS - Taller de Motos', 'property');
    setMetaTag('og:locale', 'es_ES', 'property');

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', `${baseUrl}${image}`);

    // Canonical URL - usar la URL completa de la página actual
    const currentUrl =
      typeof window !== 'undefined' ? window.location.href : baseUrl;
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Structured Data (JSON-LD) - LocalBusiness
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'AutoRepair',
      name: 'MTS - Taller de Motos',
      description: description,
      image: `${baseUrl}${image}`,
      url: baseUrl,
      telephone: '+505-XXXX-XXXX', // Actualizar con teléfono real
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'NI',
        addressLocality: 'Nicaragua',
      },
      priceRange: '$$',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
          opens: '08:00',
          closes: '18:00',
        },
      ],
      areaServed: {
        '@type': 'Country',
        name: 'Nicaragua',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios de Taller de Motos',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Alineación de Chasis',
              description:
                'Tecnología hidráulica de precisión para recuperar la geometría original',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Electromecánica',
              description:
                'Diagnóstico y reparación del sistema eléctrico y mecánico interconectados',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Escaneado y Reparación Eléctrica',
              description:
                'Diagnóstico, revisión y reparación del sistema eléctrico',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Overhaul',
              description:
                'Desmontaje completo, limpieza, análisis, rectificación y reparación',
            },
          },
        ],
      },
    };

    // Remover structured data anterior si existe
    const existingScript = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Agregar nuevo structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, [title, description, image, url, type]);

  return null;
}
