import React, { useState } from 'react';
import Modal from 'react-modal';
import Button from './Button';

interface Props {
  open: boolean;
  type: string;
}

export default function LoginPopup(props:Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const isLogin = (props.type === "login");

  const valid = Boolean(password && password2 && password === password2);

  const login = () => {

  }
  const signUp = () => {

  }

  return (
    <Modal
        isOpen={props.open}
        contentLabel={props.type}
        closeTimeoutMS={150}
        overlayClassName="modal"
        className="modalPage formModalPage"
    >
      <h1>{props.type}</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email"/>
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password"/>
      {!isLogin && <input value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="confirm password"/>}
      <Button text='go' active={valid}/>
    </Modal>
  )
}
