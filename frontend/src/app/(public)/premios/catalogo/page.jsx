import CatalogoCanjesContent from "@/components/Premios/CatalogoCanjesContent";

export const metadata = {
  title: "Catálogo Oficial de Premios y Canjes Rappipuntos | RappiGas",
  description:
    "Explora más de 100 premios canjeables con tus puntos RappiGas: electrodomésticos, menaje de cocina, balones gratis y vales de descuento con delivery gratis.",
};

export default function CatalogoPremiosPublicoPage() {
  return (
    <div className="catalogo-public-page bg-slate-50 min-h-screen text-xs app-content-scoped font-sans pb-16">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Espaciado superior para que el menu superior nunca lo tape */
        .catalogo-public-page {
          padding-top: 125px !important;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          font-size: 0.75rem !important;
          line-height: 1rem !important;
        }
        @media (max-width: 767px) {
          .catalogo-public-page {
            padding-top: 80px !important;
          }
        }

        /* Disposición desktop: columnas horizontales y sidebar sticky */
        @media (min-width: 1024px) {
          .catalogo-public-page .catalogo-canjes-root > .flex {
            flex-direction: row !important;
            align-items: flex-start !important;
          }
          .catalogo-public-page .catalogo-aside-sidebar {
            width: 18rem !important;
            min-width: 18rem !important;
            max-width: 18rem !important;
            flex-shrink: 0 !important;
            position: sticky !important;
            top: 145px !important;
          }
          .catalogo-public-page .catalogo-products-column {
            flex: 1 1 0% !important;
            min-width: 0 !important;
            width: auto !important;
            max-width: 100% !important;
          }
        }
        @media (max-width: 1023px) {
          .catalogo-public-page .catalogo-aside-sidebar {
            width: 100% !important;
          }
          .catalogo-public-page .catalogo-products-column {
            width: 100% !important;
          }
        }

        /* Grilla de productos */
        .catalogo-public-page .grid {
          display: grid !important;
        }

        /* Tipografía y márgenes limpios en tarjetas */
        .catalogo-public-page h1 {
          font-size: 1rem !important;
          line-height: 1.25 !important;
          font-weight: 900 !important;
          margin: 0 !important;
          font-family: inherit !important;
          letter-spacing: normal !important;
        }
        @media (max-width: 639px) {
          .catalogo-public-page h1 {
            font-size: 0.875rem !important;
          }
        }

        .catalogo-public-page .card-title,
        .catalogo-public-page h3.card-title {
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
          font-weight: 900 !important;
          margin: 0 !important;
          color: #03246b !important;
          font-family: inherit !important;
          letter-spacing: normal !important;
        }

        .catalogo-public-page .card-desc,
        .catalogo-public-page p.card-desc {
          font-size: 0.75rem !important;
          line-height: 1.15rem !important;
          margin-top: 0.25rem !important;
          margin-bottom: 0 !important;
          color: #64748b !important;
          font-family: inherit !important;
        }

        .catalogo-public-page p,
        .catalogo-public-page label {
          margin: 0 !important;
        }

        .catalogo-public-page a {
          text-decoration: none !important;
        }

        .catalogo-public-page button {
          font-family: inherit !important;
          text-decoration: none !important;
        }
        .catalogo-public-page button:hover {
          text-decoration: none !important;
        }

        /* Imágenes del catálogo */
        .catalogo-public-page .catalogo-product-card img {
          max-height: 100% !important;
          max-width: 100% !important;
          object-fit: contain !important;
        }
      `,
        }}
      />

      <div className="w-full max-w-[1320px] mx-auto px-3 sm:px-4">
        <CatalogoCanjesContent modo="publico" />
      </div>
    </div>
  );
}
