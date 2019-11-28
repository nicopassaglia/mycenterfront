import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import { Redirect } from 'react-router-dom';
import './NewVenta.css';
import axios from 'axios';

class NewVenta extends Component{
  constructor(props){
    super(props);
    this.state ={
      url:'http://127.0.0.1:8000',
      reparacion:false,
      wet:false,
      turns_on:true,
      frontal_display:true,
      touch_id:true,
      volume_button:true,
      lock_button:true,
      mute_button:true,
      speakers:true,
      mic:true,
      proximity_sensor:true,
      frontal_camera:true,
      rear_camera:true,
      charge_pin:true,
      general_aesthetics:true,
      general_observations:"",
      is_paying:false,
      productos:[],
      servicios:[],
      producto_actual:"-1",
      servicio_actual:"-1",
      service_office_actual:"-1",
      oficina_servicio_actual:"-1",
      listado_productos_orden:[],
      listado_servicios_orden:[],
      clientes:[],
      clientes_filtrado:[],
      filter_cliente_name:"",
      cliente_seleccionado:"-1",
      dispositivo_seleccionado:"-1",
      dispositivos_cliente:[],
      monto_total:0,
      monto_total_servicios:0,
      monto_total_productos:0,
      efectivo:0,
      credito:0,
      debito:0,
      redirect:false,
      id_nueva_orden:'',
      stock:[],
      office_entity:'',
      client_entity:'',
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.sendOrder = this.sendOrder.bind(this);
    this.addProductToOrder = this.addProductToOrder.bind(this);
    this.addServiceToOrder = this.addServiceToOrder.bind(this);
    this.updateAmountProductOrder = this.updateAmountProductOrder.bind(this);
    this.calcularMontoTotalServicios = this.calcularMontoTotalServicios.bind(this);
    this.calcularMontoTotalProductos = this.calcularMontoTotalProductos.bind(this);
    this.removeItemProductos = this.removeItemProductos.bind(this);
    this.changeMontoProductinOrder = this.changeMontoProductinOrder.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;


    if(name === "cliente_seleccionado" || name === "dispositivo_seleccionado"){
      let empty = [];
      this.setState({listado_servicios_orden:empty},()=>this.calcularMontoTotalServicios());
    }
    if(name === "cliente_seleccionado" && value != "-1"){
      let cli = this.state.clientes.filter(function(cliente){return cliente.id == value});
      // alert(cli[0].entidad);
      this.setState({client_entity:cli[0].entidad});
    }
    if(name === "filter_cliente_name"){
      this.filter(value);
    }

    this.setState({
      [name]: value
    });

  }

  filter(apellido){
    let clientes = this.state.clientes;


    if(apellido != ""){
      clientes = clientes.filter(function(cliente){return cliente.nombre.toLowerCase().includes(apellido.toLowerCase())});

    }
    this.setState({clientes_filtrado:clientes});
  }

  // populateOffices(){
  //
  // }

  getWarrantyDate(daysInWarranty){
    var fecha = new Date();
    fecha.setDate(fecha.getDate() + daysInWarranty);
    var date = fecha.getDate(); //Current Date
    var month = fecha.getMonth() + 1; //Current Month
    var year = fecha.getFullYear(); //Current Year

    return date+"/"+month+"/"+year;
  }


  getClientes(){
    let clientes = [];
    let dispositivos = [];

    axios.get(this.state.url+'/clients/')
    .then(res=>{
      for(let i =0;i<res.data.length;i++){
        clientes[i] = [];
        clientes[i]['dni'] = res.data[i].person_id;
        clientes[i]['id'] = res.data[i].id;
        clientes[i]['nombre'] = res.data[i].first_name + " "+res.data[i].last_name;
        clientes[i]['entidad'] = res.data[i].entity;
        clientes[i]['dispositivos'] = [];

        for(let j =0;j<res.data[i].devices.length;j++){
          clientes[i]['dispositivos'][j] = [];
          clientes[i]['dispositivos'][j]['modelo'] = res.data[i].devices[j].modelinfo.name;
          clientes[i]['dispositivos'][j]['imei'] = res.data[i].devices[j].imei;
          clientes[i]['dispositivos'][j]['url'] = res.data[i].devices[j].url;
          clientes[i]['dispositivos'][j]['color'] = res.data[i].devices[j].color;
          clientes[i]['dispositivos'][j]['capacity'] = res.data[i].devices[j].capacity;
          clientes[i]['dispositivos'][j]['id'] = res.data[i].devices[j].id;

        }


      }
      console.log(clientes);
      this.setState({clientes:clientes,clientes_filtrado:clientes});
    })
  }


  componentDidMount(){
    this.getProductos();
    this.getServicios();
    this.getClientes();
    this.getOfficeEntity();
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

  // getStock(){
  //   let stock = [];
  //   axios.get(this.state.url+'/stock/')
  //   .then(res=>{
  //     for(let i = 0; i<res.data.length;i++){
  //       stock[i] = [];
  //       stock[i]['url_componente'] = res.data[i].component;
  //       stock[i]['office'] = res.data[i].office;
  //       stock[i]['in_stock'] = res.data[i].in_stock;
  //     }
  //   })
  // }

  isInArray(id){ //funcion que deshabilita opcion del select

    for(let i =0;i<this.state.listado_productos_orden.length;i++){

      if(this.state.listado_productos_orden[i].id == id){

        return true;
      }else{

      }
    }
    return false;

  }

  /////////////////////////////PRODUCTOS//////////////////////////////
  getProductos(){
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
            productos[i]['oficinas']['url_service_office'] = res.data[i].product_office[t].url;
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
      this.setState({productos:productos});
    });

  }
  addProductToOrder(event){
    event.preventDefault();
    var local_listado = this.state.listado_productos_orden;
    var cant = local_listado.length;
    if(this.state.producto_actual === "-1"){
      alert("Debes seleccionar un producto");
    }else{
      for(let i = 0;i<this.state.productos.length;i++){
        if(this.state.productos[i].id_producto == this.state.producto_actual){
          local_listado[cant] = [];
          local_listado[cant]['id'] = this.state.productos[i].id_producto;
          local_listado[cant]['url'] = this.state.productos[i].url;
          local_listado[cant]['nombre'] = this.state.productos[i].nombre;
          local_listado[cant]['quantity_sold'] = 1;
          local_listado[cant]['precio_unitario'] = this.state.productos[i].oficinas.precio;
          local_listado[cant]['monto'] = this.state.productos[i].oficinas.precio * local_listado[cant]['quantity_sold'];
          local_listado[cant]['url_service_office'] = this.state.productos[i].oficinas.url_service_office;
          local_listado[cant]['composicion'] = [];
          for(let j =0; j<this.state.productos[i].composicion.length;j++){
            local_listado[cant]['composicion'][j] = [];
            local_listado[cant]['composicion'][j]['id_componente'] = this.state.productos[i].composicion[j].id_componente;
            local_listado[cant]['composicion'][j]['url_componente'] = this.state.productos[i].composicion[j].url_componente;
            local_listado[cant]['composicion'][j]['stock'] = this.state.productos[i].composicion[j].stock;
            local_listado[cant]['composicion'][j]['url_stock'] = this.state.productos[i].composicion[j].url_stock;
          }

        }
      }

    }
    this.setState({listado_productos_orden:local_listado},()=>this.calcularMontoTotalProductos());

  }

  calcularMontoTotalProductos(){

    this.setState({producto_actual:"-1"});
    let monto = 0;

    for(let i = 0;i<this.state.listado_productos_orden.length;i++){
      monto += Number(this.state.listado_productos_orden[i].monto);
      //alert(monto);

    }
    this.setState({monto_total_productos:monto});
  }

  updateAmountProductOrder(event,idProducto){
      var local_listado = this.state.listado_productos_orden;
      const value = event.target.value;
      //alert(value);
      for(let i =0;i<local_listado.length;i++){

        if(local_listado[i].id === idProducto){
          local_listado[i]['quantity_sold'] = value;
          local_listado[i]['monto'] = value * local_listado[i].precio_unitario;


        }
      }
      this.setState({listado_productos_orden:local_listado},()=>this.calcularMontoTotalProductos());
  }

  removeItemProductos(id){
    let listado_local = this.state.listado_productos_orden;

    for(let i =0;i<listado_local.length;i++){
      if(listado_local[i].id == id){
        //listado_local.splice(i,1);
        listado_local.splice(i,1);

      }
    }
    this.setState({listado_productos_orden:listado_local},()=>this.calcularMontoTotalProductos());


  }

  changeMontoProductinOrder(event,idProducto){
  //  alert(idProducto);
    const monto = event.target.value;
    let listado_local = this.state.listado_productos_orden;

    for(let i = 0; i<listado_local.length; i++){
      if(listado_local[i].id == idProducto){
        listado_local[i]['monto'] = monto;

      }
    }
    this.setState({listado_productos_orden:listado_local},()=>this.calcularMontoTotalProductos());
  }

  /////////////////////////////SERVICIOS///////////////////////////

  getServicios(){
    let servicios = [];

    axios.get(this.state.url+'/services/')
    .then(async res=>{
      for(let i=0;i<res.data.length;i++){
        servicios[i] = [];
        servicios[i]['nombre'] = res.data[i].name;
        servicios[i]['id_servicio'] = res.data[i].id;
        servicios[i]['url'] = res.data[i].url;
        servicios[i]['composicion'] = [];
        servicios[i]['garantia'] = res.data[i].warranty_period;
        servicios[i]['oficina'] = [];
        for(let j =0;j<res.data[i].service_office.length;j++){
          servicios[i]['oficina'][j] = [];
          servicios[i]['oficina'][j]['precio'] = res.data[i].service_office[j].price_per_unit;
          servicios[i]['oficina'][j]['direccion'] = res.data[i].service_office[j].office_detail.address;
          servicios[i]['oficina'][j]['url_direccion'] = res.data[i].service_office[j].office;
          servicios[i]['oficina'][j]['entidad'] = res.data[i].service_office[j].office_detail.entity;
          servicios[i]['oficina'][j]['id_direccion'] = res.data[i].service_office[j].office_detail.id;
          servicios[i]['oficina'][j]['url_service_office'] = res.data[i].service_office[j].url;
          for(let j =0;j<res.data[i].service_composition.length;j++){
            servicios[i]['composicion'][j]= [];
          //  servicios[i]['composicion'][j]['cantidad'] = res.data[i].service_composition[j].quantity;
            servicios[i]['composicion'][j]['id_componente'] = res.data[i].service_composition[j].service_detail.id;
            servicios[i]['composicion'][j]['url_componente'] = res.data[i].service_composition[j].service_detail.url;
            servicios[i]['composicion'][j]['nombre_componente'] = res.data[i].service_composition[j].service_detail.name;
            //
            await axios.get(this.state.url+'/stock/?component='+res.data[i].service_composition[j].service_detail.id+'&office='+servicios[i]['oficina'][j]['id_direccion'])
            .then(resstock=>{
              servicios[i]['composicion'][j]['url_stock'] = resstock.data[0].url;
              servicios[i]['composicion'][j]['stock'] = resstock.data[0].in_stock;
            })

        }

        }
    }
      console.log(servicios);
      this.setState({servicios:servicios});
    });

  }



  addServiceToOrder(event){
    event.preventDefault();
    var local_listado_servicios = this.state.listado_servicios_orden;
    var cant = local_listado_servicios.length;
    if(this.state.servicio_actual === "-1" || this.state.oficina_servicio_actual === "-1"){
      alert("Debes seleccionar servicio y sucursal");
    }else{
      for(let i = 0;i<this.state.servicios.length;i++){
        if(this.state.servicios[i].id_servicio == this.state.servicio_actual){
          for(let j = 0;j<this.state.servicios[i].oficina.length;j++){
            if(this.state.servicios[i].oficina[j].url_direccion == this.state.oficina_servicio_actual){
              local_listado_servicios[cant] = [];
              local_listado_servicios[cant]['id'] = this.state.servicios[i].id_servicio;
              local_listado_servicios[cant]['nombre'] = this.state.servicios[i].nombre;
              local_listado_servicios[cant]['quantity_sold'] = 1;
              local_listado_servicios[cant]['precio_unitario'] = this.state.servicios[i].oficina[j].precio;
              local_listado_servicios[cant]['monto'] = this.state.servicios[i].oficina[j].precio * local_listado_servicios[cant]['quantity_sold'];
              local_listado_servicios[cant]['url'] = this.state.servicios[i].url;
              local_listado_servicios[cant]['url_oficina'] = this.state.servicios[i].oficina[j].url;
              local_listado_servicios[cant]['direccion_oficina'] = this.state.servicios[i].oficina[j].direccion;
              local_listado_servicios[cant]['entidad_oficina'] = this.state.servicios[i].oficina[j].entidad;
              local_listado_servicios[cant]['garantia'] = this.state.servicios[i].garantia;
              local_listado_servicios[cant]['id_service_office'] = this.state.servicios[i].oficina[j].url_service_office;
              local_listado_servicios[cant]['composicion'] = [];
              for(let j =0; j<this.state.servicios[i].composicion.length;j++){
                local_listado_servicios[cant]['composicion'][j] = [];
                local_listado_servicios[cant]['composicion'][j]['id_componente'] = this.state.servicios[i].composicion[j].id_componente;
                local_listado_servicios[cant]['composicion'][j]['url_componente'] = this.state.servicios[i].composicion[j].url_componente;
                local_listado_servicios[cant]['composicion'][j]['stock'] = this.state.servicios[i].composicion[j].stock;
                local_listado_servicios[cant]['composicion'][j]['url_stock'] = this.state.servicios[i].composicion[j].url_stock;
              }
            }
          }
        }
      }

    }
    console.log(local_listado_servicios);
    this.setState({listado_servicios_orden:local_listado_servicios},()=>this.calcularMontoTotalServicios());

  }

  isDisabledService(id_servicio){
    let isIn = false;
    for(let i =0;i<this.state.listado_servicios_orden.length;i++){

      if(id_servicio == this.state.listado_servicios_orden[i].id){
        isIn = true;;
      }else{

      }
    }
    return isIn;

  }

  calcularMontoTotalServicios(){

    this.setState({servicio_actual:"-1"});
    let monto = 0;

    for(let i = 0;i<this.state.listado_servicios_orden.length;i++){
      monto += Number(this.state.listado_servicios_orden[i].monto);
      //alert(monto);

    }
    this.setState({monto_total_servicios:monto});
  }



  updateAmountServiceOrder(event,idServicio){
    var local_listado = this.state.listado_servicios_orden;
    const value = event.target.value;
    //alert(value);
    for(let i =0;i<local_listado.length;i++){

      if(local_listado[i].id === idServicio){
        local_listado[i]['quantity_sold'] = value;
        local_listado[i]['monto'] = value * local_listado[i].precio_unitario;


      }
    }
    this.setState({listado_servicios_orden:local_listado},()=>this.calcularMontoTotalServicios());
  }




  changeMontoServiceinOrder(event,idServicio){
    const monto = event.target.value;
    let listado_local = this.state.listado_servicios_orden;

    for(let i = 0; i<listado_local.length; i++){
      if(listado_local[i].id == idServicio){
        listado_local[i]['monto'] = monto;

      }
    }
    this.setState({listado_servicios_orden:listado_local},()=>this.calcularMontoTotalServicios());
  }

  removeItemServicios(id){
    let listado_local = this.state.listado_servicios_orden;

    for(let i =0;i<listado_local.length;i++){
      if(listado_local[i].id == id){
        //listado_local.splice(i,1);
        listado_local.splice(i,1);

      }
    }
    this.setState({listado_servicios_orden:listado_local},()=>this.calcularMontoTotalServicios());
  }


  terminarOrden(){
    this.sendOrder();
    this.setState({redirect:true});
  }
  async sendOrder(){
    let arreglo_productos = this.state.listado_productos_orden;
    let arreglo_servicios = this.state.listado_servicios_orden;
    let mandar = true;
    if(arreglo_productos.length === 0 && arreglo_servicios.length === 0){
      alert("No puedes cargar una orden vacia");
      mandar = false;
    }
    else if(this.state.cliente_seleccionado === "-1"){
      alert("Seleccionar cliente");
    }
    else if(arreglo_servicios.length > 0){

      if(this.state.dispositivo_seleccionado==="-1"){
        alert("Debes selccionar un dipsositivo a arreglar");
        mandar = false;
      }
    }
    // else if(Number(this.state.tarjeta) + Number(this.state.efectivo) > (this.state.monto_total_productos + this.state.monto_total_servicios)){
    //
    //   alert("El monto a pagar es mayor al total");
    // }
    if(mandar){
      let id = sessionStorage.getItem('id');
      await axios.post(this.state.url+'/sales/',{
        client:this.state.url+'/clients/'+this.state.cliente_seleccionado+'/',
        initial_office:this.state.url+'/offices/'+sessionStorage.getItem('oficina')+'/',
        saleperson:this.state.url+'/users/'+id+'/',
      })
      .then(res=>{
        let sale_url = res.data.url;
        let sale_id = res.data.id;
        this.setState({id_nueva_orden:res.data.id});

        if(arreglo_productos.length != 0){

          for(let i = 0;i<arreglo_productos.length;i++){
            //alert(arreglo_productos[i].url);
            axios.post(this.state.url+'/saleproducts/',{
              product_office:arreglo_productos[i].url_service_office,
              sale:sale_url,
              price_total:arreglo_productos[i].monto,
              quantity_sold:arreglo_productos[i].quantity_sold,

            })
            .then(async res=>{
              for(let t=0;t<arreglo_productos[i].composicion.length;t++){
                await axios.patch(arreglo_productos[i].composicion[t].url_stock,{
                  in_stock:(Number(arreglo_productos[i].composicion[t].stock) - Number(arreglo_productos[i].quantity_sold)),
                })
                .then(async resstock=>{

                }); //END THEN STOCK
              }
            })
          } //END FOR
        }//END IF LENGTH 0 PRODUCTOS

        if(arreglo_servicios.length !=0){
          axios.post(this.state.url+'/device_orders/',{
            state:"T",
            general_observations:this.state.general_observations,
            frontal_display:this.state.frontal_display,
            general_aesthetics:this.state.general_aesthetics,
            turns_on:this.state.turns_on,
            touch_id:this.state.touch_id,
            volume_button:this.state.volume_button,
            lock_button:this.state.lock_button,
            mute_button:this.state.mute_button,
            speakers:this.state.speakers,
            mic:this.state.mic,
            proximty_sensor:this.state.proximity_sensor,
            frontal_camera:this.state.frontal_camera,
            rear_camera:this.state.rear_camera,
            charge_pin:this.state.charge_pin,
            wet:this.state.wet,
            device:this.state.dispositivo_seleccionado,
            sale:sale_id,
            authorization_number:1,
          })
          .then(resdeviceorder=>{
            console.log(resdeviceorder);
            var id_orden = this.state.url+"/device_orders/"+resdeviceorder.data.id+"/";

            axios.post(this.state.url+'/route/',{
              source_office:this.state.url+'/offices/'+sessionStorage.getItem('oficina')+'/',
              destination_office:this.state.url+'/offices/'+sessionStorage.getItem('oficina')+'/',
              order:id_orden,
              notes:"Oficina donde se recibio",
              user:this.state.url+'/users/'+sessionStorage.getItem('id')+'/',
              finished:true,
            })
            .then(res =>{

            });
            for(let j = 0; j<arreglo_servicios.length; j++){
              axios.post(this.state.url+'/saleservices/',{
                order:id_orden,
                service_office:arreglo_servicios[j].id_service_office,
                price_total:arreglo_servicios[j].monto,
                component_quantity:arreglo_servicios[j].quantity_sold,
                state:"NF",

              })
              .then(async res =>{

                for(let t=0;t<arreglo_servicios[j].composicion.length;t++){
                  await axios.patch(arreglo_servicios[j].composicion[t].url_stock,{
                    in_stock:(Number(arreglo_servicios[j].composicion[t].stock) - Number(arreglo_servicios[j].quantity_sold)),
                  })
                  .then(async resstock=>{

                  }); //END THEN STOCK
                }//END FOR
              }); //END THEN SALE SERVICE
            }// END FOR SERVICES

          });//END THEN DEVICE ORDER`


        }

          if(this.state.is_paying){
            if(this.state.efectivo > 0){
              axios.post(this.state.url+'/transactions_sales/',{
                sale:sale_url,
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
              axios.post(this.state.url+'/transactions_sales/',{
                sale:sale_url,
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
              axios.post(this.state.url+'/transactions_sales/',{
                sale:sale_url,
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
          }

      }).then(result =>{
        this.setState({redirect:true});
      })



    }
  }

  render(){
    //alert(this.state.cliente_seleccionado);
    this.opciones_dispositivos = [];
    if(this.state.cliente_seleccionado != null){
      for(let i = 0;i<this.state.clientes.length;i++){
        if(this.state.clientes[i].id == this.state.cliente_seleccionado){
        //  alert(this.state.clientes[i].dispositivos.length);
          for(let j = 0;j<this.state.clientes[i].dispositivos.length;j++){
            this.opciones_dispositivos[j] = [];
            this.opciones_dispositivos[j]['color'] = this.state.clientes[i].dispositivos[j].color;
            this.opciones_dispositivos[j]['url'] = this.state.clientes[i].dispositivos[j].url;
            this.opciones_dispositivos[j]['modelo'] = this.state.clientes[i].dispositivos[j].modelo;
            this.opciones_dispositivos[j]['id'] = this.state.clientes[i].dispositivos[j].id;

            // opciones_dispositivos +="<option value="+this.state.clientes[i].dispositivos[j].url+">"+
            // this.state.clientes[i].dispositivos[j].modelo+" "+this.state.clientes[i].dispositivos[j].color+
            // " "+ this.state.clientes[i].dispositivos[j].capacity + "("+this.state.clientes[i].dispositivos[j].imei+")</option>";
          }
        }
      }
    }

    return(
      <Aux>
        {this.state.redirect ? <Redirect to={'/ventas/'+this.state.id_nueva_orden} /> : ""}
        <Header />
        <div className="new-venta-wrapper">
          <div className="new-venta-form-wrapper">
          <p>Cliente</p>
          <input id="filtro_cliente_nueva_venta" type="text" name="filter_cliente_name" value={this.state.filter_cliente_name} onChange={this.handleInputChange} placeholder='Filtrar cliente por nombre' /><br/>
          <select name='cliente_seleccionado' onChange={this.handleInputChange} value={this.state.cliente_seleccionado}>
            <option value="-1">Seleccionar Cliente</option>
            {this.state.clientes_filtrado.map((item)=>(
              <option value={item.id}>{item.nombre} ({item.dni})</option>
            ))}
          </select>
            <p>Hay Reparación? <input type='checkbox' name="reparacion" value={this.state.reparacion} onChange={this.handleInputChange} /></p>

            <form id="new-venta-form">
              {this.state.reparacion ?
                <div className="new-venta-services-wrapper">
                  <h2>Arreglos</h2>


                  <p>Dispositivo</p>

                  <select name="dispositivo_seleccionado" onChange={this.handleInputChange} value={this.state.dispositivo_seleccionado}>
                    <option value="-1">Seleccionar Dispositivo</option>
                    {this.opciones_dispositivos.map((item)=>(
                      <option value={item.id}>{item.modelo} {item.color}</option>
                    ))}
                  </select>
                  <br/>
                  <p>Mojado <input type='checkbox' name="wet" value={this.state.wet} checked={this.state.wet} onChange={this.handleInputChange} /></p>
                  <p>Pantalla Delantera <input type='checkbox' name="frontal_display" value={this.state.frontal_display} checked={this.state.frontal_display} onChange={this.handleInputChange} /></p>
                  <p>Prende <input type='checkbox' name="turns_on" value={this.state.turns_on} checked={this.state.turns_on} onChange={this.handleInputChange} /></p>
                  <p>Touch id <input type='checkbox' name="touch_id" value={this.state.touch_id} checked={this.state.touch_id} onChange={this.handleInputChange} /></p>
                  <p>Boton Volumen <input type='checkbox' name="volume_button" value={this.state.volume_button} checked={this.state.volume_button} onChange={this.handleInputChange} /></p>
                  <p>Boton Bloqueo <input type='checkbox' name="lock_button" value={this.state.lock_button} checked={this.state.lock_button} onChange={this.handleInputChange} /></p>
                  <p>Boton Silencio <input type='checkbox' name="mute_button" value={this.state.mute_button} checked={this.state.mute_button} onChange={this.handleInputChange} /></p>
                  <p>Parlante <input type='checkbox' name="speakers" value={this.state.speakers} checked={this.state.speakers} onChange={this.handleInputChange} /></p>
                  <p>Microfono <input type='checkbox' name="mic" value={this.state.mic} checked={this.state.mic} onChange={this.handleInputChange} /></p>
                  <p>Sensor Proximidad <input type='checkbox' name="proximity_sensor" value={this.state.proximity_sensor} checked={this.state.proximity_sensor} onChange={this.handleInputChange} /></p>
                  <p>Camara Frontal <input type='checkbox' name="frontal_camera" value={this.state.frontal_camera} checked={this.state.frontal_camera} onChange={this.handleInputChange} /></p>
                  <p>Camara Trasera <input type='checkbox' name="rear_camera" value={this.state.rear_camera} checked={this.state.rear_camera}  onChange={this.handleInputChange} /></p>
                  <p>Pin de Carga <input type='checkbox' name="charge_pin" value={this.state.charge_pin} checked={this.state.charge_pin} onChange={this.handleInputChange} /></p>
                  <p>Estetica General <input type='checkbox' name="general_aesthetics" value={this.state.general_aesthetics} checked={this.state.general_aesthetics} onChange={this.handleInputChange} /></p>
                  <p>Observaciones Generales<br/>
                  <textarea rows="5" cols="40" name="general_observations" value={this.state.general_observations} onChange={this.handleInputChange}/></p>

                  <br/>

                  <p>Servicios</p>
                  <select onChange={this.handleInputChange} name="servicio_actual" value={this.state.servicio_actual}>
                    <option value="-1">Seleccionar Servicio</option>
                    {this.state.servicios.map((item)=>(
                      // <option value={item.id_servicio}>{item.nombre} - {item.oficina.direccion} -- {item.composicion.map((component)=>{return component.nombre_componente +" en stock: "+component.stock})} </option>
                      <option disabled={this.isDisabledService(item.id_servicio)} value={item.id_servicio}>{item.nombre}</option>

                    ))}
                    </select><br/><br/>
                    <select onChange={this.handleInputChange} name="oficina_servicio_actual" value={this.state.oficina_servicio_actual}>
                      <option value="-1">Seleccionar Oficina donde se realiza</option>
                      {this.state.servicios.map((item)=>{
                        return item.id_servicio == this.state.servicio_actual ? item.oficina.map((item2)=>(
                          <option value={item2.url_direccion}>{item2.direccion} (${item2.precio})</option>
                        )) : ""
                      }

                      )}
                      </select><br/>
                    <button onClick={this.addServiceToOrder}>Agregar</button>
                </div>

                :

                ""

              }
              <div className="select-new-producto-order">
                <h2>Productos</h2>
                <select onChange={this.handleInputChange} name="producto_actual" value={this.state.producto_actual}>
                  <option value="-1">Seleccionar Productos</option>
                  {this.state.productos.map((item)=>(
                    <option key={item.id_producto} disabled={this.isInArray(item.id_producto)} value={item.id_producto}>{item.nombre} (${item.oficinas.precio}) en {item.oficinas.direccion}</option>
                  ))}
                </select>
                <br/>
                <button onClick={this.addProductToOrder}>Agregar</button>
              </div>


            </form>

          </div>
          <div className="resumen-venta-wrapper">
            <div className="wrapper-listado-productos-agregados">
              <h3>Resumen Productos</h3>
              {this.state.listado_productos_orden.map((item)=>(
                <p>{item.nombre} <input onChange={event => this.updateAmountProductOrder(event,item.id)} type="number" value={item.quantity_sold} /> $<input type='number' value={item.monto} onChange={event => this.changeMontoProductinOrder(event,item.id)} />(${item.precio_unitario})<button onClick={()=>this.removeItemProductos(item.id)}>X</button></p>
              ))}
              <p><strong>Total en Productos: </strong>${this.state.monto_total_productos}</p>
              <h3>Resumen Servicios</h3>
              {this.state.listado_servicios_orden.map((item)=>(
                <p>{item.nombre} en {item.direccion_oficina}<br/><br/><input onChange={event => this.updateAmountServiceOrder(event,item.id)} type="number" value={item.quantity_sold} /> $<input type='number' value={item.monto} onChange={event => this.changeMontoServiceinOrder(event,item.id)} /> (${item.precio_unitario}) <button onClick={()=>this.removeItemServicios(item.id)}>X</button><br/><br/>
                <strong>Garantia Hasta:</strong> {this.getWarrantyDate(item.garantia)}
                </p>
              ))}
              <p><strong>Total en Servicios: </strong>${this.state.monto_total_servicios}</p>

              <div className="div-mostrar-total">
                <p><strong>Total:</strong> ${this.state.monto_total_servicios + this.state.monto_total_productos}</p>
              </div>

              <div className="pagar-orden">
                <p>Paga ahora? <input type='checkbox' name="is_paying" value={this.state.is_paying} onChange={this.handleInputChange} /></p>
                {this.state.is_paying ?
                <div className="pagar-orden-invisible">
                  <label>Cantidad en Credito</label> <input type="number" min="0" onChange={this.handleInputChange} name="credito" value={this.state.credito} />(25% recargo) -- ${(this.state.monto_total_servicios + this.state.monto_total_productos)*1.25}<br/>
                  <label>Cantidad en Debito</label> <input type="number" min="0" onChange={this.handleInputChange} name="debito" value={this.state.debito} /><br/>
                  <label>Cantidad en Efectivo</label> <input type="number" min="0" onChange={this.handleInputChange} name="efectivo" value={this.state.efectivo} />
                </div>
                :
                ""
                }

                <button onClick={this.sendOrder}>Terminar Orden</button>

              </div>

            </div>
          </div>


        </div>
      </Aux>
    )
  }
}

export default NewVenta;
