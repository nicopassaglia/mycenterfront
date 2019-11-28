import React,{Component} from 'react';
import Aux from '../../hoc/Aux';
import Header from '../Header/Header';
import { Redirect } from 'react-router-dom';
import './Caja.css';
import axios from 'axios';

class Caja extends Component{
  constructor(props){
    super(props);
    this.state = {
      url:'http://127.0.0.1:8000',
      ultimoCierre:0,
      montoTransaccionesEfectivo:0,
      montoTransaccionesDebito:0,
      montoTransaccionesCredito:0,
      transacciones_efectivo:[],
      transacciones_debito:[],
      transacciones_credito:[],
      fechaUltimoCierre:"",
      monto_movimiento:0,
      tipo_nuevo_movimiento:"-1",
      user_entity:"",
      office_entity_url:"",
    }
    this.addMovimientoCaja = this.addMovimientoCaja.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.cerrarCaja = this.cerrarCaja.bind(this);
  }
  componentDidMount(){
    // this.getTodayTransactions();
    this.getEntities();
    this.getLastCierreCaja();
  }

  getEntities(){
    axios.get(this.state.url+'/auth/user/')
    .then(res=>{
      //console.log(res);
      this.setState({user_entity:res.data.entity.id});
    });

    axios.get(this.state.url+'/offices/'+sessionStorage.getItem('oficina')+'/')
    .then(result=>{
      this.setState({office_entity_url:result.data.entity});
    })

  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

  }

  getTodayTransactions(){

    let date = new Date(this.state.fechaUltimoCierre);
    let today = date.toISOString();
    let transacciones_efectivo = [];
    let transacciones_credito  = [];
    let transacciones_debito = [];
    let office = sessionStorage.getItem('oficina');
    let montoEnEfectivo = 0;
    let montoEnDebito = 0;
    let montoEnCredito = 0;
    axios.get(this.state.url+'/transactions/?datetime_created__gt='+today+'&office='+office)
    .then(res =>{
      for(let i = 0;i<res.data.length;i++){
        if(res.data[i].method === this.state.url+'/payment_methods/1/'){
          transacciones_efectivo[i] = [];
          transacciones_efectivo[i]['tipo'] = res.data[i].transaction_type;
          transacciones_efectivo[i]['monto'] = res.data[i].amount;
          transacciones_efectivo[i]['fecha'] = new Date(res.data[i].transaction_date).toLocaleString();
          montoEnEfectivo = (res.data[i].transaction_type === "DEP" ? montoEnEfectivo + res.data[i].amount : montoEnEfectivo - res.data[i].amount);

        }else if(res.data[i].method === this.state.url+'/payment_methods/2/'){
          transacciones_debito[i] = [];
          transacciones_debito[i]['tipo'] = res.data[i].transaction_type;
          transacciones_debito[i]['monto'] = res.data[i].amount;
          transacciones_debito[i]['fecha'] = new Date(res.data[i].transaction_date).toLocaleString();
          montoEnDebito = (res.data[i].transaction_type === "DEP" ? montoEnDebito + res.data[i].amount : montoEnDebito - res.data[i].amount);

        }else{
          transacciones_credito[i] = [];
          transacciones_credito[i]['tipo'] = res.data[i].transaction_type;
          transacciones_credito[i]['monto'] = res.data[i].amount;
          transacciones_credito[i]['fecha'] = new Date(res.data[i].transaction_date).toLocaleString();

          montoEnCredito = (res.data[i].transaction_type === "DEP" ? montoEnCredito + res.data[i].amount : montoEnCredito - res.data[i].amount);

        }
      }
      this.setState({montoTransaccionesEfectivo:montoEnEfectivo,montoTransaccionesDebito:montoEnDebito,montoTransaccionesCredito:montoEnCredito,transacciones_efectivo:transacciones_efectivo,transacciones_debito:transacciones_debito,transacciones_credito:transacciones_credito});
    });
  }
  getLastCierreCaja(){
    let office = sessionStorage.getItem('oficina');
    let ultimoCierre = 0;
    let fechaUltimoCierre ='10/10/1990';
    axios.get(this.state.url+'/balance_statement/?office='+office)
    .then(res =>{

        if(res.data.length > 0){

          ultimoCierre = res.data[res.data.length  - 1].closing_balance;
          fechaUltimoCierre = res.data[res.data.length - 1].creation_date;

      }
      this.setState({ultimoCierre:ultimoCierre,fechaUltimoCierre:fechaUltimoCierre},()=>this.getTodayTransactions());

    });
  }

  addMovimientoCaja(){
    let mandar = true;
    if(this.state.tipo_nuevo_movimiento === "-1"){
      mandar = false;
      alert("Seleccionar tipo de movimiento");
    }
    if(this.state.monto_movimiento < 0){
      mandar = false;
      alert("Usar unicamente numeros positivos");
    }

    if(mandar){
      axios.post(this.state.url+"/transactions/",{
        transaction_type:this.state.tipo_nuevo_movimiento,
        method:this.state.url+'/payment_methods/1/',
        amount:this.state.monto_movimiento,
        office:this.state.office_entity_url,
        third:this.state.url+'/entities/'+this.state.user_entity+'/',
      })
      .then(res =>{
        this.setState({monto_movimiento:0,tipo_nuevo_movimiento:"-1"});
        this.getLastCierreCaja();
      });
    }
  }

  cerrarCaja(){
    let confirm = window.confirm("Esta por cerra la caja, esta seguro? (Esta accion no se puede deshacer)");
    let cierre = Number(this.state.montoTransaccionesEfectivo) + Number(this.state.ultimoCierre);
    if(confirm){
      axios.post(this.state.url+'/balance_statement/',{
        closing_balance:cierre,
        office:this.state.url+'/offices/'+sessionStorage.getItem('oficina')+'/'
      })
      .then(res =>{
        this.getLastCierreCaja();
      })
    }

  }


render(){
  return(
    <Aux>
      <Header />
      <div className="wrapper-transacciones">
        <div className="caja-efectivo">
          <h3>Listado de transacciones desde ultimo cierre en efectivo</h3>
          {this.state.transacciones_efectivo.map((item)=>(
            <p><strong>Tipo: </strong>{item.tipo === "DEP" ? "Deposito" : "Retiro"} - ${item.monto} - {item.fecha}</p>
          ))}
          <p><strong>Efectivo en caja desde ultimo cierre: </strong> ${this.state.montoTransaccionesEfectivo}</p>
          <p><strong>Ultimo cierre de caja: </strong>${this.state.ultimoCierre} - <strong>Fecha:</strong> {new Date(this.state.fechaUltimoCierre).toLocaleString()}</p>
          <p><strong>Resultado: </strong>${Number(this.state.ultimoCierre) + Number(this.state.montoTransaccionesEfectivo)}</p>
          <div className="nuevo-movimiento-caja">
            <label for="monto_movimiento">Nuevo movimiento caja</label>
            <select onChange={this.handleInputChange} value={this.state.tipo_nuevo_movimiento} name="tipo_nuevo_movimiento">
              <option value="-1">Tipo de movimiento</option>
              <option value="DEP">Deposito</option>
              <option value="WIT">Retiro</option>
            </select>
            <input min='0' onChange={this.handleInputChange} name="monto_movimiento" value={this.state.monto_movimiento} type="number" placeholder="Nuevo movimiento de caja" />

            <button onClick={this.addMovimientoCaja}>Confirmar Movimiento</button>
          </div>
          <hr/>
          <button onClick={this.cerrarCaja} id="cerrar-caja-button">Cerrar Caja</button>

        </div>
        <div className="caja-credito">
          <h3>Listado de transacciones desde ultimo cierre con credito</h3>
          {this.state.transacciones_credito.map((item)=>(
            <p><strong>Tipo: </strong>{item.tipo === "DEP" ? "Deposito" : "Retiro"} - ${item.monto} - {item.fecha}</p>
          ))}
          <p><strong>Credito total de hoy: </strong> ${this.state.montoTransaccionesCredito}</p>

        </div>
        <div className="caja-debito">
          <h3>Listado de transacciones desde ultimo cierre con debito</h3>
          {this.state.transacciones_debito.map((item)=>(
            <p><strong>Tipo: </strong>{item.tipo === "DEP" ? "Deposito" : "Retiro"} - ${item.monto} - {item.fecha}</p>
          ))}
          <p><strong>Debito Total de hoy: </strong> ${this.state.montoTransaccionesDebito}</p>

        </div>
      </div>
    </Aux>
  )
}
}
export default Caja;
