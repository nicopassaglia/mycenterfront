import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import { Redirect } from 'react-router-dom';
import './NewClient.css';
import axios from 'axios';
class NewClient extends Component{
  constructor(props){
    super(props);
    this.state = {
      first_name:"",
      last_name:"",
      type_id:"DNI",
      person_id:"",
      email: "",
      gender:"M",
      number:"",
      redirect:false,
    }
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

  }
  addClient = (e) =>{
    e.preventDefault();

    axios.post('http://api.mycenter.rubick.co/clients/',{
      first_name:this.state.first_name,
      last_name:this.state.last_name,
      type_id:this.state.type_id,
      person_id:this.state.person_id,
      email:this.state.email,
      gender:this.state.gender,
      number:this.state.number,
    })
    .then(res=>{

      console.log(res);
      this.setState({redirect:true,})

    })
  }
  render(){
    return(
      <Aux>
        {this.state.redirect ? <Redirect to='/clientes' /> : ""}
        <Header />
        <div className="wrapper-new-client">
          <div className="wrapper-form-new-client">
            <h1>Nuevo Cliente</h1>
            <form id="form-new-client">
              <input onChange={this.handleInputChange} type="text" name="first_name" placeholder="Nombre" value={this.state.first_name} />
              <input onChange={this.handleInputChange} type="text" name="last_name" placeholder="Apellido" value={this.state.last_name} />
              <select onChange={this.handleInputChange} value={this.state.type_id} name="type_id">
                <option value="DNI">DNI</option>
                <option value="PASS">Pasaporte</option>
              </select>
              <input onChange={this.handleInputChange} value={this.state.person_id} type="number" name="person_id" placeholder="Numero de Documento"/>
              <input onChange={this.handleInputChange} value={this.state.email} type="mail" name="email" placeholder="Email"/>
              <select onChange={this.handleInputChange} value={this.state.gender} name="gender">
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
              <input value={this.state.number} onChange={this.handleInputChange} type="number" name="number" placeholder="Numero de telefono sin espacios ni guiones" />

              <button onClick={event =>this.addClient(event)} id="button-submit-new-client">Agregar</button>

            </form>

          </div>

        </div>
      </Aux>
    )
  }
}

export default NewClient;
