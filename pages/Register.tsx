
import React from 'react';
import { Login } from './Login';

interface RegisterProps {
  onRegister: (user: any) => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  return <Login onLogin={onRegister} initialMode="signup" />;
};
