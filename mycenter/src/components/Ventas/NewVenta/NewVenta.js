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
      is_paying:false,
      productos:[],
      servicios:[],
      producto_actual:"-1",
      servicio_actual:"-1",
      listado_productos_orden:[],
      listado_servicios_orden:[],
      clientes:[],
      cliente_seleccionado:"-1",
      dispositivo_seleccionado:"",
      dispositivos_cliente:[],
      monto_total:0,
      monto_total_servicios:0,
      monto_total_productos:0,
      efectivo:0,
      tarjeta:0,
      redirect:false,
      id_nueva_orden:'',
      stock:[],
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

    this.setState({
      [name]: value
    });

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
        clientes[i]['nombre'] = res.data[i].name;
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
      this.setState({clientes:clientes});
    })
  }


  componentDidMount(){
    this.getProductos();
    this.getServicios();
    this.getClientes();
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
        return false;
      }
    }

  }

  /////////////////////////////PRODUCTOS//////////////////////////////
  getProductos(){
    let productos = [];
    let id_historico = -1;
    axios.get(this.state.url+'/products/')
    .then(async res=>{
      for(let i=0;i<res.data.length;i++){
        productos[i] = [];
        productos[i]['nombre'] = res.data[i].name;
        productos[i]['id_producto'] = res.data[i].id;
        productos[i]['precio'] = res.data[i].price;

        productos[i]['url'] = res.data[i].url;
        productos[i]['composicion'] = [];

        for(let j =0;j<res.data[i].product_composition.length;j++){
          productos[i]['composicion'][j]= [];
          productos[i]['composicion'][j]['cantidad'] = res.data[i].product_composition[j].quantity;
          productos[i]['composicion'][j]['id_componente'] = res.data[i].product_composition[j].component_detail.id;
          productos[i]['composicion'][j]['url_componente'] = res.data[i].product_composition[j].component_detail.url;
          productos[i]['composicion'][j]['nombre_componente'] = res.data[i].product_composition[j].component_detail.name;

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
          local_listado[cant]['precio_unitario'] = this.state.productos[i].precio;
          local_listado[cant]['monto'] = this.state.productos[i].precio * local_listado[cant]['quantity_sold'];

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
        servicios[i]['precio'] = res.data[i].price;
      //  servicios[i]['oficina'] = res.data[i].office;
        servicios[i]['url'] = res.data[i].url;
        servicios[i]['composicion'] = [];
        servicios[i]['oficina'] = [];
        await axios.get(res.data[i].office)
        .then(res2=>{
          servicios[i]['oficina']['direccion'] = res2.data.address;
          servicios[i]['oficina']['id'] = res2.data.id;
        });

        for(let j =0;j<res.data[i].service_composition.length;j++){
          servicios[i]['composicion'][j]= [];
        //  servicios[i]['composicion'][j]['cantidad'] = res.data[i].service_composition[j].quantity;
          servicios[i]['composicion'][j]['id_componente'] = res.data[i].service_composition[j].service_detail.id;
          servicios[i]['composicion'][j]['url_componente'] = res.data[i].service_composition[j].service_detail.url;
          servicios[i]['composicion'][j]['nombre_componente'] = res.data[i].service_composition[j].service_detail.name;

          await axios.get(this.state.url+'/stock/?component='+res.data[i].service_composition[j].service_detail.id+'&office='+servicios[i]['oficina']['id'])
          .then(resstock=>{
            servicios[i]['composicion'][j]['url_stock'] = resstock.data[0].url;
            servicios[i]['composicion'][j]['stock'] = resstock.data[0].in_stock;
          })

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
    if(this.state.servicio_actual === "-1"){
      alert("Debes seleccionar un producto");
    }else{
      for(let i = 0;i<this.state.servicios.length;i++){
        if(this.state.servicios[i].id_servicio == this.state.servicio_actual){
          local_listado_servicios[cant] = [];
          local_listado_servicios[cant]['id'] = this.state.servicios[i].id_producto;
          local_listado_servicios[cant]['nombre'] = this.state.servicios[i].nombre;
          local_listado_servicios[cant]['quantity_sold'] = 1;
          local_listado_servicios[cant]['precio_unitario'] = this.state.servicios[i].precio;
          local_listado_servicios[cant]['monto'] = this.state.servicios[i].precio * local_listado_servicios[cant]['quantity_sold'];
          local_listado_servicios[cant]['url'] = this.state.servicios[i].url;
          local_listado_servicios[cant]['id_oficina'] = this.state.servicios[i].oficina.id;
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
    console.log(local_listado_servicios);
    this.setState({listado_servicios_orden:local_listado_servicios},()=>this.calcularMontoTotalServicios());

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

  async sendOrder(){
    let arreglo_productos = this.state.listado_productos_orden;
    let arreglo_servicios = this.state.listado_servicios_orden;
    if(arreglo_productos.length === 0 && arreglo_servicios.length === 0){
      alert("No puedes cargar una orden vacia");
    }
    else if(Number(this.state.tarjeta) + Number(this.state.efectivo) > (this.state.monto_total_productos + this.state.monto_total_servicios)){

      alert("El monto a pagar es mayor al total");
    }
    else{
      let id = sessionStorage.getItem('id');
      await axios.post(this.state.url+'/orders/',{
        device:this.state.dispositivo_seleccionado,
        state:"T",
        wet:this.state.wet,
        saleperson:this.state.url+'/users/'+id+'/',
      })
      .then(res=>{
        let id_orden = res.data.url;
        this.setState({id_nueva_orden:res.data.id});

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

        if(arreglo_productos.length != 0){

          for(let i = 0;i<arreglo_productos.length;i++){
            //alert(arreglo_productos[i].url);
            axios.post(this.state.url+'/saleproducts/',{
              product:arreglo_productos[i].url,
              order:id_orden,
              price:arreglo_productos[i].monto,
              quantity_sold:arreglo_productos[i].quantity_sold,

            })
            .then(res=>{
              console.log("PRODUCTO: "+res);
            })
          } //END FOR
        }//END IF LENGTH 0 PRODUCTOS

        if(arreglo_servicios.length !=0){
          for(let j = 0; j<arreglo_servicios.length; j++){
            axios.post(this.state.url+'/saleservices/',{
              order:id_orden,
              service:arreglo_servicios[j].url,
              price:arreglo_servicios[j].monto,
              component_quantity:arreglo_servicios[j].quantity_sold,

            })
            .then(async res =>{

              for(let t=0;t<arreglo_servicios[j].composicion.length;t++){
                await axios.patch(arreglo_servicios[j].composicion[t].url_stock,{
                  in_stock:(Number(arreglo_servicios[j].composicion[t].stock) - Number(arreglo_servicios[j].quantity_sold)),
                })
                .then(resstock=>{

                })
              }

              console.log("SERVICIO: "+res);
            });
          }
        }

          if(this.state.is_paying){
            if(this.state.efectivo > 0){
              axios.post(this.state.url+'/payment/',{
                payment_type:"E",
                order:id_orden,
                amount:this.state.efectivo
              })
              .then(res =>{
                console.log("EFECTIVO"+res);
              })
            }
            if(this.state.tarjeta > 0){
              axios.post(this.state.url+'/payment/',{
                payment_type:"C",
                order:id_orden,
                amount:this.state.tarjeta,
              })
              .then(res =>{
                console.log("TARJETA: "+res);
              })
            }
          }


      });
      this.setState({redirect:true});
    }
  }

  render(){
    //alert(this.state.cliente_seleccionado);
    this.opciones_dispositivos = [];
    if(this.state.cliente_seleccionado != null){
      for(let i = 0;i<this.state.clientes.length;i++){
        if(this.state.clientes[i].dni === this.state.cliente_seleccionado){
        //  alert(this.state.clientes[i].dispositivos.length);
          for(let j = 0;j<this.state.clientes[i].dispositivos.length;j++){
            this.opciones_dispositivos[j] = [];
            this.opciones_dispositivos[j]['color'] = this.state.clientes[i].dispositivos[j].color;
            this.opciones_dispositivos[j]['url'] = this.state.clientes[i].dispositivos[j].url;
            this.opciones_dispositivos[j]['modelo'] = this.state.clientes[i].dispositivos[j].modelo;

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
            <p>Hay Reparación? <input type='checkbox' name="reparacion" value={this.state.reparacion} onChange={this.handleInputChange} /></p>

            <form id="new-venta-form">
              {this.state.reparacion ?
                <div className="new-venta-services-wrapper">
                  <h2>Arreglos</h2>
                  <p>Cliente</p>
                  <select name='cliente_seleccionado' onChange={this.handleInputChange} value={this.state.cliente_seleccionado}>
                    <option value="-1">Seleccionar Cliente</option>
                    {this.state.clientes.map((item)=>(
                      <option value={item.dni}>{item.nombre} ({item.dni})</option>
                    ))}
                  </select>
                  <p>Dispositivo</p>

                  <select name="dispositivo_seleccionado" onChange={this.handleInputChange} value={this.state.dispositivo_seleccionado}>
                    <option value="-1">Seleccionar Dispositivo</option>
                    {this.opciones_dispositivos.map((item)=>(
                      <option value={item.url}>{item.modelo} {item.color}</option>
                    ))}
                  </select>
                  <br/>
                  <p>Mojado? <input type='checkbox' name="wet" value={this.state.wet} onChange={this.handleInputChange} /></p>
                  <br/>

                  <p>Servicios</p>
                  <select onChange={this.handleInputChange} name="servicio_actual" value={this.state.servicio_actual}>
                    <option value="-1">Seleccionar Servicio</option>
                    {this.state.servicios.map((item)=>(
                      <option value={item.id_servicio}>{item.nombre} - {item.oficina.direccion} -- {item.composicion.map((component)=>{return component.nombre_componente +" en stock: "+component.stock})} </option>

                    ))}
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
                    <option key={item.id_producto} disabled={this.isInArray(item.id_producto)} value={item.id_producto}>{item.nombre}</option>
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
                <p>{item.nombre} <input onChange={event => this.updateAmountServiceOrder(event,item.id)} type="number" value={item.quantity_sold} /> $<input type='number' value={item.monto} onChange={event => this.changeMontoServiceinOrder(event,item.id)} /> (${item.precio_unitario}) <button onClick={()=>this.removeItemServicios(item.id)}>X</button></p>
              ))}
              <p><strong>Total en Servicios: </strong>${this.state.monto_total_servicios}</p>

              <div className="div-mostrar-total">
                <p><strong>Total:</strong> ${this.state.monto_total_servicios + this.state.monto_total_productos}</p>
              </div>

              <div className="pagar-orden">
                <p>Paga ahora? <input type='checkbox' name="is_paying" value={this.state.is_paying} onChange={this.handleInputChange} /></p>
                {this.state.is_paying ?
                <div className="pagar-orden-invisible">
                  <label>Cantidad en Efectivo</label> <input type="number" min="0" onChange={this.handleInputChange} name="efectivo" value={this.state.efectivo} /><br/>
                  <label>Cantidad con Tarjeta</label> <input type="number" min="0" onChange={this.handleInputChange} name="tarjeta" value={this.state.tarjeta} />
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
