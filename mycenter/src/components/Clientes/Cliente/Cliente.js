import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import axios from 'axios';
import {Link} from 'react-router-dom';
import './Cliente.css';

class Cliente extends Component{
  constructor(props){
    super(props);
    this.state = {
      url:'https://api.mycenter.rubick.co',
      id_inbd:"",
      name:"",
      mail:"",
      gender:"",
      number:"",
      type_id:"",
      person_id:"",
      devices_urls:[],
      devices:[],

    };


  }
  componentDidMount() {
    const {id} = this.props.match.params;
    this.setState({id_inbd:id},()=>this.fetchData());


  }
  fetchData(){
    axios.get(this.state.url+'/clients/'+this.state.id_inbd)
    .then(res=>{
      this.setState({name:res.data.name,mail:res.data.email,gender:res.data.gender,number:res.data.number,type_id:res.data.type_id,person_id:res.data.person_id,devices:res.data.devices},()=>this.getDevicesName());
    // console.log(res.data);
    });
  }

  getDevicesName(){
    let arreglo_data_devices = [];
    //
    // for(let i = 0;i<this.state.devices_urls.length;i++){
    //   axios.get(this.state.devices_urls[i])
    //   .then(res=>{
    //     arreglo_data_devices[i] = [];
    //     arreglo_data_devices[i]['id'] = res.data.id;
    //     arreglo_data_devices[i]['modelo'] = res.data.model;
    //     arreglo_data_devices[i]['color'] = res.data.color;
    //     this.setState({devices_data:arreglo_data_devices});
    //
    //   });
    // }


  }

  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-single-client">
          <p><strong>Nombre:</strong> {this.state.name}</p>
          <p><strong>Email: </strong>{this.state.mail}</p>
          <p><strong>Telefono: </strong>{this.state.number}</p>
          <p><strong>Dispositivos: </strong></p>
          <div className="devices-list-clients">
          {this.state.devices.map((item)=>(
              <a><Link to={'/devices/'+item.id}>{item.modelinfo.name} de {item.capacity} GB - {item.color} - IMEI: {item.imei}</Link></a>
          ))}
          </div>
          <a id="button-new-device"><Link to={"/devices/add/"+this.state.id_inbd}>Agregar Dispositivo</Link></a>
        </div>

      </Aux>
    )
  }

}
export default Cliente;
