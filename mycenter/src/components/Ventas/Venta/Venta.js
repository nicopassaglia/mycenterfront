import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import axios from 'axios';
import {Link} from 'react-router-dom';
import './Venta.css';

class Venta extends Component{
  constructor(props){
    super(props);
    this.state = {
      id_orden:"",
      url:'http://127.0.0.1:8000',
      estado_orden:"",
      fecha_creacion_orden:"",
      notas_orden:"",
      celular_mojado:"",
      arreglo_servicios:[],
      arreglo_productos:[],
      nuevo_estado_orden:"-1",
      device:"",
      arreglo_servicios_venta:[],
      arreglo_productos_venta:[],
      servicio_actual:"-1",
      producto_actual:"-1",
      listado_servicios_agregar_orden:[],
      listado_productos_agregar_orden:[],
      monto_total_servicios_nuevos:0,
      monto_total_servicios_en_orden:0,
      monto_total_productos_nuevos:0,
      monto_total_productos_en_orden:0,
      pagos_realizados:[],
      deuda:0,
      efectivo:0,
      tarjeta:0,
      rutas:[],
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.changeOrderState = this.changeOrderState.bind(this);
    this.isDelivered = this.isDelivered.bind(this);
    this.markAsFinished = this.markAsFinished.bind(this);
    this.confirmNewServices = this.confirmNewServices.bind(this);
    this.confirmNewProducts = this.confirmNewProducts.bind(this);
    this.removeProductFromOrder = this.removeProductFromOrder.bind(this);
    this.pay = this.pay.bind(this);
  }


  calculateDeuda(){
    let deuda = 0;

    deuda = (this.state.monto_total_productos_en_orden + this.state.monto_total_servicios_en_orden);

    for(let i =0;i<this.state.pagos_realizados.length;i++){
      deuda -= this.state.pagos_realizados[i].monto;
    }
    this.setState({deuda:deuda});
  }
  isDelivered(){

    if(this.state.estado_orden === "E"){

      return true;
    }else{

      return false;
    }
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    if(name === "cliente_seleccionado"){
      let empty = [];
      this.setState({listado_servicios_orden:empty},()=>this.calcularMontoTotalServicios());
    }

    this.setState({
      [name]: value
    });

  }

  changeOrderState(){
    if(this.state.nuevo_estado_orden === "-1"){
      alert("Seleccionar un estado valido");

    }else if(this.state.nuevo_estado_orden === "E" && this.state.deuda > 0){
      alert("Para poner estado en entregado primero debe cancelar la deuda");

    }else{
      axios.patch(this.state.url+'/orders/'+this.state.id_orden+'/',{
        state:this.state.nuevo_estado_orden,
      })
      .then(res=>{
        this.fetchDataOrder();
      })
    }
  }

 fetchData(){

     this.fetchDataOrder();
     this.fetchDataServices();
     this.fetchDataProducts();
     this.fetchSerivcesToSell();
     this.fetchProductsToSell();
     this.fetchDataPayments();
     this.fetchDataRoutes();

  }

  fetchDataRoutes(){ //MODIFICAR CUANDO SE POPULE OFICINA EN RUTA
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
        rutas[i]['fecha'] = res.data[i].creation_date;

        if(res.data[i].source_office === res.data[i].destination_office){
          await axios.get(res.data[i].source_office)
          .then(res=>{
            rutas[i]['origen']['direccion'] = res.data.address;
            rutas[i]['destino']['direccion'] = res.data.address;
          });
        }else{
          await axios.get(res.data[i].source_office)
          .then(res2=>{
            rutas[i]['origen']['direccion'] = res2.data.address;
            // if(ultima && !destino){
            //   let oficina_actual = [];
            //   oficina_actual['id'] = res2.data.id;
            //   oficina_actual['direccion'] = res2.data.address;
            //   this.setState({oficina_actual:oficina_actual});
            // }
          });

          await axios.get(res.data[i].destination_office)
          .then(res3 =>{
            rutas[i]['destino']['direccion'] = res3.data.address;
            // if(ultima && destino){
            //     let oficina_actual = [];
            //     oficina_actual['id'] = res3.data.id;
            //     oficina_actual['direccion'] = res3.data.address;
            //     this.setState({oficina_actual:oficina_actual});
            // }
          });

        }
      }
      this.setState({rutas:rutas});
    });
  }


  fetchDataPayments(){
    let pagos_realizados = [];
    axios.get(this.state.url+'/payment/?order='+this.state.id_orden)
    .then(res =>{
      for(let i =0;i<res.data.length;i++){
        pagos_realizados[i] = [];
        pagos_realizados[i]['tipo'] = res.data[i].payment_type;
        pagos_realizados[i]['monto'] = res.data[i].amount;
        pagos_realizados[i]['fecha'] = res.data[i].time_created;
      }
      this.setState({pagos_realizados:pagos_realizados},()=>this.calculateDeuda());
    })
  }
  fetchDataOrder(){
    axios.get(this.state.url+'/orders/'+this.state.id_orden)
    .then(res =>{
    //  console.log(res);
      this.setState({estado_orden:res.data.state,fecha_creacion_orden:res.data.time_created,notas_orden:res.data.notas_orden,celular_mojado:res.data.wet,device:res.data.device});
    })
  }

  fetchDataServices(){
    let arreglo_servicios = [];
    axios.get(this.state.url+'/saleservices/?order='+this.state.id_orden)
    .then(async resservices =>{
      for(let i = 0;i<resservices.data.length;i++){
        arreglo_servicios[i] = [];
        arreglo_servicios[i]['monto'] = resservices.data[i].price;
        arreglo_servicios[i]['estado'] = resservices.data[i].state;
        arreglo_servicios[i]['sale_service_url'] = resservices.data[i].url;
        await axios.get(resservices.data[i].service)
        .then(result =>{
          arreglo_servicios[i]['nombre_servicio'] = result.data.name;
          arreglo_servicios[i]['id_servicio'] = result.data.id;
        })
      }
      this.setState({arreglo_servicios:arreglo_servicios},()=>this.calcularMontoTotalServiciosEnOrden());


    })

  }

  fetchDataProducts(){
    let arreglo_productos = [];
    axios.get(this.state.url+'/saleproducts/?order='+this.state.id_orden)
    .then(async resservices =>{
      for(let i = 0;i<resservices.data.length;i++){
        arreglo_productos[i] = [];
        arreglo_productos[i]['monto'] = resservices.data[i].price;
        arreglo_productos[i]['cantidad'] = resservices.data[i].quantity_sold;
        arreglo_productos[i]['url'] = resservices.data[i].url;
        await axios.get(resservices.data[i].product)
        .then(result =>{
          arreglo_productos[i]['nombre_producto'] = result.data.name;
          arreglo_productos[i]['id_producto'] = result.data.id;

        })
      }
      this.setState({arreglo_productos:arreglo_productos},()=>this.getMontoTotalProductosEnOrden());

    })

  }
  fetchSerivcesToSell(){
    let arreglo_servicios_venta = [];
    axios.get(this.state.url+'/services/')
    .then(res =>{
      for(let i =0; i<res.data.length;i++){
        arreglo_servicios_venta[i] = [];
        arreglo_servicios_venta[i]['id'] = res.data[i].id;
        arreglo_servicios_venta[i]['url'] = res.data[i].url;
        arreglo_servicios_venta[i]['nombre'] = res.data[i].name;
        arreglo_servicios_venta[i]['precio_unitario'] = res.data[i].price;
      }

    this.setState({arreglo_servicios_venta:arreglo_servicios_venta});

    })
  }
  fetchProductsToSell(){
    let arreglo_productos_venta = [];
    axios.get(this.state.url+'/products/')
    .then(res =>{
      for(let i =0; i<res.data.length;i++){
        arreglo_productos_venta[i] = [];
        arreglo_productos_venta[i]['id'] = res.data[i].id;
        arreglo_productos_venta[i]['url'] = res.data[i].url;
        arreglo_productos_venta[i]['nombre'] = res.data[i].name;
        arreglo_productos_venta[i]['precio_unitario'] = res.data[i].price;
      }

    this.setState({arreglo_productos_venta:arreglo_productos_venta});

    })
  }

  markAsFinished(url){

    axios.patch(url,{
      state:"F",
    })
    .then(res =>{
      this.fetchDataServices();
    })

  }


  addServiceToOrder(event){
    event.preventDefault();
    let listado_servicios_agregar_local = this.state.listado_servicios_agregar_orden;
    var cant = listado_servicios_agregar_local.length;
    if(this.state.servicio_actual === "-1"){
      alert("Debes seleccionar un servicio");
    }else{
      for(let i = 0;i<this.state.arreglo_servicios_venta.length;i++){
        if(this.state.arreglo_servicios_venta[i].id == this.state.servicio_actual){
          listado_servicios_agregar_local[cant] = [];
          listado_servicios_agregar_local[cant]['id'] = this.state.arreglo_servicios_venta[i].id_producto;
          listado_servicios_agregar_local[cant]['nombre'] = this.state.arreglo_servicios_venta[i].nombre;
          listado_servicios_agregar_local[cant]['quantity_sold'] = 1;
          listado_servicios_agregar_local[cant]['precio_unitario'] = this.state.arreglo_servicios_venta[i].precio_unitario;
          listado_servicios_agregar_local[cant]['monto'] = this.state.arreglo_servicios_venta[i].precio_unitario * listado_servicios_agregar_local[cant]['quantity_sold'];
          listado_servicios_agregar_local[cant]['url'] = this.state.arreglo_servicios_venta[i].url;
        }
      }

    }

    this.setState({listado_servicios_agregar_orden:listado_servicios_agregar_local},()=>this.calcularMontoTotalServicios());


  }

  calcularMontoTotalServicios(){
    this.calcularMontoTotalServiciosNuevos();

  }

  calcularMontoTotalServiciosNuevos(){
      this.setState({servicio_actual:"-1"});
      let monto = 0;

      for(let i = 0;i<this.state.listado_servicios_agregar_orden.length;i++){
        monto += Number(this.state.listado_servicios_agregar_orden[i].monto);
        //alert(monto);

      }
      this.setState({monto_total_servicios_nuevos:monto});
  }
  calcularMontoTotalServiciosEnOrden(){
    let monto_local =0;
    for(let i =0;i<this.state.arreglo_servicios.length;i++){
      monto_local += Number(this.state.arreglo_servicios[i].monto);
    }
    this.setState({monto_total_servicios_en_orden:monto_local},()=>this.calculateDeuda());
  }

  updateAmountServiceOrder(event,idServicio){
    var local_listado = this.state.listado_servicios_agregar_orden;
    const value = event.target.value;
    //alert(value);
    for(let i =0;i<local_listado.length;i++){

      if(local_listado[i].id === idServicio){
        local_listado[i]['quantity_sold'] = value;
        local_listado[i]['monto'] = value * local_listado[i].precio_unitario;


      }
    }
    this.setState({listado_servicios_agregar_orden:local_listado},()=>this.calcularMontoTotalServicios());
  }




  changeMontoServiceinOrder(event,idServicio){
    const monto = event.target.value;
    let listado_local = this.state.listado_servicios_agregar_orden;

    for(let i = 0; i<listado_local.length; i++){
      if(listado_local[i].id == idServicio){
        listado_local[i]['monto'] = monto;

      }
    }
    this.setState({listado_servicios_agregar_orden:listado_local},()=>this.calcularMontoTotalServicios());
  }

  removeItemServicios(id){
    let listado_local = this.state.listado_servicios_agregar_orden;

    for(let i =0;i<listado_local.length;i++){
      if(listado_local[i].id == id){
        //listado_local.splice(i,1);
        listado_local.splice(i,1);

      }
    }
    this.setState({listado_servicios_agregar_orden:listado_local},()=>this.calcularMontoTotalServicios());
  }

  async confirmNewServices(){
    let local = this.state.listado_servicios_agregar_orden;

    if(local.length === 0){
      alert("No puedes cargar servicios vacios");
    }else{

      for(let i = 0;i<local.length;i++){
        await axios.post(this.state.url+'/saleservices/',{
          order:this.state.url+'/orders/'+this.state.id_orden+'/',
          service:local[i].url,
          price:local[i].monto,
          component_quantity:local[i].quantity_sold,
        });
      }
    }
    local = [];
    this.setState({listado_productos_agregar_orden:local},()=>this.calcularMontoTotalServiciosNuevos());
    this.fetchDataServices();
  }

  removeServiceFromOrder(id){
    let confirm = window.confirm('Estas seguro que deseas eliminar este servicio?');

    if(confirm){
      axios.delete(id)
      .then(res =>{
        this.fetchDataServices();
        console.log(res);
      })
    }else{

    }

  }




  addProductToOrder(event){
    event.preventDefault();
    var local_listado = this.state.listado_productos_agregar_orden;
    var cant = local_listado.length;
    if(this.state.producto_actual === "-1"){
      alert("Debes seleccionar un producto");
    }else{
      for(let i = 0;i<this.state.arreglo_productos_venta.length;i++){
        if(this.state.arreglo_productos_venta[i].id == this.state.producto_actual){
          local_listado[cant] = [];
          local_listado[cant]['id'] = this.state.arreglo_productos_venta[i].id;
          local_listado[cant]['url'] = this.state.arreglo_productos_venta[i].url;
          local_listado[cant]['nombre'] = this.state.arreglo_productos_venta[i].nombre;
          local_listado[cant]['quantity_sold'] = 1;
          local_listado[cant]['precio_unitario'] = this.state.arreglo_productos_venta[i].precio_unitario;
          local_listado[cant]['monto'] = this.state.arreglo_productos_venta[i].precio_unitario * local_listado[cant]['quantity_sold'];

        }
      }

    }
    this.setState({listado_productos_agregar_orden:local_listado},()=>this.calcularMontoTotalProductosNuevos());

  }

  calcularMontoTotalProductosNuevos(){

    this.setState({producto_actual:"-1"});
    let monto = 0;

    for(let i = 0;i<this.state.listado_productos_agregar_orden.length;i++){
      monto += Number(this.state.listado_productos_agregar_orden[i].monto);
      //alert(monto);

    }
    this.setState({monto_total_productos_nuevos:monto});
  }

  getMontoTotalProductosEnOrden(){
    let monto = 0;
    for(let i =0;i<this.state.arreglo_productos.length;i++){
      monto +=Number(this.state.arreglo_productos[i].monto);
    }
    this.setState({monto_total_productos_en_orden:monto},()=>this.calculateDeuda());
  }

  updateAmountProductOrder(event,idProducto){
      var local_listado = this.state.listado_productos_agregar_orden;
      const value = event.target.value;
      //alert(value);
      for(let i =0;i<local_listado.length;i++){

        if(local_listado[i].id === idProducto){
          local_listado[i]['quantity_sold'] = value;
          local_listado[i]['monto'] = value * local_listado[i].precio_unitario;


        }
      }
      this.setState({listado_productos_agregar_orden:local_listado},()=>this.calcularMontoTotalProductosNuevos());
  }

  removeItemProductos(id){
    let listado_local = this.state.listado_productos_agregar_orden;

    for(let i =0;i<listado_local.length;i++){
      if(listado_local[i].id == id){
        //listado_local.splice(i,1);
        listado_local.splice(i,1);

      }
    }
    this.setState({listado_productos_agregar_orden:listado_local},()=>this.calcularMontoTotalProductosNuevos());


  }

  changeMontoProductinOrder(event,idProducto){
  //  alert(idProducto);
    const monto = event.target.value;
    let listado_local = this.state.listado_productos_agregar_orden;

    for(let i = 0; i<listado_local.length; i++){
      if(listado_local[i].id == idProducto){
        listado_local[i]['monto'] = monto;

      }
    }
    this.setState({listado_productos_agregar_orden:listado_local},()=>this.calcularMontoTotalProductosNuevos());
  }

  async confirmNewProducts(){
    let local = this.state.listado_productos_agregar_orden;
    if(local.length === 0){
      alert("No puedes cargar servicios vacios");
    }else{

      for(let i = 0;i<local.length;i++){
        await axios.post(this.state.url+'/saleproducts/',{
          order:this.state.url+'/orders/'+this.state.id_orden+'/',
          product:local[i].url,
          price:local[i].monto,
          quantity_sold:local[i].quantity_sold,
        });
      }
    }
    local = [];
    this.setState({listado_productos_agregar_orden:local},()=>this.calcularMontoTotalProductosNuevos());
    this.fetchDataProducts();
  }

  removeProductFromOrder(id){
    let confirm = window.confirm('Estas seguro que deseas eliminar este producto?');

    if(confirm){
      axios.delete(id)
      .then(res =>{
        this.fetchDataProducts();
        //console.log(res);
      })
    }else{

    }


  }
  async pay(){

    if(Number(this.state.efectivo) + Number(this.state.tarjeta) > this.state.deuda){
      alert("El monto a pagar es mayor a la deuda");
    }else{
      if(this.state.efectivo > 0){
        await axios.post(this.state.url+'/payment/',{
          payment_type:"E",
          order:this.state.url+'/orders/'+this.state.id_orden+'/',
          amount:this.state.efectivo
        })
        .then(res =>{


        })
      }
      if(this.state.tarjeta > 0){
        await axios.post(this.state.url+'/payment/',{
          payment_type:"C",
          order:this.state.url+'/orders/'+this.state.id_orden+'/',
          amount:this.state.tarjeta,
        })
        .then(res =>{

        })
      }
      this.fetchDataPayments();
      this.setState({efectivo:0,tarjeta:0});
    }

  }
  componentDidMount(){
    const {id} = this.props.match.params;
    this.setState({id_orden:id},()=>this.fetchData());

  }
  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-single-order">
          <div className="wrapper-single-order-container">
            <div className="wrapper-single-order-orden">
              <h3>Nro de Orden: {this.state.id_orden}</h3>
              <p><strong>Fecha creacion de Orden:</strong> {this.state.fecha_creacion_orden}</p>
              <p><strong>Estado de Orden:</strong> {this.state.estado_orden}</p>
              <p><strong>Mojado?</strong> {this.state.celular_mojado ? "Si" : "No"}</p>

              <select onChange={this.handleInputChange} name="nuevo_estado_orden" value={this.state.nuevo_estado_orden}>
                <option value="-1">Cambiar de estado</option>
                <option value="T">Tramite</option>
                <option value="F">Finalizada</option>
                <option value="E">Entregada</option>
              </select>
              <button onClick={this.changeOrderState}>Cambiar de Estado</button>


            </div>
            <div className="wrapper-single-order-servicios">
              <h2>Servicios</h2>
              {this.state.arreglo_servicios.map((item)=>(
                <div className="wrapper-single-order-servicios-item">
                  <p><strong>Servicio: </strong>{item.nombre_servicio}</p>
                  <p><strong>Monto: </strong>${item.monto}</p>
                  <p><strong>Estado: </strong>{item.estado}</p>
                  {item.estado === "NF" ? <button onClick={()=>this.markAsFinished(item.sale_service_url)}>Marcar como terminado</button> : ""}
                  <button onClick={()=>this.removeServiceFromOrder(item.sale_service_url)}>Eliminar Servicio de orden</button>
                </div>
              ))}
              <p><strong>Total en Servicios Ya en Orden: </strong>${this.state.monto_total_servicios_en_orden}</p>

            </div>
            <div className="wrapper-single-order-productos">
              <h2>Productos</h2>
              {this.state.arreglo_productos.map((item)=>(
                <div className="wrapper-single-order-servicios-item">
                  <p><strong>Producto: </strong>{item.nombre_producto}</p>
                  <p><strong>Monto: </strong>${item.monto}</p>
                  <p><strong>Cantidad: </strong>{item.cantidad}</p>
                  <button onClick={()=>this.removeProductFromOrder(item.url)}>Eliminar Producto de orden</button>
                </div>
              ))}
              <p><strong>Total en Productos Ya en Orden: </strong>${this.state.monto_total_productos_en_orden}</p>
            </div>



            {this.isDelivered() ?
              ""
              :

              <div className="wrapper-single-order-newservice"><h2>Agregar Servicio a la orden</h2><select onChange={this.handleInputChange} name="servicio_actual" value={this.state.servicio_actual}>
              <option value="-1">Seleccionar Servicio</option>
              {this.state.arreglo_servicios_venta.map((item)=>(
                <option value={item.id}>{item.nombre}</option>
              ))}
              </select>

              <button onClick={(event) => this.addServiceToOrder(event)}>Agregar</button>
              <h3>Resumen Servicios Agregados</h3>
              {this.state.listado_servicios_agregar_orden.map((item)=>(
                <p>{item.nombre} <input onChange={event => this.updateAmountServiceOrder(event,item.id)} type="number" value={item.quantity_sold} /> $<input type='number' value={item.monto} onChange={event => this.changeMontoServiceinOrder(event,item.id)} /> (${item.precio_unitario}) <button onClick={()=>this.removeItemServicios(item.id)}>X</button></p>
              ))}
              <button onClick={this.confirmNewServices}>Confirmar</button>
              <p><strong>Total en Servicios Agregados: </strong>${this.state.monto_total_servicios_nuevos}</p>

              </div>

            }


            {this.isDelivered() ?
            ""
            :
            <div className="wrapper-single-order-newproduct">
            <h2>Agregar Producto a la orden</h2>
            <select onChange={this.handleInputChange} name="producto_actual" value={this.state.producto_actual}>
              <option value="-1">Seleccionar Producto</option>
              {this.state.arreglo_productos_venta.map((item)=>(
                <option value={item.id}>{item.nombre}</option>
              ))}
              </select>
              <button onClick={(event)=>this.addProductToOrder(event)}>Agregar</button>
              <h3>Resumen Productos Agregados</h3>
              {this.state.listado_productos_agregar_orden.map((item)=>(
                <p>{item.nombre} <input onChange={event => this.updateAmountProductOrder(event,item.id)} type="number" value={item.quantity_sold} /> $<input type='number' value={item.monto} onChange={event => this.changeMontoProductinOrder(event,item.id)} /> (${item.precio_unitario}) <button onClick={()=>this.removeItemProductos(item.id)}>X</button></p>
              ))}
              <button onClick={this.confirmNewProducts}>Confirmar</button>
              <p><strong>Total en Productos Agregados: </strong>${this.state.monto_total_productos_nuevos}</p>


            </div>
          }






            <div className="wrapper-single-order-payments">
              <h2>Monto del pedido</h2>
              <p><strong>Total a pagar por servicios: </strong>${this.state.monto_total_servicios_en_orden + this.state.monto_total_servicios_nuevos}</p>
              <p><strong>Total a pagar por productos: </strong>${this.state.monto_total_productos_nuevos + this.state.monto_total_productos_en_orden}</p>
              <p><strong>Total: </strong>${this.state.monto_total_servicios_en_orden + this.state.monto_total_servicios_nuevos+this.state.monto_total_productos_nuevos + this.state.monto_total_productos_en_orden}</p>
              <h2>Pagos Realizados</h2>
              {this.state.pagos_realizados.map((item)=>(
                <p><strong>Forma de pago: </strong>{item.tipo} - <strong>Monto: </strong>${item.monto}</p>
              ))}

              <h2>Deuda</h2>

              <p><strong>Monto adeudado: </strong>${this.state.deuda}</p>
              <label>Cantidad en Efectivo</label> <input type="number" min="0" onChange={this.handleInputChange} name="efectivo" value={this.state.efectivo} /><br/>
              <label>Cantidad con Tarjeta</label> <input type="number" min="0" onChange={this.handleInputChange} name="tarjeta" value={this.state.tarjeta} /><br/>
              <button onClick={this.pay}>Confirmar Pago</button>

            </div>
            <div className="show-order-routes">
              <h2>Ruta del dispositivo</h2>
              {this.state.rutas.map((item)=>(
                <p>{item.destino.direccion === item.origen.direccion ? "Dispositivo en "+item.origen.direccion : "Salio de: "+item.origen.direccion+" hacia: "+item.destino.direccion}</p>
              ))}
              <a><Link to={'/rutas/'+this.state.id_orden}>Editar</Link></a>
            </div>
          </div>
        </div>
      </Aux>

    )
  }
}

export default Venta;
