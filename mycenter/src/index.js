import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Redirect, Link, BrowserRouter as Router } from 'react-router-dom'
import './index.css';
import App from './App';
import Login from './components/Login/Login';
import StoreChoice from './components/StoreChoice/StoreChoice';
import Home from './components/Home/Home';
import Clientes from './components/Clientes/Clientes';
import NewClient from './components/Clientes/NewClient/NewClient';
import Cliente from './components/Clientes/Cliente/Cliente';
import NewDevice from './components/Devices/NewDevice/NewDevice';
import NewVenta from './components/Ventas/NewVenta/NewVenta';
import Ventas from './components/Ventas/Ventas/Ventas';
import Venta from './components/Ventas/Venta/Venta';
import Routes from './components/Routes/Routes';
import Stock from './components/Stock/Stock';
import NewProduct from './components/Productos/NewProduct/NewProduct';
import Productos from './components/Productos/Productos';
import NewService from './components/Services/NewService/NewService';
import Services from './components/Services/Services/Services';
import NewComponent from './components/Componentes/NewComponent/NewComponent';
import Device from './components/Devices/Device/Device';
import Caja from './components/Caja/Caja';
import Cookies from 'js-cookie';
import * as serviceWorker from './serviceWorker';
import axios from 'axios';



function isLoggedIn(){

  if(sessionStorage.getItem('id') === null){
    return false;
  }else{

    return true;
  }

}

// function storeSelected(){
//   if(sessionStorage.getItem("store-key") === null){
//     return false;
//   }else{
//     return true;
//   }
// }

function requireAuth(nextState, replace){

  if (!isLoggedIn()) {
    replace({
      pathname: '/login'
    });
  }
}

const LoginRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    isLoggedIn()
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
)

// const StoreRoute = ({ component: Component, ...rest }) => (
//   <Route {...rest} render={(props) => (
//     storeSelected()
//       ? <Component {...props} />
//       : <Redirect to='/storechoice' />
//   )} />
// )

const routing = (
  <Router>
    <div>
      <LoginRoute exact path="/" component={Home}  />
      <Route path="/login" component={Login} />
      <LoginRoute path="/storechoice" component={StoreChoice} />
      <LoginRoute path="/home" component={Home} />
      <LoginRoute path="/clientes" exact component={Clientes} />

      <LoginRoute path="/clientes/:id"  component={Cliente}/>
      <LoginRoute path="/new-client" component={NewClient} />

      <LoginRoute path="/devices/add/:idCliente" component={NewDevice} />
      <LoginRoute exact path="/devices/:id" component={Device} />
      <LoginRoute path="/new-venta" component={NewVenta} />
      <LoginRoute exact path="/ventas" component={Ventas} />
      <LoginRoute path="/ventas/:id" component={Venta} />
      <LoginRoute path="/rutas/:id" component={Routes} />
      <LoginRoute path="/stock" component={Stock} />
      <LoginRoute path="/new-product" component={NewProduct} />
      <LoginRoute path="/new-service" component={NewService} />
      <LoginRoute path="/new-component" component={NewComponent} />
      <LoginRoute path="/products" component={Productos} />
      <LoginRoute path="/caja" component={Caja} />
      <LoginRoute path="/servicios" component={Services} />
    </div>
  </Router>
);

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
