import React,{Component} from 'react';
import Aux from '../../../hoc/Aux';
import Header from '../../Header/Header';
import { Redirect } from 'react-router-dom';
import './NewComponent.css';
import axios from 'axios';

class NewComponent extends Component{
  constructor(props){
    super(props);

    this.state = {
      url:'http://api.mycenter.rubick.co',
      nombre_componente:'',
      oficinas:[],
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.addComponent = this.addComponent.bind(this);
  }

  componentDidMount(){
    this.getOffices();
  }
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
  //  alert("hola")
    if(name != "nombre_componente"){
      let arreglo = this.state.oficinas;
      for(let i =0;i<arreglo.length;i++){
        if(name == arreglo[i].id){
          arreglo[i]['stock'] = value;

        }
      }
      this.setState({oficinas:arreglo});
    }


    this.setState({
      [name]: value
    });

  }

  getOffices(){
    let oficinas = [];
    axios.get(this.state.url+'/offices/')
    .then(res =>{
      for(let i =0;i<res.data.length;i++){
        oficinas[i] = [];
        oficinas[i]['direccion'] = res.data[i].address;
        oficinas[i]['url'] = res.data[i].url;
        oficinas[i]['id'] = res.data[i].id;

      }
      this.setState({oficinas:oficinas});
    })
  }

  addComponent(){
    let mandar = true;
    let arreglo = this.state.oficinas;

    for(let i = 0;i<arreglo.length;i++){
      if(arreglo[i].stock < 0 || arreglo[i].stock === "" || this.state.nombre_componente === ""){
        mandar = false;
        break;
      }
    }
    if(mandar){
      axios.post(this.state.url+'/components/',{
        name:this.state.nombre_componente
      })
      .then(res=>{
        let id_componente = res.data.url;
        for(let j = 0;j<arreglo.length;j++){
          axios.post(this.state.url+'/stock/',{
            in_stock:arreglo[j].stock,
            component:id_componente,
            office:arreglo[j].url,
          })
        }
      })

    }else{
      alert("Revisar todos los campos");
    }

  }


  render(){
    return(
      <Aux>
        <Header />
        <div className="wrapper-new-component">
          <h2>Nuevo componente</h2>
          <input type="text" name="nombre_componente" value={this.state.nombre_componente} onChange={this.handleInputChange} placeholder="Nombre componente" />

          {this.state.oficinas.map((item)=>(
            <p>{item.direccion} <input onChange={this.handleInputChange} type="number" name={item.id} placeholder="Cantidad en stock"/></p>
          ))}
          <button onClick={this.addComponent}>Agregar Componente</button>
        </div>
      </Aux>
    )
  }
}

export default NewComponent;
