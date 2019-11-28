import React,{Component} from 'react';
import Aux from '../../hoc/Aux';
import Header from '../Header/Header';
import axios from 'axios';
import {Link} from 'react-router-dom';
import './Routes.css';

class Routes extends Component{
  constructor(props){
    super(props);
    this.state = {
      url:'http://127.0.0.1:8000',
      id_orden:"",
      servicios_en_orden:[],
      rutas:[],
      oficina_actual:[],
      oficinas:[],
      nueva_ruta:"-1",
      donde_se_encuentra:"",
    }

    this.isItThere = this.isItThere.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.confirmNewRoute = this.confirmNewRoute.bind(this);
    this.markAsArrived = this.markAsArrived.bind(this);
  }
  componentDidMount(){
    const {id} = this.props.match.params;
    this.setState({id_orden:id},()=>this.fetchData());
  }
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;


    this.setState({
      [name]: value
    });

  }
  fetchData(){
    this.fetchDataSaleServices();
    this.fetchDataRoutes();
    this.fetchOffices();
  }

  fetchDataSaleServices(){
    let servicios_en_orden = [];
    axios.get(this.state.url+'/saleservices/?order='+this.state.id_orden)
    .then(async res=>{
      for(let i =0;i<res.data.length;i++){
        servicios_en_orden[i] = [];
        servicios_en_orden[i]['url_service_office'] = res.data[i].service_office;
        servicios_en_orden[i]['estado_servicio'] = res.data[i].state;
        servicios_en_orden[i]['servicio'] = [];
        servicios_en_orden[i]['servicio']['oficina'] = [];
        await axios.get(res.data[i].service_office)
        .then(async res2=>{

          servicios_en_orden[i]['servicio']['oficina']['direccion'] = res2.data.office_detail.address;
          servicios_en_orden[i]['servicio']['oficina']['id'] = res2.data.office_detail.id;
          await axios.get(res2.data.service)
          .then(res3=>{
            servicios_en_orden[i]['servicio']['nombre'] = res3.data.name;

          })
        })
      }
      this.setState({servicios_en_orden:servicios_en_orden});
    })
  }
  fetchDataRoutes(){
    let rutas = [];
    axios.get(this.state.url+'/route/?order='+this.state.id_orden)
    .then(async res =>{
      for(let i = 0;i<res.data.length;i++){
        rutas[i] = [];
        rutas[i]['origen'] =[];
        rutas[i]['destino'] =[];
        rutas[i]['notas'] = res.data[i].notes;
        rutas[i]['finished'] = res.data[i].finished;
        rutas[i]['usuario'] = res.data[i].user;
        rutas[i]['ruta_url'] = res.data[i].url;
        rutas[i]['fecha'] = new Date(res.data[i].creation_date).toLocaleString();
        rutas[i]['llego'] = res.data[i].finished;

        if(res.data[i].source_office === res.data[i].destination_office){
          await axios.get(res.data[i].source_office)
          .then(res2=>{

            if(i === (res.data.length - 1)){//ULTIMA RUTA
              let oficina_actual = [];
              oficina_actual['id'] = res2.data.id;
              oficina_actual['direccion'] = res2.data.address;

              this.setState({donde_se_encuentra:res2.data.address,oficina_actual:res2.data.id});
            }
            rutas[i]['origen']['direccion'] = res2.data.address;
            rutas[i]['destino']['direccion'] = res2.data.address;
          });
        }else{
          //if(res.data[i].finished)
          let ultima = false;
          let destino = false;
          if(i === (res.data.length -1)){

            ultima = true;
            if(res.data[i].finished){
              destino = true;
            }
          }
          await axios.get(res.data[i].source_office)
          .then(res2=>{
            rutas[i]['origen']['direccion'] = res2.data.address;
            if(ultima && !destino){
              let oficina_actual = [];
              oficina_actual['id'] = res2.data.id;
              oficina_actual['direccion'] = res2.data.address;

              this.setState({donde_se_encuentra:"En viaje",oficina_actual:res2.data.id});
            }
          });

          await axios.get(res.data[i].destination_office)
          .then(res3 =>{
            rutas[i]['destino']['direccion'] = res3.data.address;
            if(ultima && destino){
                let oficina_actual = [];
                oficina_actual['id'] = res3.data.id;
                oficina_actual['direccion'] = res3.data.address;
                this.setState({donde_se_encuentra:res3.data.address,oficina_actual:res3.data.id});
            }
          });

          //alert(res3.data.address);

          // if(i === (res.data.length - 1)){//ULTIMA RUTA
          //   let oficina_actual = [];
          //   oficina_actual['id'] = res2.data.id;
          //   oficina_actual['direccion'] = res2.data.address;
          //   this.setState({oficina_actual:oficina_actual});
          // }

        }

      }
      this.setState({rutas:rutas});
    });
  }
  fetchOffices(){
    let oficinas = [];
    axios.get(this.state.url+'/offices/')
    .then(res=>{
      for(let i =0;i<res.data.length;i++){
        oficinas[i] = [];
        oficinas[i]['id'] = res.data[i].id;
        oficinas[i]['direccion'] = res.data[i].address;
      }
      this.setState({oficinas:oficinas});
    })
  }

  isItThere(id){
      if(id === this.state.oficina_actual){
        return true;
      }else{
        return false;
      }
  }

  confirmNewRoute(){
    let insert = true;

    for(let i = 0;i<this.state.rutas.length;i++){
      if(!this.state.rutas[i].finished){
        insert = false;
      }
    }
    if(insert){
      axios.post(this.state.url+'/route/',{
        source_office:this.state.url+'/offices/'+this.state.oficina_actual+'/',
        destination_office:this.state.url+'/offices/'+this.state.nueva_ruta+'/',
        order:this.state.url+'/device_orders/'+this.state.id_orden+'/',
        notes:"Ruta agregada",
        user:this.state.url+'/users/'+sessionStorage.getItem('id')+'/',
      })
      .then(res=>{
        this.fetchDataRoutes();
      })
    }else{
      alert("No puedes ingresar una ruta nueva sin que el dispositivo llegue a la anterior");
    }
  }

  markAsArrived(url){

    axios.patch(url,{
      finished:true,
    })
    .then(res =>{
      this.fetchDataRoutes();
    })

  }
  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-edit-routes">
          <div className="wrapper-edit-routes-container">
            <h2>Rutas</h2>

            {this.state.rutas.map((item,index)=>(
              <div>
              {item.destino.direccion === item.origen.direccion ?
                <p>{index + 1} - Dispositivo en <strong>{item.origen.direccion}</strong> - Fecha: {item.fecha}</p>
                :
                <p>{index + 1} - <strong>Salio de:</strong> {item.origen.direccion} el {item.fecha} <strong>Hacia:</strong> {item.destino.direccion} <strong>Llego?</strong> {item.llego ? <span>Si</span> : <span>No <button onClick={()=>this.markAsArrived(item.ruta_url)}>Marcar que llego</button></span>} </p>}  </div>
            ))}
            <p>Se encuentra actualmente en <strong>{this.state.donde_se_encuentra}</strong></p>

            <h2>Lugares de servicio</h2>
            {this.state.servicios_en_orden.map((item)=>(
              <p>Este dispositivo deberia hacerse <strong>{item.servicio.nombre}</strong> en {item.servicio.oficina.direccion}</p>
            ))}

            <select name="nueva_ruta" value={this.state.nueva_ruta} onChange={this.handleInputChange}>
              <option value="-1">Seleccionar oficina destino</option>
              {this.state.oficinas.map((item)=>(
                <option disabled={this.isItThere(item.id)} value={item.id}>{item.direccion}</option>
              ))}
            </select>

            <button onClick={this.confirmNewRoute}>Confirmar</button>
          </div>
        </div>
      </Aux>
    )
  }
}
export default Routes;
