import React,{Component} from 'react';
import { Redirect } from 'react-router-dom';
import './Login.css';
import Cookies from 'js-cookie';
import axios from 'axios';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.withCredentials = true;


class Login extends Component{
  constructor(props) {
    super(props);

    this.state = {
      redirect: false,
      url:'https://api.mycenter.rubick.co',
      csrftoken:Cookies.get('csrftoken'),
      username:'',
      password:'',
    };

    this.setRedirect = this.setRedirect.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
}

  handleInputChange(event){
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;


    this.setState({
      [name]: value
    });

  }
  setRedirect(){
    this.setState({
      redirect: true
    })
  }
  renderRedirect(){
    if (this.state.redirect) {
      return <Redirect to='/' />
    }
  }

   async submitLogin(){
     const formdata  = new FormData();
     formdata.append("username",this.state.username);
     formdata.append("password",this.state.password);
    await axios({
      method:'POST',
      url:this.state.url+'/auth/login/',
      data:formdata,
      config:{
        headers:{
          'Content-Type':'multipart/form-data',
        }
      },
    })
    .then(function(response){

      console.log(response);
      let id = Cookies.get('sessionid');


      if(id == null){
        alert("Datos incorrectos");
      }else{
        axios.get(this.state.url+'/auth/user/')
        .then(res=>{
          sessionStorage.setItem('id',res.data.pk);
          sessionStorage.setItem('oficina',res.data.office);
          this.setRedirect();
        })

      }
    }.bind(this))

    .catch(function(error){
      alert("Datos incorrectos");
      console.log(error);
    })
    .then(function(){


    });
  //
  }
  render(){
    return(

      <div className="login-wrapper">
        <div className="login-box">
        {this.renderRedirect()}
        <form>
          <input value={this.state.username} name="username" onChange={this.handleInputChange} type="text" placeholder="Usuario" />
          <input value={this.state.password} name="password" onChange={this.handleInputChange} type="text" placeholder="Clave" />
        </form>
          <button onClick={this.submitLogin} id="login-button">Ingresar</button>

        </div>

      </div>
    );
  }
}

export default Login;
