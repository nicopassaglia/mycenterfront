import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import axios from 'axios';
import {Link} from 'react-router-dom';
import './Services.css';

class Services extends Component{
  constructor(props){
    super(props);
    this.state = {
      url:'http://127.0.0.1:8000',
      servicios:[],
    }

    this.handlePriceChange = this.handlePriceChange.bind(this);
    this.updatePrices = this.updatePrices.bind(this);
  }
  componentDidMount(){
    this.getServices();
  }
  async updatePrices(){
    let servicios = this.state.servicios;

    for(let i = 0;i<servicios.length;i++){
      if(servicios[i].nuevo_precio != null && servicios[i].nuevo_precio > 0){
        for(let j = 0; j<servicios[i].oficinas.length;j++){
          await axios.patch(servicios[i].oficinas[j].service_office_url,{
            price_per_unit:servicios[i].nuevo_precio,
          })
        }
      }
    }
    this.getServices();
  }
  handlePriceChange(event){
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let services = this.state.servicios;
    for(let i = 0 ;i<services.length;i++){
      if(services[i].id == name){
        services[i]['nuevo_precio'] = value;
      }
    }
    this.setState({servicios:services});
  }
  getServices(){
    let servicios = [];
    axios.get(this.state.url+'/services/')
    .then(res => {
      for(let i = 0;i<res.data.length;i++){
        servicios[i] = [];
        servicios[i]['id'] = res.data[i].id;
        servicios[i]['nombre_servicio'] = res.data[i].name;
        servicios[i]['garantia'] = res.data[i].warranty_period;
        servicios[i]['componentes'] = [];
        servicios[i]['oficinas'] = [];
        for(let j = 0;j<res.data[i].service_composition.length;j++){
          servicios[i]['componentes'][j] = [];
          servicios[i]['componentes'][j]['nombre_componente'] = res.data[i].service_composition[j].service_detail.name;

        }

        for(let t = 0; t<res.data[i].service_office.length;t++){
          servicios[i]['oficinas'][t] = [];
          servicios[i]['oficinas'][t]['service_office_url'] = res.data[i].service_office[t].url;
          servicios[i]['oficinas'][t]['precio'] = res.data[i].service_office[t].price_per_unit;
          servicios[i]['oficinas'][t]['oficina'] = res.data[i].service_office[t].office_detail.address;
        }

      }
      console.log(servicios);
      this.setState({servicios:servicios});
    })

  }
  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-listado-servicios">
          <button onClick={this.updatePrices}>Actualizar precio</button>
          {this.state.servicios.map((item)=>(
            <div className="listado-servicios-item">
              <h3><strong>{item.nombre_servicio}</strong></h3>
              <p><strong>Componentes:</strong></p>
              {item.componentes.map((comp)=>(
                <p>{comp.nombre_componente}</p>
              ))}

              <p><strong>Oficinas</strong></p>
              {item.oficinas.map((ofi)=>(
                <p>{ofi.oficina} - ${ofi.precio}</p>
              ))}
              <label>Cambiar precio </label>
              $<input type="number" min="0" onChange={this.handlePriceChange} name={item.id} />
              <hr/>

            </div>
          ))}

        </div>
      </Aux>
    )
  }
}

export default Services;
