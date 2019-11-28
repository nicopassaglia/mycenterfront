import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import axios from 'axios';
import {Link} from 'react-router-dom';
import './Device.css';

class Device extends Component{
  constructor(props){
    super(props);
    this.state = {
      url:'http://127.0.0.1:8000',
      device_id:"",
      imei:"",
      clave:"",
      color:"",
      modelo:"",
      notas:"",
      capacity:"",
      ordenes_urls:[],
      arreglo_ordenes:[],
      cliente_url:"",
      nombre_cliente:"",
      dni_cliente:"",
    };


  }
  componentDidMount() {
    const {id} = this.props.match.params;
    this.setState({device_id:id},()=>this.fetchData());


  }
  fetchData(){
    axios.get(this.state.url+'/devices/'+this.state.device_id)
    .then(res=>{
      this.setState({imei:res.data.imei,clave:res.data.password,capacity:res.data.capacity,modelo:res.data.modelinfo.name,color:res.data.color,notas:res.data.notes,cliente_url:res.data.current_owner,ordenes_urls:res.data.device_order},()=>this.getExtraData());
      //console.log(res);
    // console.log(res.data);
    });
  }

  getExtraData(){
    this.getClientData();
    this.getOrders();
  }

  getClientData(){

    axios.get(this.state.cliente_url)
    .then(res=>{
      this.setState({nombre_cliente:res.data.name,dni_cliente:res.data.person_id});
    })
  }

   async getOrders(){
     console.log(this.state.ordenes_urls);
    let arreglo_ordenes = [];
    for(let i = 0;i<this.state.ordenes_urls.length;i++){
      arreglo_ordenes[this.state.ordenes_urls.length - (i + 1)] = [];
      arreglo_ordenes[this.state.ordenes_urls.length - (i + 1)]['sale'] = this.state.ordenes_urls[i].sale;
      arreglo_ordenes[this.state.ordenes_urls.length - (i + 1)]['estado'] = this.state.ordenes_urls[i].state;
    // await  axios.get(this.state.ordenes_urls[i].url)
    //   .then(res=>{
    //     console.log(res);
    //
    //
    //     arreglo_ordenes[this.state.ordenes_urls.length - (i + 1)] = [];
    //     arreglo_ordenes[this.state.ordenes_urls.length - (i + 1)]['sale'] = res.data.sale;
    //     arreglo_ordenes[this.state.ordenes_urls.length - (i + 1)]['estado'] = res.data.state;
    //     // arreglo_ordenes[i]['notas'] = res.data.notes;
    //     // arreglo_ordenes[i]['wet'] = res.data.wet;
    //     // arreglo_ordenes[i]['fecha'] = res.data.time_created;
    //
    //   })

    }
    this.setState({arreglo_ordenes:arreglo_ordenes});
  }

  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-single-device">
          <div className="info-device">
            <p><strong>Modelo:</strong>{this.state.modelo} - {this.state.capacity}GB</p>
            <p><strong>Color:</strong>{this.state.color}</p>
            <p><strong>Clave:</strong>{this.state.clave}</p>
            <p><strong>Cliente:</strong>{this.state.nombre_cliente} ({this.state.dni_cliente})</p>
            <p><strong>Notas:</strong>{this.state.notas}</p>
            <p><strong>IMEI:</strong>{this.state.imei}</p>
            <p><strong>Ordenes:</strong></p>
            {this.state.arreglo_ordenes.map((item)=>(
              <a><Link to={'/ventas/'+item.sale}><p>{item.sale} - Estado: {item.estado}</p></Link></a>
            ))}

          </div>

        </div>

      </Aux>
    )
  }
}

export default Device;
