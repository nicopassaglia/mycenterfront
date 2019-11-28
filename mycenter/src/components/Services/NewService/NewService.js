import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import { Redirect } from 'react-router-dom';
import './NewService.css';
import axios from 'axios';

class NewService extends Component{
  constructor(props){
    super(props);
    this.state = {
      url:'http://127.0.0.1:8000',
      components:[],
      nombre_producto:"",
      dias_garantia:0,
      componentes_en_producto:[],
      componente_actual_select:"-1",
      oficinas:[],
      precio:0,
      oficinas_disponibles:[],
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.addComponent = this.addComponent.bind(this);
  }

  componentDidMount(){
    this.fetchComponents();
    this.fetchOffices();
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    // if(name === "cliente_seleccionado" || name === "dispositivo_seleccionado"){
    //   let empty = [];
    //   this.setState({listado_servicios_orden:empty},()=>this.calcularMontoTotalServicios());
    // }

    if(target.type === 'checkbox'){
      let arreglo = this.state.oficinas;
      for(let i =0;i<arreglo.length;i++){
      //  console.log(arreglo[i].direccion + " -- "+name);
        if(arreglo[i].direccion === name){
          arreglo[i].checked = value;

        }
      }
      this.setState({oficinas:arreglo});
    }

    this.setState({
      [name]: value
    });

  }
  isInArray(id){
    for(let i =0;i<this.state.componentes_en_producto.length;i++){
      if(this.state.componentes_en_producto[i].component == id){

        return true;

      }
    }
    //console.log(id);
    return false;
  }
  fetchComponents(){
    axios.get(this.state.url+'/components/')
    .then(res =>{
      let local = [];
      for(let i = 0; i < res.data.length; i++ ){
        local[i] = [];
        local[i]['url'] = res.data[i].url;
        local[i]['id'] = res.data[i].id;
        local[i]['name'] = res.data[i].name;
      }
      this.setState({components:local});
    })
  }
  fetchOffices(){
    axios.get(this.state.url+'/offices/')
    .then(res =>{
      let local = [];
      for(let i = 0; i<res.data.length; i++){
        local[i] = [];
        local[i]['id'] = res.data[i].id;
        local[i]['url'] = res.data[i].url;
        local[i]['direccion'] = res.data[i].address;
        local[i]['checked'] = true;

      }
      this.setState({oficinas:local});
    })
  }
  addComponent(event){
    event.preventDefault();
    let componente_seleccionado = this.state.componente_actual_select;
    let arreglo = this.state.componentes_en_producto;
    let cantidad = arreglo.length;
    if(componente_seleccionado === "-1"){
      alert("Debes seleccionar un componente");
    }else{
      arreglo[cantidad] = {};
      arreglo[cantidad]['component'] = componente_seleccionado;
      arreglo[cantidad]['quantity'] = 1;
      for(let i =0;i<this.state.components.length;i++){
        if(this.state.components[i].id == componente_seleccionado){
          arreglo[cantidad]['nombre'] = this.state.components[i].name;
        }
      }
      this.setState({componente_actual_select:"-1"});
    }
    this.setState({componentes_en_producto:arreglo});
  }

  addProduct(event){
    event.preventDefault();
    let mandar = true;
    let arreglo_componentes = this.state.componentes_en_producto;
    if(this.state.nombre_producto === "" || this.state.dias_garantia === ""){
      alert("No dejar campos vacios");
      mandar = false;
    }else if(arreglo_componentes.length === 0){
      let confirm = window.confirm("Esta por agregar un servicio sin componentes, esta seguro?")
      if(!confirm){
        mandar = false;
      }
    }
    if(mandar){
      console.log(this.state.oficinas_disponibles);
      axios.post(this.state.url+'/services/',{
        name:this.state.nombre_producto,
        warranty_period:this.state.dias_garantia,
        service_composition:arreglo_componentes,
        service_type:"http://127.0.0.1:8000/service_type/1/",
      })
      .then(res =>{
        for(let i =0;i<this.state.oficinas.length;i++){
          if(this.state.oficinas[i].checked){
            axios.post(this.state.url+'/service_office/',{
              price_per_unit:this.state.precio,
              active_for_sale:true,
              office:this.state.oficinas[i].url,
              service:res.data.url,
            });
          }

        }

      });
    }



  }
  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-newproduct">
          <form>
            <input type='text' name="nombre_producto" value={this.state.nombre_producto} placeholder="Nombre Servicio" onChange={this.handleInputChange} /><br/>
            <label>Dias de garantia</label><br/>
            <input type="number" name="dias_garantia" value={this.state.dias_garantia} placeholder="Dias de Garantia" onChange={this.handleInputChange} />

            <select name="componente_actual_select" value={this.state.componente_actual_select} onChange={this.handleInputChange}>
              <option value="-1">Seleccionar componentes</option>
              {this.state.components.map((item)=>(
                <option disabled={this.isInArray(item.id)}  value={item.id}>{item.name}</option>
              ))}
              </select>
              {this.state.componentes_en_producto.map((item)=>(
                <p>{item.nombre}</p>
              ))}
              <button onClick={event => this.addComponent(event)}>Agregar componentes al servicio</button><br/>
              <hr/>
              <h3>Oficinas en la que esta disponible</h3>
              {this.state.oficinas.map((item)=>(
                <p><input onChange={this.handleInputChange} type="checkbox" name={item.direccion} checked={item.checked} />{item.direccion} </p>
              ))}
              <label>Precio de venta</label><br/>
              <input type="number" value={this.state.precio} min="0" onChange={this.handleInputChange} placeholder="Precio de Venta" name="precio" />
              <button onClick={event =>this.addProduct(event)}>Agregar Servicio</button>
          </form>
        </div>
      </Aux>
    )
  }
}
export default NewService;
