import React from 'react';
import { DefaultToast } from 'react-toast-notifications';

export const CustomToast = ({ children, ...props }) => (
  <DefaultToast {...props} style={{ marginTop: 50 }}>
    {children}
  </DefaultToast>
);
