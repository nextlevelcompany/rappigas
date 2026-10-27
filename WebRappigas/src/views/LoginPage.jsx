'use client';

import React, { useState } from 'react';
import Breadcrumb from '../Components/Common/Breadcrumb';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  const handleSendCode = (e) => {
    e.preventDefault();
    if (phone.length === 9) {
      setCodeSent(true);
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setLoggedIn(true);
  };

  return (
    <div>
      <Breadcrumb Title="Acceso a tu Cuenta RappiGas" />
      <div className="sp" style={{ background: '#F8FAFC', paddingTop: '80px', paddingBottom: '90px' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-8">
              <div
                className="p-4 p-md-5 rounded-4 shadow-sm bg-white text-center"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div
                  className="mx-auto mb-3"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: '#FFF7ED',
                    color: '#FF5722',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                  }}
                >
                  <i className="bi bi-person-circle"></i>
                </div>

                <h3 className="fw-bold mb-1" style={{ color: '#0F2137' }}>
                  Acceso a tu Cuenta
                </h3>
                <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
                  Consulta tus pedidos anteriores, rastrea despachos en vivo y canjea tus puntos acumulados.
                </p>

                {loggedIn ? (
                  <div className="p-4 rounded-4" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
                    <h5 className="fw-bold text-success">¡Bienvenido de vuelta!</h5>
                    <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
                      Has iniciado sesión correctamente con el número <strong>+51 {phone}</strong>.
                    </p>
                    <a href="/fidelidad" className="btn btn-success fw-bold px-4 py-2" style={{ borderRadius: '8px' }}>
                      Ver Mis Puntos RappiGas
                    </a>
                  </div>
                ) : !codeSent ? (
                  <form onSubmit={handleSendCode} className="text-start">
                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                        Número de Celular
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light fw-bold">+51</span>
                        <input
                          type="tel"
                          maxLength="9"
                          className="form-control"
                          placeholder="977 665 554"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Te enviaremos un código de seguridad de 6 dígitos por SMS o WhatsApp.
                      </small>
                    </div>

                    <button
                      type="submit"
                      className="theme-btn1 text-white border-0 w-100 py-3 fw-bold mt-2"
                      style={{
                        background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '15px',
                      }}
                    >
                      Continuar con SMS / WhatsApp
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerify} className="text-start">
                    <div className="alert alert-info py-2" style={{ fontSize: '13px' }}>
                      Código enviado al <strong>+51 {phone}</strong>.{' '}
                      <button
                        type="button"
                        onClick={() => setCodeSent(false)}
                        className="btn btn-link p-0 text-primary text-decoration-none"
                        style={{ fontSize: '13px' }}
                      >
                        Cambiar
                      </button>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                        Código de Verificación (Ej: 123456)
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        className="form-control text-center fs-4 letter-spacing-2"
                        placeholder="• • • • • •"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="theme-btn1 text-white border-0 w-100 py-3 fw-bold"
                      style={{
                        background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '15px',
                      }}
                    >
                      Verificar e Ingresar
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

