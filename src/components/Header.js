import React, { Component } from "react";
import "./style/Header.css";
import logo from "./images/logo.png";

export class Header extends Component {
  render() {
    return (
      <div>
        <header>
          <img src={logo} alt="logo" height="30px" width="30px" />
          <h1>RUTH</h1>
        </header>
      </div>
    );
  }
}
