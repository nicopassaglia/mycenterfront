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
      id_sale:"",
      url:'http://api.mycenter.rubick.co',
      fecha_creacion_orden:"",
      cliente:[],
      notas_orden:"",
      arreglo_servicios:[],
      arreglo_productos:[],
      datos_device:[],
      nuevo_estado_orden:"-1",
      device:"",
      arreglo_servicios_venta:[],
      arreglo_productos_venta:[],
      servicio_actual:"-1",
      oficina_servicio_actual:"-1",
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
      credito:0,
      debito:0,
      rutas:[],
      id_device_order:"",
      estado:{"T":"Tramite","E":"Entregada","F":"Finalizada"},
      cliente:[],
      office_entity:"",
      client_entity:"",
      deliver_date:null,
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.changeOrderState = this.changeOrderState.bind(this);
    this.isDelivered = this.isDelivered.bind(this);
    this.markAsFinished = this.markAsFinished.bind(this);
    this.confirmNewServices = this.confirmNewServices.bind(this);
    this.confirmNewProducts = this.confirmNewProducts.bind(this);
    this.removeProductFromOrder = this.removeProductFromOrder.bind(this);
    this.pay = this.pay.bind(this);
    this.addServiceToOrder =this.addServiceToOrder.bind(this);
    this.calculatePagos = this.calculatePagos.bind(this);
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

    if(this.state.datos_device.estado === "E"){

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
      if(this.state.nuevo_estado_orden === "E"){
        axios.patch(this.state.url+'/sales/'+this.state.id_sale+'/',{
          deliver_date:new Date().toISOString(),
        })
      }
      axios.patch(this.state.url+'/device_orders/'+this.state.id_device_order+'/',{
        state:this.state.nuevo_estado_orden,
      })
      .then(res=>{
        this.fetchDataDeviceOrder();
      })
    }
  }

 fetchData(){
    this.fetchDataDeviceOrder();
    this.fetchDataOrder();
    // this.fetchDataServices();
    this.fetchDataProducts();
    // this.fetchSerivcesToSell();
     this.fetchProductsToSell();
     this.fetchDataPayments();

  }
  fetchDataOrder(){
    axios.get(this.state.url+'/sales/'+this.state.id_orden)
    .then(res =>{
    //  console.log(res);
      this.setState({fecha_creacion_orden:res.data.time_created});
    });

  }


  fetchDataDeviceOrder(){

    let datos_device = [];
    axios.get(this.state.url+'/device_orders/?sale='+this.state.id_orden)
    .then(res => {
      console.log(res.data);
      if(res.data.length > 0){
        this.setState({id_device_order:res.data[0].id,id_sale:res.data[0].sale},function(){this.fetchDataServices();this.fetchDataRoutes();});
        datos_device['estado'] = res.data[0].state;
        datos_device['observaciones_generales'] = res.data[0].general_observations;
        datos_device['display_frontal'] = res.data[0].frontal_display;
        datos_device['estetica_general'] = res.data[0].general_aesthetics;
        datos_device['prende'] = res.data[0].turns_on;
        datos_device['touch_id'] = res.data[0].touch_id;
        datos_device['volume_button'] = res.data[0].volume_button;
        datos_device['lock_button'] = res.data[0].lock_button;
        datos_device['mute_button'] = res.data[0].mute_button;
        datos_device['altavoces'] = res.data[0].speakers;
        datos_device['mic'] = res.data[0].mic;
        datos_device['sensor_proximidad'] = res.data[0].proximty_sensor;
        datos_device['camara_frontal'] = res.data[0].frontal_camera;
        datos_device['camara_trasera'] = res.data[0].rear_camera;
        datos_device['pin_carga'] = res.data[0].charge_pin;
        datos_device['mojado'] = res.data[0].wet;
        this.setState({datos_device:datos_device});
      }
    });

  }
  fetchDataServices(){
    let arreglo_servicios = [];
    axios.get(this.state.url+'/saleservices/?order='+this.state.id_device_order)
    .then(async resservices =>{
      for(let i = 0;i<resservices.data.length;i++){

        arreglo_servicios[i] = [];
        arreglo_servicios[i]['monto'] = resservices.data[i].price_total;
        arreglo_servicios[i]['estado'] = resservices.data[i].state;
        arreglo_servicios[i]['sale_service_url'] = resservices.data[i].url;
        arreglo_servicios[i]['service_office_url'] = resservices.data[i].service_office;
        await axios.get(resservices.data[i].service_office)
        .then(async result =>{
          arreglo_servicios[i]['oficina_servicio'] = result.data.office_detail.address;
          arreglo_servicios[i]['servicio_url'] = result.data.service;
          await axios.get(result.data.service)
          .then(resultado=>{
            arreglo_servicios[i]['nombre_servicio'] = resultado.data.name;
            arreglo_servicios[i]['id_servicio'] = resultado.data.id;
            arreglo_servicios[i]['tiempo_en_garantia'] = resultado.data.warranty_period;
          })
        })
      }
      this.setState({arreglo_servicios:arreglo_servicios},function(){this.calcularMontoTotalServiciosEnOrden(); this.fetchSerivcesToSell();});


    })

  }
  fetchDataProducts(){
    let arreglo_productos = [];
    axios.get(this.state.url+'/saleproducts/?sale='+this.state.id_orden)
    .then(async resservices =>{
      for(let i = 0;i<resservices.data.length;i++){
        arreglo_productos[i] = [];
        arreglo_productos[i]['monto'] = resservices.data[i].price_total;
        arreglo_productos[i]['cantidad'] = resservices.data[i].quantity_sold;
        arreglo_productos[i]['url'] = resservices.data[i].url;
        // arreglo_productos[i]['url_product_office'] = resservices.data[i].product_office;
        await axios.get(resservices.data[i].product_office)
        .then(async result =>{
          arreglo_productos[i]['direccion_oficina'] = result.data.office_detail.address;
          await axios.get(result.data.product)
          .then(resproduct=>{
            arreglo_productos[i]['nombre_producto'] = resproduct.data.name;
            arreglo_productos[i]['id_producto'] = resproduct.data.id;
          })


        })
      }
      this.setState({arreglo_productos:arreglo_productos},function(){this.getMontoTotalProductosEnOrden();});

    })

  }

  fetchDataRoutes(){ //MODIFICAR CUANDO SE POPULE OFICINA EN RUTA
    let rutas = [];
    axios.get(this.state.url+'/route/?order='+this.state.id_device_order)
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


  fetchSerivcesToSell(){
    let servicios = [];
    let indice = 0;
    axios.get(this.state.url+'/services/')
    .then(async res=>{
      for(let i=0;i<res.data.length;i++){
        let agregar = true;
        for(let t = 0;t<this.state.arreglo_servicios.length;t++){
          if(this.state.arreglo_servicios[t].id_servicio === res.data[i].id){
            agregar = false;
          }
        }
        if(agregar){

          servicios[indice] = [];
          servicios[indice]['nombre'] = res.data[i].name;
          servicios[indice]['id_servicio'] = res.data[i].id;
          servicios[indice]['url'] = res.data[i].url;
          servicios[indice]['composicion'] = [];
          servicios[indice]['garantia'] = res.data[i].warranty_period;
          servicios[indice]['oficina'] = [];
          for(let j =0;j<res.data[i].service_office.length;j++){
            servicios[indice]['oficina'][j] = [];
            servicios[indice]['oficina'][j]['precio'] = res.data[i].service_office[j].price_per_unit;
            servicios[indice]['oficina'][j]['direccion'] = res.data[i].service_office[j].office_detail.address;
            servicios[indice]['oficina'][j]['url_direccion'] = res.data[i].service_office[j].office;
            servicios[indice]['oficina'][j]['entidad'] = res.data[i].service_office[j].office_detail.entity;
            servicios[indice]['oficina'][j]['id_direccion'] = res.data[i].service_office[j].office_detail.id;
            servicios[indice]['oficina'][j]['url_service_office'] = res.data[i].service_office[j].url;
            for(let j =0;j<res.data[i].service_composition.length;j++){
              servicios[indice]['composicion'][j]= [];
            //  servicios[i]['composicion'][j]['cantidad'] = res.data[i].service_composition[j].quantity;
              servicios[indice]['composicion'][j]['id_componente'] = res.data[i].service_composition[j].service_detail.id;
              servicios[indice]['composicion'][j]['url_componente'] = res.data[i].service_composition[j].service_detail.url;
              servicios[indice]['composicion'][j]['nombre_componente'] = res.data[i].service_composition[j].service_detail.name;
              //
              await axios.get(this.state.url+'/stock/?component='+res.data[i].service_composition[j].service_detail.id+'&office='+servicios[indice]['oficina'][j]['id_direccion'])
              .then(resstock=>{
                servicios[indice]['composicion'][j]['url_stock'] = resstock.data[0].url;
                servicios[indice]['composicion'][j]['stock'] = resstock.data[0].in_stock;
              })

            }

          }
          indice = indice + 1;
        }
      }

      this.setState({arreglo_servicios_venta:servicios});
    });

  }
  fetchProductsToSell(){

    let productos = [];
    let id_historico = -1;
    axios.get(this.state.url+'/products/')
    .then(async res=>{
      for(let i=0;i<res.data.length;i++){
        for(let t = 0;t<res.data[i].product_office.length;t++){
          if(res.data[i].product_office[t].office_detail.id == sessionStorage.getItem('oficina') ){
            productos[i] = [];
            productos[i]['nombre'] = res.data[i].name;
            productos[i]['id_producto'] = res.data[i].id;
            //productos[i]['precio'] = res.data[i].price;
            productos[i]['garantia'] = res.data[i].warranty_period;
            productos[i]['url'] = res.data[i].url;
            productos[i]['composicion'] = [];
            productos[i]['oficinas'] = [];
            productos[i]['oficinas']['precio'] = res.data[i].product_office[t].price_per_unit;
            productos[i]['oficinas']['direccion'] = res.data[i].product_office[t].office_detail.address;
            productos[i]['oficinas']['id_oficina'] = res.data[i].product_office[t].office_detail.id;
            productos[i]['oficinas']['url_product_office'] = res.data[i].product_office[t].url;
            for(let j =0;j<res.data[i].product_composition.length;j++){
              productos[i]['composicion'][j]= [];
              productos[i]['composicion'][j]['cantidad'] = res.data[i].product_composition[j].quantity;
              productos[i]['composicion'][j]['id_componente'] = res.data[i].product_composition[j].component_detail.id;
              productos[i]['composicion'][j]['url_componente'] = res.data[i].product_composition[j].component_detail.url;
              productos[i]['composicion'][j]['nombre_componente'] = res.data[i].product_composition[j].component_detail.name;
              await axios.get(this.state.url+'/stock/?component='+res.data[i].product_composition[j].component_detail.id+'&office='+productos[i]['oficinas']['id_oficina'])
              .then(resstock=>{
                productos[i]['composicion'][j]['url_stock'] = resstock.data[0].url;
                productos[i]['composicion'][j]['stock'] = resstock.data[0].in_stock;
              })
            }


          }
        }

      }
      console.log(productos);
      this.setState({arreglo_productos_venta:productos});
    });

  }

  fetchDataPayments(){
    let pagos_realizados = [];
    axios.get(this.state.url+'/transactions_sales/?sale='+this.state.id_orden)
    .then(async res =>{
      for(let i =0;i<res.data.length;i++){
        pagos_realizados[i] = [];
        pagos_realizados[i]['url_tipo'] = res.data[i].transaction.method;
        pagos_realizados[i]['monto'] = res.data[i].transaction.amount;
        pagos_realizados[i]['fecha'] = res.data[i].transaction.time_created;
        pagos_realizados[i]['oficina'] = res.data[i].office;
        await axios.get(pagos_realizados[i]['url_tipo'])
        .then(res2 =>{
          pagos_realizados[i]['tipo'] = res2.data.name;
        })
      }
      this.setState({pagos_realizados:pagos_realizados},()=>this.calculateDeuda());
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
  isInArray(id){ //funcion que deshabilita opcion del select

    for(let i = 0;i<this.state.arreglo_productos.length;i++){
      if(this.state.arreglo_productos[i].id_producto == id){
        return true;
      }
    }
    for(let j = 0;j<this.state.listado_productos_agregar_orden.length;j++){
      if(this.state.listado_productos_agregar_orden[j].id == id){
        return true;
      }
    }
    return false;

  }


  addServiceToOrder(event){
    event.preventDefault();
    var local_listado_servicios = this.state.listado_servicios_agregar_orden;
    var cant = local_listado_servicios.length;
    if(this.state.servicio_actual === "-1" || this.state.oficina_servicio_actual === "-1"){
      alert("Debes seleccionar servicio y sucursal");
    }else{
      for(let i = 0;i<this.state.arreglo_servicios_venta.length;i++){
        if(this.state.arreglo_servicios_venta[i].id_servicio == this.state.servicio_actual){
          for(let j = 0;j<this.state.arreglo_servicios_venta[i].oficina.length;j++){
            if(this.state.arreglo_servicios_venta[i].oficina[j].url_direccion == this.state.oficina_servicio_actual){
              local_listado_servicios[cant] = [];
              local_listado_servicios[cant]['id'] = this.state.arreglo_servicios_venta[i].id_servicio;
              local_listado_servicios[cant]['nombre'] = this.state.arreglo_servicios_venta[i].nombre;
              local_listado_servicios[cant]['quantity_sold'] = 1;
              local_listado_servicios[cant]['precio_unitario'] = this.state.arreglo_servicios_venta[i].oficina[j].precio;
              local_listado_servicios[cant]['monto'] = this.state.arreglo_servicios_venta[i].oficina[j].precio * local_listado_servicios[cant]['quantity_sold'];
              local_listado_servicios[cant]['url'] = this.state.arreglo_servicios_venta[i].url;
              local_listado_servicios[cant]['url_oficina'] = this.state.arreglo_servicios_venta[i].oficina[j].url;
              local_listado_servicios[cant]['direccion_oficina'] = this.state.arreglo_servicios_venta[i].oficina[j].direccion;
              local_listado_servicios[cant]['entidad_oficina'] = this.state.arreglo_servicios_venta[i].oficina[j].entidad;
              local_listado_servicios[cant]['garantia'] = this.state.arreglo_servicios_venta[i].garantia;
              local_listado_servicios[cant]['url_service_office'] = this.state.arreglo_servicios_venta[i].oficina[j].url_service_office;
              local_listado_servicios[cant]['composicion'] = [];
              for(let j =0; j<this.state.arreglo_servicios_venta[i].composicion.length;j++){
                local_listado_servicios[cant]['composicion'][j] = [];
                local_listado_servicios[cant]['composicion'][j]['id_componente'] = this.state.arreglo_servicios_venta[i].composicion[j].id_componente;
                local_listado_servicios[cant]['composicion'][j]['url_componente'] = this.state.arreglo_servicios_venta[i].composicion[j].url_componente;
                local_listado_servicios[cant]['composicion'][j]['stock'] = this.state.arreglo_servicios_venta[i].composicion[j].stock;
                local_listado_servicios[cant]['composicion'][j]['url_stock'] = this.state.arreglo_servicios_venta[i].composicion[j].url_stock;
              }
            }
          }
        }
      }

    }
    console.log(local_listado_servicios);
    this.setState({listado_servicios_agregar_orden:local_listado_servicios},()=>this.calcularMontoTotalServicios());


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
          order:this.state.url+'/device_orders/'+this.state.id_device_order+'/',
          service_office:local[i].url_service_office,
          price_total:local[i].monto,
          component_quantity:local[i].quantity_sold,
          state:"NF",
        })
        .then(res=>{
          local = [];
          this.setState({listado_servicios_agregar_orden:local},()=>this.calcularMontoTotalServiciosNuevos());
          this.fetchDataServices();
        })
      }
    }

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
        if(this.state.arreglo_productos_venta[i].id_producto == this.state.producto_actual){
          local_listado[cant] = [];
          local_listado[cant]['id'] = this.state.arreglo_productos_venta[i].id_producto;
          local_listado[cant]['url'] = this.state.arreglo_productos_venta[i].url;
          local_listado[cant]['nombre'] = this.state.arreglo_productos_venta[i].nombre;
          local_listado[cant]['quantity_sold'] = 1;
          local_listado[cant]['precio_unitario'] = this.state.arreglo_productos_venta[i].oficinas.precio;
          local_listado[cant]['monto'] = this.state.arreglo_productos_venta[i].oficinas.precio * local_listado[cant]['quantity_sold'];
          local_listado[cant]['url_product_office'] = this.state.arreglo_productos_venta[i].oficinas.url_product_office;
          local_listado[cant]['composicion'] = [];
          for(let j =0; j<this.state.arreglo_productos_venta[i].composicion.length;j++){
            local_listado[cant]['composicion'][j] = [];
            local_listado[cant]['composicion'][j]['id_componente'] = this.state.arreglo_productos_venta[i].composicion[j].id_componente;
            local_listado[cant]['composicion'][j]['url_componente'] = this.state.arreglo_productos_venta[i].composicion[j].url_componente;
            local_listado[cant]['composicion'][j]['stock'] = this.state.arreglo_productos_venta[i].composicion[j].stock;
            local_listado[cant]['composicion'][j]['url_stock'] = this.state.arreglo_productos_venta[i].composicion[j].url_stock;
          }

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
          sale:this.state.url+'/sales/'+this.state.id_orden+'/',
          product_office:local[i].url_product_office,
          price_total:local[i].monto,
          quantity_sold:local[i].quantity_sold,
        })
        .then(res=>{
          local = [];
          this.setState({listado_productos_agregar_orden:local},()=>this.calcularMontoTotalProductosNuevos());
          this.fetchDataProducts();
        })
      }
    }

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
  isDisabledService(id_servicio){
    let isIn = false;
    for(let i =0;i<this.state.listado_servicios_agregar_orden.length;i++){

      if(id_servicio == this.state.listado_servicios_agregar_orden[i].id){
        isIn = true;;
      }else{

      }
    }
    return isIn;

  }
  getWarrantyDate(daysInWarranty){
    var fecha = new Date();
    fecha.setDate(fecha.getDate() + daysInWarranty);
    var date = fecha.getDate(); //Current Date
    var month = fecha.getMonth() + 1; //Current Month
    var year = fecha.getFullYear(); //Current Year

    return date+"/"+month+"/"+year;
  }
  async pay(){
    if(this.state.efectivo > 0){
      await axios.post(this.state.url+'/transactions_sales/',{
        sale:this.state.url+'/sales/'+this.state.id_orden+'/',
        transaction:{
          amount:this.state.efectivo,
          transaction_type:"DEP",
          method:"http://127.0.0.1:8000/payment_methods/1/",
          office:this.state.office_entity,
          third:this.state.client_entity,
        },

      })
      .then(res =>{

      })
    }
    if(this.state.credito > 0){
      await axios.post(this.state.url+'/transactions_sales/',{
        sale:this.state.url+'/sales/'+this.state.id_orden+'/',
        transaction:{
          amount:this.state.credito,
          transaction_type:"DEP",
          method:"http://127.0.0.1:8000/payment_methods/3/",
          office:this.state.office_entity,
          third:this.state.client_entity,
        },
      })
      .then(res =>{

      })
    }
    if(this.state.debito > 0){
      await axios.post(this.state.url+'/transactions_sales/',{
        sale:this.state.url+'/sales/'+this.state.id_orden+'/',
        transaction:{
          amount:this.state.debito,
          transaction_type:"DEP",
          method:"http://127.0.0.1:8000/payment_methods/2/",
          office:this.state.office_entity,
          third:this.state.client_entity,
        },
      })
      .then(res =>{

      })
    }
      // if(this.state.efectivo > 0){
      //   await axios.post(this.state.url+'/payment/',{
      //     payment_type:"E",
      //     order:this.state.url+'/orders/'+this.state.id_orden+'/',
      //     amount:this.state.efectivo
      //   })
      //   .then(res =>{
      //
      //
      //   })
      // }
      // if(this.state.tarjeta > 0){
      //   await axios.post(this.state.url+'/payment/',{
      //     payment_type:"C",
      //     order:this.state.url+'/orders/'+this.state.id_orden+'/',
      //     amount:this.state.tarjeta,
      //   })
      //   .then(res =>{
      //
      //   })
      // }
      this.fetchDataPayments();
      this.setState({efectivo:0,tarjeta:0});


  }
  calculatePagos(porcEfectivo,porcDebito,porcCredito){
    let montoEnEfectivo = 0;
    let montoEnDebito = 0;
    let montoEnCredito = 0;
    let montoTotal = this.state.monto_total_servicios_en_orden + this.state.monto_total_productos_en_orden;

    montoEnEfectivo = (porcEfectivo/100) * montoTotal;
    montoEnDebito = (porcDebito/100) * montoTotal;
    montoEnCredito = (porcCredito/100) * montoTotal *1.25;

    this.setState({credito:montoEnCredito,debito:montoEnDebito,efectivo:montoEnEfectivo});
  }
  getOfficeEntity(){
    axios.get(this.state.url+'/offices/')
    .then(res =>{
      for(let i =0;i<res.data.length;i++){
        if(res.data[i].id == sessionStorage.getItem('oficina')){
          //alert(res.data[i].entity);
          this.setState({office_entity:res.data[i].entity});
        }
      }
    })
  }
  getClientData(){
    let cliente = [];
    axios.get(this.state.url+"/sales/"+this.state.id_orden+"/")
    .then(async res =>{
      this.setState({deliver_date:res.data.deliver_date});
      await axios.get(res.data.client)
      .then(resclient=>{
        cliente['nombre'] = resclient.data.first_name + " "+resclient.data.last_name;

        this.setState({client_entity:resclient.data.entity,cliente:cliente});
      })
    })
  }

  getFinGarantia(cantidadDiasEnGarantia){

    var fecha = new Date(this.state.deliver_date);
    fecha.setDate(fecha.getDate() + cantidadDiasEnGarantia);
    var date = fecha.getDate(); //Current Date
    var month = fecha.getMonth() + 1; //Current Month
    var year = fecha.getFullYear(); //Current Year

    return date+"/"+month+"/"+year;

  }
  componentDidMount(){
    const {id} = this.props.match.params;
    this.setState({id_orden:id},function(){this.fetchData();this.getClientData()});
    this.getOfficeEntity();


  }
  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-single-order">
          <div className="wrapper-single-order-container">
            <div className="wrapper-single-order-orden">
              <h3>Nro de Orden: {this.state.id_orden}</h3>
              <p><strong>Cliente: </strong>{this.state.cliente.nombre}</p>
              <p><strong>Fecha creacion de Orden:</strong> {this.state.fecha_creacion_orden}</p>
              {this.state.id_device_order === "" ? "": <div><p><strong>Estado: </strong>{this.state.estado[this.state.datos_device.estado]}</p>
                <p><strong>Prende: </strong>{this.state.datos_device.prende === true ? "Si" : "No"}</p>
                <p><strong>Estaba mojado: </strong>{this.state.datos_device.mojado === true ? "Si" : "No"}</p>
                <p><strong>Andaba Boton Volumen: </strong>{this.state.datos_device.volume_button === true ? "Si" : "No"}</p>
                <p><strong>Andaba Microfono: </strong>{this.state.datos_device.mic === true ? "Si" : "No"}</p>
                <p><strong>Andaban Altavoces: </strong>{this.state.datos_device.altavoces === true ? "Si" : "No"}</p>
                <p><strong>Andaba Boton bloqueo: </strong>{this.state.datos_device.lock_button === true ? "Si" : "No"}</p>
                <p><strong>Estetica General: </strong>{this.state.datos_device.estetica_general === true ? "Bien" : "Mal"}</p>
                <p><strong>Touch Id: </strong>{this.state.datos_device.touch_id === true ? "Si" : "No"}</p>
                <p><strong>Display Frontal: </strong>{this.state.datos_device.display_frontal === true ? "Si" : "No"}</p>
                <p><strong>Camara Frontal: </strong>{this.state.datos_device.camara_frontal === true ? "Si" : "No"}</p>
                <p><strong>Camara Trasera: </strong>{this.state.datos_device.camara_trasera === true ? "Si" : "No"}</p>
                <p><strong>Boton Silencio: </strong>{this.state.datos_device.mute_button === true ? "Si" : "No"}</p>
                <p><strong>Sensor Proximidad: </strong>{this.state.datos_device.sensor_proximidad === true ? "Si" : "No"}</p>
                <p><strong>Pin de Carga: </strong>{this.state.datos_device.pin_carga === true ? "Si" : "No"}</p>
                <p><strong>Observacines Generales: </strong>{this.state.datos_device.observaciones_generales}</p>

                {this.isDelivered() ? <p><strong>Entregado el: </strong>{new Date(this.state.deliver_date).toLocaleString()}</p> : <Aux><select onChange={this.handleInputChange} name="nuevo_estado_orden" value={this.state.nuevo_estado_orden}>
                  <option value="-1">Cambiar de estado</option>
                  <option value="T">Tramite</option>
                  <option value="F">Finalizada</option>
                  <option value="E">Entregada</option>
                </select>
                <button onClick={this.changeOrderState}>Cambiar de Estado</button></Aux>}
                </div>
              }



            </div>
            <div className="wrapper-single-order-servicios">
              <h2>Servicios</h2>



              {this.state.arreglo_servicios.map((item)=>(
                <div className="wrapper-single-order-servicios-item">
                  <p><strong>Servicio: </strong>{item.nombre_servicio} en {item.oficina_servicio}</p>
                  <p><strong>Monto: </strong>${item.monto}</p>
                  <p><strong>Estado: </strong>{item.estado}</p>
                  {item.estado === "NF" ? <button onClick={()=>this.markAsFinished(item.sale_service_url)}>Marcar como terminado</button> : ""}
                  {this.isDelivered() ? <p><strong>Garantia hasta: </strong>{this.getFinGarantia(item.tiempo_en_garantia)}</p> :<button onClick={()=>this.removeServiceFromOrder(item.sale_service_url)}>Eliminar Servicio de orden</button> }
                </div>
              ))}
              <p><strong>Total en Servicios Ya en Orden: </strong>${this.state.monto_total_servicios_en_orden}</p>

            </div>
            <div className="wrapper-single-order-productos">
              <h2>Productos</h2>
              {this.state.arreglo_productos.map((item)=>(
                <div className="wrapper-single-order-servicios-item">
                  <p><strong>Producto: </strong>{item.nombre_producto} en {item.direccion_oficina}</p>
                  <p><strong>Monto: </strong>${item.monto}</p>
                  <p><strong>Cantidad: </strong>{item.cantidad}</p>
                  {this.isDelivered() ? "" : <button onClick={()=>this.removeProductFromOrder(item.url)}>Eliminar Producto de orden</button> }

                </div>
              ))}
              <p><strong>Total en Productos Ya en Orden: </strong>${this.state.monto_total_productos_en_orden}</p>
            </div>



            {this.isDelivered() || this.state.id_device_order === "" ?
              ""
              :

              <div className="wrapper-single-order-newservice"><h2>Agregar Servicio a la orden</h2>
              <select onChange={this.handleInputChange} name="servicio_actual" value={this.state.servicio_actual}>
                <option value="-1">Seleccionar Servicio</option>
                {this.state.arreglo_servicios_venta.map((item)=>(
                  // <option value={item.id_servicio}>{item.nombre} - {item.oficina.direccion} -- {item.composicion.map((component)=>{return component.nombre_componente +" en stock: "+component.stock})} </option>
                  <option disabled={this.isDisabledService(item.id_servicio)} value={item.id_servicio}>{item.nombre}</option>

                ))}
                </select><br/><br/>
                <select onChange={this.handleInputChange} name="oficina_servicio_actual" value={this.state.oficina_servicio_actual}>
                  <option value="-1">Seleccionar Oficina donde se realiza</option>
                  {this.state.arreglo_servicios_venta.map((item)=>{
                    return item.id_servicio == this.state.servicio_actual ? item.oficina.map((item2)=>(
                      <option value={item2.url_direccion}>{item2.direccion} (${item2.precio})</option>
                    )) : ""
                  }

                  )}
                  </select><br/>
                <button onClick={this.addServiceToOrder}>Agregar</button>

              {//-----------
              }
               {//<select onChange={this.handleInputChange} name="servicio_actual" value={this.state.servicio_actual}>
              // <option value="-1">Seleccionar Servicio</option>
              // {this.state.arreglo_servicios_venta.map((item)=>(
              //   <option value={item.id}>{item.nombre}</option>
              // ))}
              // </select>
              //
              // <button onClick={(event) => this.addServiceToOrder(event)}>Agregar</button>
              }
              <h3>Resumen Servicios Agregados</h3>
              {this.state.listado_servicios_agregar_orden.map((item)=>(
                <p>{item.nombre} en {item.direccion_oficina}<br/><br/><input onChange={event => this.updateAmountServiceOrder(event,item.id)} type="number" value={item.quantity_sold} /> $<input type='number' value={item.monto} onChange={event => this.changeMontoServiceinOrder(event,item.id)} /> (${item.precio_unitario}) <button onClick={()=>this.removeItemServicios(item.id)}>X</button><br/><br/>
                <strong>Garantia Hasta:</strong> {this.getWarrantyDate(item.garantia)}
                </p>
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
            <option value="-1">Seleccionar Productos</option>
            {this.state.arreglo_productos_venta.map((item)=>(
              <option key={item.id_producto} disabled={this.isInArray(item.id_producto)} value={item.id_producto}>{item.nombre} (${item.oficinas.precio}) en {item.oficinas.direccion}</option>
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
              {this.isDelivered() ? "" :<Aux><label>Cantidad en Efectivo</label> <input type="number" min="0" onChange={this.handleInputChange} name="efectivo" value={this.state.efectivo} /><br/>
              <label>Cantidad con Debito</label> <input type="number" min="0" onChange={this.handleInputChange} name="debito" value={this.state.debito} /><br/>
              <label>Cantidad con Credito</label> <input type="number" min="0" onChange={this.handleInputChange} name="credito" value={this.state.credito} /><br/>
              <button onClick={()=>this.calculatePagos(100,0,0)}>Total en efectivo</button><button onClick={()=>this.calculatePagos(0,100,0)}>Total en debito</button>
              <button onClick={()=>this.calculatePagos(0,0,100)}>Total en credito</button><button onClick={()=>this.calculatePagos(50,0,50)}>Mitad en efectivo Mitad Credito</button>
              <button onClick={()=>this.calculatePagos(0,50,50)}>Mitad en Debito Mitad en Credito</button><br/><br/>
              <button onClick={this.pay}>Confirmar Pago</button> </Aux>}


            </div>
            <div className="show-order-routes">
              <h2>Ruta del dispositivo</h2>
              {this.isDelivered() ?
              <p>Dispositivo Entregado</p>
              :
              <Aux>

              {this.state.rutas.map((item)=>(
                <p>{item.destino.direccion === item.origen.direccion ? "Dispositivo en "+item.origen.direccion : "Salio de: "+item.origen.direccion+" hacia: "+item.destino.direccion}</p>
              ))}

              <a><Link to={'/rutas/'+this.state.id_device_order}>Editar</Link></a>
              </Aux>
              }

            </div>
          </div>
        </div>
      </Aux>

    )
  }
}

export default Venta;
