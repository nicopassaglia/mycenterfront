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
      url:'http://127.0.0.1:8000',
      clientes:[],
    };


  }
  componentDidMount() {
    let arreglo_clientes = [];
    axios.get(this.state.url+'/clients/')

    .then(res=>{
      for(let i = 0; i<res.data.length;i++){
        arreglo_clientes[i] = res.data[i];
      }
      this.setState({clientes:arreglo_clientes});
      console.log(res);
    })
  }
  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-display-clientes">
          <h1>Clientes</h1><a><Link to='new-client'>Nuevo Cliente</Link></a>
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
          {this.state.clientes.map((item)=>(
            <tr>
            <td>{item.type_id}</td>
            <td>{item.person_id}</td>
            <td>{item.name}</td>
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
