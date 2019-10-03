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
      url:'http://127.0.0.1:8000',
      stock :[],
    }
  }

  componentDidMount(){
    this.getStock();
  }

  async getStock(){
    let stock = [];
    await axios.get(this.state.url+'/stock/')
    .then(async res=>{
      for(let i = 0; i<res.data.length;i++){
        stock[i] = [];
        stock[i]['url_componente'] = res.data[i].component;
        stock[i]['office'] = res.data[i].office;
        stock[i]['in_stock'] = res.data[i].in_stock;

        await axios.get(res.data[i].office)
        .then(res1 =>{
          stock[i]['office_address'] = res1.data.address;
        })

        await axios.get(res.data[i].component)
        .then(res2=>{
          console.log(res2);
          stock[i]['nombre'] = res2.data.name;
        })
      }
    })
    this.setState({stock:stock});
    // console.log(stock);
  }

  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-stock">
          {this.state.stock.map((item)=>(
            <div className="wrapper-stock-item">
              <p><strong>{item.nombre}</strong> - <strong>En stock:</strong>{item.in_stock} - <strong>En oficina:</strong>{item.office_address}</p>
            </div>
          ))}
        </div>
      </Aux>
    )
  }
}

export default Stock;
