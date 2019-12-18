import React,{Component} from 'react';
import './StoreChoice.css';
import Header from '../Header/Header';
import Aux from '../../hoc/Aux';
import { Redirect } from 'react-router-dom';
import shop from '../../assets/images/shop.png';
import axios from 'axios';
class storechoice extends Component {
  state = {
    redirect: false,
    menus:{

    },
    url:"https://api.mycenter.rubick.co",
    locales:[],


  }
  setRedirect = () => {
    this.setState({
      redirect: true
    })
  }
  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to='/home' />
    }
  }
  selectStore = (props) =>{
    sessionStorage.setItem('store-key',props);
    this.setRedirect();
  }

  getOffices(){
    var arreglo_locales = [];
    axios.get(this.state.url+'/offices/')
    .then(res=>{
      for(let i =0;i<res.data.length;i++){
        arreglo_locales[i] = [];
        arreglo_locales[i]['id'] = res.data[i].id;
        arreglo_locales[i]['direccion'] = res.data[i].address;
      }
      this.setState({locales:arreglo_locales});
    })
  }

  componentDidMount(){
    this.getOffices();
  }
  render(){
    return(
      <Aux>
        <Header />

        <div className="storeChoice-wrapper">
          <div className="storeChoice-inner">
            {this.renderRedirect()}

            {this.state.locales.map((item)=>(
              <div onClick={()=>this.selectStore(item.id)} className='storeChoice-option'>
                <img src={shop} />
                <p>{item.direccion}</p>
              </div>
            ))}



          </div>
        </div>

      </Aux>


    );
  }

}




export default storechoice;
