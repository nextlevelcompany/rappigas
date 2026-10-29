'use client';

import Link from "next/link";
import Slider from "react-slick";
import data from '../../Data/Home1/project1.json';
import SectionTitle from "../Common/SectionTitle";

const ClubRappipuntosPremios = () => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 2000,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        swipeToSlide: true,
        autoplay: true,
        responsive: [
          {
            breakpoint: 1399,
            settings: {
              slidesToShow: 3,
            }
          },
          {
            breakpoint: 1199,
            settings: {
              slidesToShow: 2,
            }
          },{
            breakpoint: 575,
            settings: {
              slidesToShow: 1,
            }
          }
        ]
      }; 

    return (
        <div className="project sp" id="fidelidad">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 m-auto text-center">
                <div className="heading1">
                    <SectionTitle
                        SubTitle="Club de Recompensas Rappipuntos"
                        Title="Acumula Puntos en Cada Balón y Canjea Premios Gratis"
                    ></SectionTitle>
                </div>
              </div>
            </div>

            <div className="space30"></div>
            <div className="row">
              <div className="project-slider cs_slider_gap_30">
                <Slider {...settings}>
                {data.map((item, i) => (
                <div key={i} className="single-slider">
                  <div className="slider-img">
                    <img src={item.img} alt={item.title} />
                  </div>
                  <div className="heading">
                    <h3><Link href="/premios/catalogo">{item.title}</Link></h3>
                    <Link href="/premios/catalogo" className="learn">{item.btnName} <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-arrow-right-short" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
                      </svg>
                        </span></Link>
                  </div>
                </div>
                ))}
                </Slider>
              </div>
            </div>

            <div className="space30"></div>
            <div className="row">
              <div className="col-12 text-center">
                <Link
                  href="/premios/catalogo"
                  className="btn text-white fw-bold px-4 py-3"
                  style={{
                    background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                    borderRadius: '10px',
                    boxShadow: '0 8px 20px rgba(216, 67, 21, 0.35)',
                    fontSize: '15px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="bi bi-gift-fill"></i>
                  <span>Explorar Catálogo Completo de Premios (+100 Productos)</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
    );
};

export default ClubRappipuntosPremios;
