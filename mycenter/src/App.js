import React, { Component } from 'react';

import Header from './components/Header/Header';
import Login from './components/Login/Login';
const show = sessionStorage.getItem("user-key") != null ? <Header/> : <Login/>;

class App extends Component {
  render() {
    return (
      <Header />
    );
  }
}

export default App;
