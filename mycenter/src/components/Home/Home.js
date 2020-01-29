import React,{Component} from 'react';
import Aux from '../../hoc/Aux';
import Header from '../Header/Header';
import './Home.css';
import {Redirect} from 'react-router-dom';

class Home extends Component{
  constructor(props){
    super(props);
    this.state = {
      nro_orden:"",
      redirect:false,
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.goToOrder = this.goToOrder.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  goToOrder(){
    if(this.state.nro_orden === ""){
      alert("Numero de orden no ingresado");
    }else{
      this.setState({redirect:true});
    }
  }
  render(){
    return(
      <Aux>
        {this.state.redirect ? <Redirect to={'/ventas/'+this.state.nro_orden }/> : ""}
        <Header />
        <h1>Bienvenido</h1>
        <div className="wrapper-find-order">
          <input onChange={this.handleInputChange} name="nro_orden" type="number" placeholder="Numero de orden" value={this.state.nro_orden} />
          <button onClick={this.goToOrder}>Ir a orden</button>
        </div>
      </Aux>
    )
  }
}

export default Home;
