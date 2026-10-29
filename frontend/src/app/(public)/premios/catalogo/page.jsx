import CatalogoCanjesContent from "@/components/Premios/CatalogoCanjesContent";

export const metadata = {
  title: "Catálogo Oficial de Premios y Canjes Rappipuntos | RappiGas",
  description:
    "Explora más de 100 premios canjeables con tus puntos RappiGas: electrodomésticos, menaje de cocina, balones gratis y vales de descuento.",
};

export default function CatalogoPremiosPublicoPage() {
  return (
    <div className="catalogo-public-page bg-slate-50 min-h-screen text-xs app-content-scoped font-sans pb-16">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Elevar la página eliminando el exceso de espacio superior */
        .catalogo-public-page {
          padding-top: 84px !important;
        }
        @media (max-width: 767px) {
          .catalogo-public-page {
            padding-top: 68px !important;
          }
        }
        /* Neutralizar márgenes y anchos por defecto de Bootstrap para que Tailwind responda exactamente como en /cliente/canjes */
        .rappigas-catalogo-scope {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }
        .rappigas-catalogo-scope h1 {
          font-size: 1rem !important; /* text-base = 16px */
          line-height: 1.25 !important;
          font-weight: 900 !important;
          margin: 0 !important;
        }
        @media (max-width: 639px) {
          .rappigas-catalogo-scope h1 {
            font-size: 0.875rem !important; /* text-sm = 14px */
          }
        }
        .rappigas-catalogo-scope h3.card-title,
        .rappigas-catalogo-scope .card-title {
          font-size: 0.875rem !important; /* text-sm = 14px */
          line-height: 1.25rem !important;
          font-weight: 900 !important;
          margin: 0 !important;
          color: #03246b !important;
        }
        .rappigas-catalogo-scope p.card-desc,
        .rappigas-catalogo-scope .card-desc {
          font-size: 0.75rem !important; /* text-xs = 12px */
          line-height: 1.15rem !important;
          margin-top: 0.25rem !important;
          margin-bottom: 0 !important;
          color: #64748b !important;
        }
        .rappigas-catalogo-scope p {
          margin: 0 !important;
        }
        .rappigas-catalogo-scope label {
          margin: 0 !important;
        }
        .rappigas-catalogo-scope a {
          text-decoration: none !important;
        }
        .rappigas-catalogo-scope button {
          font-family: inherit !important;
          text-decoration: none !important;
        }
        .rappigas-catalogo-scope button:hover {
          text-decoration: none !important;
        }
        /* Garantizar que el sidebar lateral mantenga w-72 (18rem) frente a Bootstrap */
        @media (min-width: 1024px) {
          .rappigas-catalogo-scope .catalogo-aside-sidebar {
            width: 18rem !important; /* w-72 de Tailwind */
            min-width: 18rem !important;
            max-width: 18rem !important;
            flex-shrink: 0 !important;
          }
        }
        @media (max-width: 1023px) {
          .rappigas-catalogo-scope .catalogo-aside-sidebar {
            width: 100% !important;
          }
        }
        .rappigas-catalogo-scope .catalogo-products-column {
          flex: 1 1 0% !important;
          min-width: 0 !important;
        }
      `,
        }}
      />

      <div className="rappigas-catalogo-scope w-full max-w-[1360px] mx-auto px-3 sm:px-6 pt-1 pb-10">
        <CatalogoCanjesContent modo="publico" />
      </div>
    </div>
  );
}
