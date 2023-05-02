import React, { useState, useEffect } from 'react';
import instance from '../../axios';

function ListaClientes() {
    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        const fetchClientes = async () => {
            const response = await instance.get('/client');
            const { data } = await response;
            console.log(data);
            setClientes(data);
        };

        fetchClientes();
    }, []);

    return (
        <div className="clientes">
            {clientes.map((cliente, index) => (
                <div className="cliente" key={index}>
                    <h2>{cliente.nome}</h2>
                    <p>{cliente.email}</p>
                    <p>{cliente.cpf}</p>
                </div>
            ))}
        </div>
    );
}

export default ListaClientes;
