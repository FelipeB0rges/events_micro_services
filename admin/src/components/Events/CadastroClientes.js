import React, { useEffect, useState } from 'react';
import './client.scss'
import instance from '../../axios';
import Swal from 'sweetalert2';

function CadastroClientes() {
    const [cpf, setCpf] = useState('');
    const [email_user, setEmail] = useState('');
    const [password_user, setPassword] = useState('');
    const [name_user, setName] = useState('');
    const [users, setUsers] = useState([]);
    const [init, setInit] = useState(false);

    function saveUserInIndexedDB(user) {
        // Abrir conexão com o IndexedDB
        const request = indexedDB.open('users', 1);

        request.onerror = (event) => {
            console.error('Erro ao abrir conexão com o IndexedDB:', event.target.error);
        };

        request.onupgradeneeded = (event) => {
            // Cria ou atualiza o objeto de armazenamento
            const db = event.target.result;
            const objectStore = db.createObjectStore('users', { keyPath: 'cpf' });
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('users', 'readwrite');
            const objectStore = transaction.objectStore('users');

            // Adiciona o usuário ao objeto de armazenamento
            const request = objectStore.add(user);

            request.onerror = (event) => {
                console.error('Erro ao adicionar usuário ao IndexedDB:', event.target.error);
            };

            request.onsuccess = (event) => {
                console.log('Usuário salvo no IndexedDB:', user);
            };

            transaction.oncomplete = () => {
                db.close();
            };
        };
    }


    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            cpf,
            email_user,
            password_user,
            name_user,
        };

        console.log(data);

        if (!cpf || !email_user || !password_user || !name_user) {
            Swal.fire({
                icon: "error",
                title: "Preencha todos os campos!",
                showConfirmButton: false,
                timer: 1500,
            });
            return;
        }

        if (navigator.onLine) {
            // Envia os dados para o servidor se estiver online
            instance
                .post("/user", data)
                .then((response) => {
                    setCpf("");
                    setEmail("");
                    setPassword("");
                    setName("");
                    if (!response.data) {
                        Swal.fire({
                            icon: "error",
                            title: "CPF já cadastrado!",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                        setInit(!init);
                        return;
                    } else {
                        setInit(!init);
                        Swal.fire({
                            icon: "success",
                            title: "Cliente cadastrado com sucesso!",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    }
                })
                .catch((error) => {
                    setCpf("");
                    setEmail("");
                    setPassword("");
                    setName("");
                    Swal.fire({
                        icon: "error",
                        title: "CPF já cadastrado!",
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    console.log(error);
                });
        } else {
            // Salva os dados no IndexedDB se estiver offline
            saveUserInIndexedDB(data);
            Swal.fire({
                icon: "success",
                title: "Cliente cadastrado com sucesso! (offline)",
                showConfirmButton: false,
                timer: 1500,
            });
        }
    };

    useEffect(() => {
        instance.get('/users')
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [init]);


    return (
        <>

            <form className='form' onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="cpf">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name_user}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="cpf">CPF:</label>
                    <input
                        type="text"
                        id="cpf"
                        value={cpf}
                        onChange={(e) => {
                            if (e.target.value.length > 11) {
                                return;
                            }
                            setCpf(e.target.value);
                        }}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email_user}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password">Senha:</label>
                    <input
                        type="password"
                        id="password"
                        value={password_user}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">Cadastrar</button>
            </form>
            <div className="client-list">
                {users.map((client, index) => (
                    <div className="client" key={index}>
                        <h2>{client.name_user}</h2>
                        <p>{client.email_user}</p>
                        <p>{client.cpf}</p>
                    </div>
                ))}
            </div>
        </>
    );
}

export default CadastroClientes;
