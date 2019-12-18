import React,{Component} from 'react';
import {Link,Redirect} from 'react-router-dom';
import './Header.css';
import myCenterLogo from '../../assets/images/logo-light.png';
import axios from 'axios';
class header extends Component{
  constructor(props){
    super(props);
    this.state = {
      url:"https://api.mycenter.rubick.co",
      redirect:false,
    }

    this.logout = this.logout.bind(this);
  }
  logout(){
    axios.post(this.state.url+'/auth/logout/')
    .then(res=>{
      sessionStorage.removeItem('id');
      this.setState({redirect:true});
    })


  }
  render(){
    return(
      <header>
        {this.state.redirect ? <Redirect to='/' /> : ""}
        <div className="logo-wrapper">
          <img src={myCenterLogo} alt="logo" />
        </div>
        <a><Link to="/clientes">Clientes</Link></a>
        <a><Link to="/new-venta">Nueva Venta</Link></a>
        <a><Link to="/stock">Stock</Link></a>
        <a><Link to="/caja">Caja</Link></a>
        <a><button onClick={this.logout}>Cerrar Sesión</button></a>
      </header>
    )
  }

}




export default header;
