import React, { Component } from "react";
import "../resources/style/headerStyle.css";
import logo from "../resources/images/ruth_logo.png";

export class Header extends Component {
  render() {
    return (
        <header id="ruthHeader">
          <img id='logo' src={logo} alt="ruth_logo" />
          <p id='headerTitle'>RUTH</p>
        </header>
    );
  }
}