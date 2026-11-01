import SectionTitle from "./SectionTitle";
import HomePricingCard from "./HomePricingCard";

const HomeCatalogoPrecios = () => {
    return (
        <div className="pricing sp" id="productos">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 m-auto text-center">
                <div className="heading1">
                    <SectionTitle
                        SubTitle="Catálogo Oficial de Gas de Cocina"
                        Title="Precios Transparentes con Delivery Gratis y Balanza Digital"
                    ></SectionTitle>
                </div>
              </div>
            </div>

            <div className="space30"></div>
            <div className="row">

            <HomePricingCard
                addClass="single-pricing-box"
                popularTitle="Económico Tradicional"
                title="Balón 10kg Rosca Tradicional"
                price="S/ 45"
                monthly="balón"
                content="Gas de cocina 10kg con válvula de rosca estándar universal. Pesaje verificado con balanza digital en puerta."
                featuretitle="Incluye de cortesía:"
                featurelist={[ 
                    'Instalación y verificación de seguridad',
                    'Pesaje en balanza digital en tu puerta',
                    'Delivery 100% gratis en 25 a 35 min',
                    'Acumula puntos para canjear premios',
                ]} 
                btnname="Pedir Balón Ahora"
                btnUrl="/pedir-gas"
            ></HomePricingCard>

            <HomePricingCard
                addClass="single-pricing-box active"
                popularTitle="El Más Pedido"
                title="Balón 10kg Premium (Click-On)"
                price="S/ 48"
                monthly="balón"
                content="Gas de cocina 10kg con válvula Premium de acople rápido Click-On. Máxima seguridad antifuga para tu hogar."
                featuretitle="Incluye de cortesía:"
                featurelist={[ 
                    'Válvula de acople rápido Click-On',
                    'Instalación de cortesía sin costo',
                    'Pesaje en balanza digital frente a ti',
                    'Delivery gratis y acumula puntos',
                ]} 
                btnname="Pedir Balón Ahora"
                btnUrl="/pedir-gas"
            ></HomePricingCard>            

            <HomePricingCard
                addClass="single-pricing-box"
                popularTitle="Ideal Negocios & Familias"
                title="Balón Comercial 15kg Gas de Cocina"
                price="S/ 72"
                monthly="balón"
                content="Gas de cocina de alto rendimiento para pollerías, chifas, panaderías, restaurantes y hogares con alta demanda."
                featuretitle="Incluye de cortesía:"
                featurelist={[ 
                    'Despacho express prioritario en < 35 min',
                    'Pesaje verificado con balanza en puerta',
                    'Boleta o factura electrónica inmediata',
                    'Pago contraentrega: Yape, Plin, POS o efectivo',
                ]} 
                btnname="Pedir Balón Ahora"
                btnUrl="/pedir-gas"
            ></HomePricingCard> 

            </div>
          </div>
        </div>
    );
};

export default HomeCatalogoPrecios;
