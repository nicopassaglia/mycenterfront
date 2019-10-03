import React from 'react';
import {Link} from 'react-router-dom';
import './Header.css';
import myCenterLogo from '../../assets/images/logo-light.png';

const header = (props) =>(
  <header>
    <div className="logo-wrapper">
      <img src={myCenterLogo} alt="logo" />
    </div>
    <a><Link to="/clientes">Clientes</Link></a>
    <a><Link to="/new-venta">Nueva Venta</Link></a>
    <a><Link to="/stock">Stock</Link></a>
    <a><Link to="/">Caja</Link></a>
    <a><Link to="/">Cerrar Sesión</Link></a>
  </header>
);


export default header;
