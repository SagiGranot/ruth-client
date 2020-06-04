import React from 'react';
import { DefaultToast } from 'react-toast-notifications';
//import icon from '../resources/images/enemy_direction.png';

export const CustomToast = ({ children, ...props }) => {
  const mystyle = () => {
    return {
      transform: `rotate(${props.bearing}deg)`,
      width: '25px',
      marginLeft: '20px',
    };
  };

  return (
    <DefaultToast {...props}>
      {children}
      {props.bearing ? (
        <img src={'https://i.imgur.com/aKj5VeZ.png'} alt="direction" style={mystyle()} />
      ) : null}
    </DefaultToast>
  );
};
