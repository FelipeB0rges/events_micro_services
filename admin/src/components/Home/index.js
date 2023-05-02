import React, { useState } from 'react';
import './index.scss';
import instance from '../../axios';

function Home() {
    const [email_admin, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function handleEmailChange(event) {
        setEmail(event.target.value);
    }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();

        const data = {
            email_admin,
            password,
        };

        instance.post('/admin_login', data).then((response) => {
            let response_ = response.data;
            if (response) {
                localStorage.setItem('user', JSON.stringify(response.data));
                window.location.href = '/events';
               
            }
        },
            (error) => {
                console.log(error);
            });
    }

    return (
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email_admin}
                        onChange={handleEmailChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Senha</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </div>
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
}

export default Home;
