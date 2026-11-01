import Link from 'next/link';
import data from './choose1.json';

const HomeComoFunciona = () => {
    const mainContent = {
        subTitle: 'Delivery Express en 3 Pasos',
        title: 'Tu Balón de Gas de Cocina en Casa en Menos de 35 Minutos',
        Content: 'Despacho express asignado a la distribuidora autorizada más cercana a tu puerta, con pesaje verificado en balanza digital y delivery 100% gratis.',
        btnName: 'Pedir Balón de Gas',
        btnUrl: '/pedir-gas',
        img1: '/assets/img/work/work-img1.png',
        img2: '/assets/img/work/work-img3.png',
        img3: '/assets/img/work/work-img2.png',
    };

    return (
        <div className="work sp">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="heading1">
                  <span className="span" data-aos="zoom-in-left" data-aos-duration="700">
                    <i className="bi bi-fire" style={{ color: '#FF5722', marginRight: '6px', fontSize: '16px', verticalAlign: 'middle' }}></i>
                    {mainContent.subTitle}
                  </span>
                  <h2 className="title tg-element-title">{mainContent.title}</h2>
                  <div className="space16"></div>
                  <p data-aos="fade-right" data-aos-duration="700">{mainContent.Content}</p>

                  {data.map((item, i) => (
                  <div key={i} className="single-items" data-aos="fade-right" data-aos-duration="700">
                    <div className="">
                      <div className="icon">
                        <img src={item.img} alt="" />
                      </div>
                    </div>
                    <div className="">
                      <h4><Link href="/cobertura">{item.title}</Link></h4>
                      <div className="space10"></div>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
                </div>
                <div className="space30"></div>
                <div className="" data-aos="fade-right" data-aos-duration="800">
                  <Link className="theme-btn1" href={mainContent.btnUrl}>{mainContent.btnName} <span><i className="bi bi-arrow-right"></i></span></Link>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="work-images">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <div className="image image-anime">
                        <img src={mainContent.img1} alt="" />
                      </div>
                      <div className="image image-anime">
                        <img src={mainContent.img2} alt="" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="image image-anime">
                        <img src={mainContent.img3} alt="" />
                      </div>
                    </div>
                  </div>
                  <img src="/assets/img/bg/work-bg.png" alt="" className="bg-image shape-animaiton4" />
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default HomeComoFunciona;
