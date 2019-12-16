import React,{Component} from 'react';
import Aux from '../../hoc/Aux';
import Header from '../Header/Header';
import { Redirect } from 'react-router-dom';
import './Productos.css';
import axios from 'axios';

class Productos extends Component{
  constructor(props){
    super(props);
    this.state={
      url:'http://api.mycenter.rubick.co',
      listado_productos:[],
    }

    this.updatePrices = this.updatePrices.bind(this);
    this.handlePriceChange = this.handlePriceChange.bind(this);
  }

  componentDidMount(){
    this.fetchProducts();
  }
  async updatePrices(){
    let productos = this.state.listado_productos;

    for(let i = 0;i<productos.length;i++){
      if(productos[i].nuevo_precio != null && productos[i].nuevo_precio > 0){
        for(let j = 0; j<productos[i].oficinas.length;j++){
          await axios.patch(productos[i].oficinas[j].url_product_office,{
            price_per_unit:productos[i].nuevo_precio,
          })
        }
      }
    }
    this.fetchProducts();
  }

  handlePriceChange(event){
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let productos = this.state.listado_productos;
    for(let i = 0 ;i<productos.length;i++){
      if(productos[i].id_producto == name){
        productos[i]['nuevo_precio'] = value;
      }
    }
    this.setState({listado_productos:productos});
  }
  fetchProducts(){
    let listado_productos = [];
    axios.get(this.state.url+'/products/')
    .then(res =>{
      for(let i =0;i<res.data.length;i++){
        listado_productos[i] = [];
        listado_productos[i]['nombre'] = res.data[i].name;
        listado_productos[i]['composicion'] = [];
        listado_productos[i]['oficinas'] = [];
        listado_productos[i]['id_producto'] = res.data[i].id;
        listado_productos[i]['url_producto'] = res.data[i].url;
        for(let j =0;j<res.data[i].product_composition.length;j++){
          listado_productos[i]['composicion'][j] = [];
          listado_productos[i]['composicion'][j]['id_componente'] = res.data[i].product_composition[j].component_detail.id;
          listado_productos[i]['composicion'][j]['url_componente'] = res.data[i].product_composition[j].component_detail.url;
          listado_productos[i]['composicion'][j]['nombre_componente'] = res.data[i].product_composition[j].component_detail.name;
          listado_productos[i]['composicion'][j]['cantidad'] = res.data[i].product_composition[j].quantity;

        }
        for(let t = 0;t<res.data[i].product_office.length;t++){
          listado_productos[i]['oficinas'][t] = [];
          listado_productos[i]['oficinas'][t]['direccion'] = res.data[i].product_office[t].office_detail.address;
          listado_productos[i]['oficinas'][t]['precio'] = res.data[i].product_office[t].price_per_unit;
          listado_productos[i]['oficinas'][t]['url_product_office'] = res.data[i].product_office[t].url;
        }
      }
      this.setState({listado_productos:listado_productos});
    })
  }
  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-stock">
        <button onClick={this.updatePrices}>Actualizar Precios</button>
          <h2>Listado productos</h2><hr/>
          {this.state.listado_productos.map((item)=>(
            <div className="wrapper-stock-item">
              <p><strong>Producto: </strong>{item.nombre}</p>{item.composicion.map((item2)=>(
                <p><strong>Componente que utiliza: </strong>{item2.nombre_componente}</p>
              ))}
              <p><strong>Oficinas</strong></p>
              {item.oficinas.map((ofi)=>(
                <p>{ofi.direccion} - ${ofi.precio}</p>

              ))}
              <input type="number" min="0" onChange={this.handlePriceChange} name={item.id_producto} />
            </div>
          ))}


        </div>
      </Aux>
    )
  }
}
export default Productos;
