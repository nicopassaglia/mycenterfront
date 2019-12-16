import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import axios from 'axios';
import {Link} from 'react-router-dom';
import './Ventas.css';

class Ventas extends Component{
  constructor(props){
    super(props);
    this.state = {
      url:'http://api.mycenter.rubick.co',
      ordenes:[],
    }
  }


  componentDidMount(){
    let ordenes = [];
    axios.get(this.state.url+'/orders/')
    .then(res =>{
      for(let i = 0;i<res.data.length;i++){
        ordenes[i] = [];
        ordenes[i]['id'] = res.data[res.data.length - 1 - i].id;
        ordenes[i]['device'] = [];

        ordenes[i]['state'] = res.data[res.data.length - 1 - i].state;

        if(res.data[res.data.length - 1 - i].device != null){
          axios.get(res.data[res.data.length -1 -i].device)
          .then(resdevice =>{
            console.log(resdevice);

            ordenes[i]['device']['imei'] = resdevice.data.imei;
            ordenes[i]['device']['color'] = resdevice.data.color;
            ordenes[i]['device']['modelo'] = resdevice.data.modelinfo.name;
            ordenes[i]['device']['capacity'] = resdevice.data.capacity;



          });
        }
      }
      this.setState({ordenes:ordenes});
    });
  }
  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-ventas">
          <div className="wrapper-ventas-listado">
            <div className="wrapper-ventas-listado-item">
              <p><span>ID Orden</span><span>Dispositivo</span><span>Estado</span></p>
            </div>
            {this.state.ordenes.map((item)=>(
              <div className="wrapper-ventas-listado-item">
                <p><span>{item.id}</span><span>{item.device}</span><span>{item.state}</span></p>
              </div>
            ))}
          </div>

        </div>
      </Aux>
    )
  }

}
  export default Ventas;
