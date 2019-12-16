import React,{Component} from 'react';
import Aux from '../../hoc/Aux';
import Header from '../Header/Header';
import axios from 'axios';
import {Link} from 'react-router-dom';
import './Stock.css';

class Stock extends Component{
  constructor(props){
    super(props);
    this.state ={
      url:'http://api.mycenter.rubick.co',
      stock :[],
      stock_filtrado:[],
      oficinas:[],
      filter_oficina:"-1",
      filter_producto:"",
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleStockChange = this.handleStockChange.bind(this);
    this.updateStock = this.updateStock.bind(this);

  }
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    },()=>this.filter());

  }

  handleStockChange(event){
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    let stock = this.state.stock;

    for(let i = 0;i<stock.length;i++){
      if(stock[i].url_stock === name){
        stock[i]['nuevo_stock'] = value;
      }
    }
    this.setState({stock:stock});


  }
  async updateStock(){
    let stock = this.state.stock;

    for(let i = 0;i<stock.length;i++){
      if(stock[i].nuevo_stock != null && stock[i].nuevo_stock > 0){
        await axios.patch(stock[i].url_stock,{
          in_stock:stock[i].nuevo_stock,
        })
      }
    }
    this.getStock();
  }
  filter(){
    let stock = this.state.stock;

  //  showObras(arreglo.filter(function(obra){return obra.provincia == valor}));
    let oficina = this.state.filter_oficina;
    let producto = this.state.filter_producto;
    //let dni = this.state.filter_dni;

    if(oficina != "-1"){
      stock = stock.filter(function(articulo){return articulo.office_address == oficina});
    }


    if(producto != ""){
      stock = stock.filter(function(articulo){return articulo.nombre.toLowerCase().includes(producto.toLowerCase())});
    }

    this.setState({stock_filtrado:stock});
  }



  componentDidMount(){
    this.getStock();
    this.getOffices();
  }

  getOffices(){
    let oficinas = [];
    axios.get(this.state.url+'/offices/')
    .then(res =>{

      for(let i =0;i<res.data.length;i++){

        oficinas[i] = res.data[i];
      }
      this.setState({oficinas:oficinas});
    })
  }

  async getStock(){
    let stock = [];
    await axios.get(this.state.url+'/stock/')
    .then(async res=>{
      for(let i = 0; i<res.data.length;i++){
        stock[i] = [];
        stock[i]['url_stock'] = res.data[i].url;
        stock[i]['url_componente'] = res.data[i].component;
        stock[i]['office'] = res.data[i].office;
        stock[i]['in_stock'] = res.data[i].in_stock;

        await axios.get(res.data[i].office)
        .then(res1 =>{
          stock[i]['office_address'] = res1.data.address;
        })

        await axios.get(res.data[i].component)
        .then(res2=>{

          stock[i]['nombre'] = res2.data.name;
        })
      }
    })
    this.setState({stock:stock,stock_filtrado:stock});
    // console.log(stock);
  }

  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-stock">
        <button onClick={this.updateStock} style={{padding:"10px",margin:"20px 0px"}}>Ajustar stock</button>
        <h3>Stock</h3>
          <a><Link to='/new-component'>Agregar Componente</Link></a><hr/>

          <a><Link to='/new-product'>Agregar Producto</Link></a> <a><Link to='/products'>Listado Productos</Link></a><br/>
          <a><Link to='/new-service'>Agregar Servicio (Arreglos)</Link></a> <a><Link to='/servicios'>Listado Servicios</Link></a>
          <select onChange={this.handleInputChange} name="filter_oficina" value={this.state.filter_oficina}>
            <option value="-1">Filtro por oficina</option>
            {this.state.oficinas.map((item)=>(
                <option value={item.address}>{item.address}</option>
            ))}
          </select>
          <input type="text" name="filter_producto" value={this.state.filter_producto} onChange={this.handleInputChange} placeholder="Filtro producto" />
          {this.state.stock_filtrado.map((item)=>(
            <div className="wrapper-stock-item">
              <p><strong>{item.nombre}</strong> - <strong>En stock:</strong>{item.in_stock} - <strong>En oficina:</strong>{item.office_address} <input type="number" name={item.url_stock} min="0" onChange={this.handleStockChange} /></p>
            </div>
          ))}
        </div>
      </Aux>
    )
  }
}

export default Stock;
