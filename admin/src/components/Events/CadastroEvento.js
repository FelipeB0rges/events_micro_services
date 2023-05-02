import React, { useState } from 'react';
import instance from '../../axios';
import './event.scss'
import Swal from 'sweetalert2';

function EventForm(props) {

    const [name, setName] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            name_event: name,
            date_event: date,
        };

        if (!name || !date) {
            Swal.fire({
                icon: 'error',
                title: 'Preencha todos os campos!',
                showConfirmButton: false,
                timer: 1500
            })
            return;
        }
        instance.post('/event', data)
            .then((response) => {
                setName('');
                setDate('');
                props.Tab(0)


                Swal.fire({
                    icon: 'success',
                    title: 'Evento cadastrado com sucesso!',
                    showConfirmButton: false,
                    timer: 1500
                })

            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <form className='event-form' onSubmit={handleSubmit}>
            <label>
                Nome do Evento:
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
                Data do Evento:
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <button type="submit">Cadastrar</button>
        </form>
    );
}

export default EventForm;
