import React,{Component} from 'react';
import Aux from '../../hoc/Aux';
import Header from '../Header/Header';
import axios from 'axios';
import {Link} from 'react-router-dom';
import './Clientes.css';

class Clientes extends Component{
  constructor(props){
    super(props);
    this.state = {
      url:'https://api.mycenter.rubick.co',
      clientes:[],
      arreglo_filtrado:[],
      filter_name:"",
      filter_dni:"",
    };

    this.handleInputChange = this.handleInputChange.bind(this);

  }
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    },()=>this.filter());

  }
  filter(){
    let clientes = this.state.clientes;

  //  showObras(arreglo.filter(function(obra){return obra.provincia == valor}));
    let nombre = this.state.filter_name;
    let dni = this.state.filter_dni;
    if(nombre != ""){
      clientes = clientes.filter(function(cliente){return cliente.last_name.toString().toLowerCase().includes(nombre.toLowerCase())});
    }
    if(dni != ""){
      clientes = clientes.filter(function(cliente){return cliente.person_id.includes(dni)});
    }
    this.setState({arreglo_filtrado:clientes});
  }
  componentDidMount() {
    let arreglo_clientes = [];
    axios.get(this.state.url+'/clients/')

    .then(res=>{
      for(let i = 0; i<res.data.length;i++){
        arreglo_clientes[i] = res.data[i];
      }
      this.setState({clientes:arreglo_clientes,arreglo_filtrado:arreglo_clientes});
      console.log(res);
    })
  }
  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-display-clientes">
          <h1>Clientes</h1>
          <a><Link to='new-client'>Nuevo Cliente</Link></a>
          <input type="text" name="filter_name" onChange={this.handleInputChange} value={this.state.filter_name} placeholder="Filtro por apellido" />
          <input type="number" name="filter_dni" onChange={this.handleInputChange} value={this.state.filter_dni} placeholder="Filtro por dni" />
          <table id="displayClientesTable">
            <tr>
              <th>Tipo de Documento</th>
              <th>Nro Documento</th>
              <th>Nombre</th>
              <th>Mail</th>
              <th>Genero</th>
              <th>Numero Telefono</th>
              <th>Acciones</th>
            </tr>
          {this.state.arreglo_filtrado.map((item)=>(
            <tr>
            <td>{item.type_id}</td>
            <td>{item.person_id}</td>
            <td>{item.first_name} {item.last_name}</td>
            <td>{item.email}</td>
            <td>{item.gender}</td>
            <td>{item.number}</td>
            <td><a><Link to={"/clientes/"+item.id}>Ver Más</Link></a></td>
            </tr>
          ))}
          </table>
          </div>
        </Aux>

    )
  }
}



export default Clientes;
