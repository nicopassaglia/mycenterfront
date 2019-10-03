import React from 'react';
import Aux from '../../hoc/Aux';
import Header from '../Header/Header';
import './Home.css';

const home = (props) =>(
  <Aux>
    <Header />
    <h1>Bienvenido</h1>
  </Aux>
);

export default home;
