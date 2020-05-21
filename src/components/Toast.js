import React from 'react';
import { DefaultToast } from 'react-toast-notifications';

export const CustomToast = ({ children, ...props }) => <DefaultToast {...props}>{children}</DefaultToast>;
