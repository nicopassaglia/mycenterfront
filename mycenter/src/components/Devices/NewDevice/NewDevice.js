import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import { Redirect } from 'react-router-dom';
import './NewDevice.css';
import axios from 'axios';

class NewDevice extends Component{
  constructor(props){
    super(props);
    this.state ={
      url:'https://api.mycenter.rubick.co',
      id_cliente:"",
      modelo:"-1",
      color:"Plateado",
      capacidad:"",
      imei:"",
      password:"",
      notes:"",
      devices_models:[],
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

  getDevicesModels(){
    let arreglo_modelos = [];
    axios.get(this.state.url+'/device_models/')
    .then(res=>{
      for(let i = 0;i<res.data.length;i++){
        arreglo_modelos[i] = [];
        arreglo_modelos[i]['modelo'] = res.data[i].name;
        arreglo_modelos[i]['url'] = res.data[i].url;
      }
      console.log(arreglo_modelos);
      this.setState({devices_models:arreglo_modelos});
    })
  }

    componentDidMount(){
      const {idCliente} = this.props.match.params;
      this.setState({id_cliente:idCliente});
      this.getDevicesModels();
    }
    addDevice = (e) =>{

      e.preventDefault();
      axios.post('http://127.0.0.1:8000/devices/',{
        current_owner:"http://127.0.0.1:8000/clients/"+this.state.id_cliente+"/",
        imei:this.state.imei,
        password:this.state.password,
        color:this.state.color,
        model:this.state.modelo,
        notes:this.state.notes,
        capacity:this.state.capacidad,
      })
      .then(res=>{
        console.log(res);
        this.setState({redirect:true});
      });
    }

    render(){
      return(
        <Aux>
          {this.state.redirect ? <Redirect to={'/clientes/'+this.state.id_cliente }/> : ""}
          <Header />
          <div className="newdevice-wrapper">
            <div className="newdevice-form-wrapper">
              <form id="newdevice-form">
                <select value={this.state.modelo} name="modelo" onChange={this.handleInputChange}>
                  <option value="-1">Seleccionar Dispositivo</option>
                  {this.state.devices_models.map((item)=>(
                    <option value={item.url}>{item.modelo}</option>
                  ))}

                </select>
                <select value={this.state.color} onChange={this.handleInputChange} name="color">
                  <option value="Plateado">Plateado</option>
                  <option value="Negro">Negro</option>
                  <option value="Blanco">Blanco</option>
                  <option value="Dorado">Dorado</option>
                  <option value="Rosa">Rosa</option>
                </select>
                <input type="number" name="capacidad" value={this.state.capacidad} placeholder="Capacidad (GB)" onChange={this.handleInputChange}/>
                <input type="text" name="imei" value={this.state.imei} placeholder="IMEI" onChange={this.handleInputChange} />
                <input type="text" name="password" value={this.state.password} placeholder="Clave telefono" onChange={this.handleInputChange} />
                <textarea name="notes" rows='10' cols='20' value={this.state.notes} placeholder="Notas" onChange={this.handleInputChange} />
                <button onClick={event =>this.addDevice(event)} id="button-submit-new-client">Agregar</button>
              </form>
            </div>
          </div>
        </Aux>
      )
    }

}

export default NewDevice;
