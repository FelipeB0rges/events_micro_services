import React, { useEffect, useState } from 'react';
import instance from '../../axios';
import { useParams } from "react-router-dom";
import moment from 'moment/moment';
import './index.scss'


function Event(props) {

    const { id } = useParams();
    const [event, setEvent] = useState({});
    const [users_event, setUsersEvent] = useState([]);
    const [init, setInit] = useState(false);


    useEffect(() => {
        const fetchEvent = async () => {
            const response = await instance.get(`event/${id}`);
            const { data } = await response;
            console.log(data);
            setEvent(data[0]);
        };


        const getUsersEventFromIndexedDB = () => {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open("users", 1);
                request.onsuccess = () => {
                    const db = request.result;
                    const transaction = db.transaction("users", "readonly");
                    const store = transaction.objectStore("users");
                    const usersEventRequest = store.getAll();
                    usersEventRequest.onsuccess = () => {
                        const usersEventData = usersEventRequest.result;
                        resolve(usersEventData);
                    };
                    usersEventRequest.onerror = () => {
                        reject(usersEventRequest.error);
                    };
                };
                request.onerror = () => {
                    reject(request.error);
                };
            });
        };

        const fetchUsersEvent = async () => {
            try {
                const indexedDBUsersEvent = await getUsersEventFromIndexedDB();
                const response = await instance.get(`/event_user/${id}`);
                const { data } = await response;
                console.log(data);
                setUsersEvent([...indexedDBUsersEvent, ...data]);

            } catch (error) {
                console.log(error);
            }
        };

        fetchUsersEvent();

        fetchEvent();
    }, [init]);

    function saveDataInIndexedDB(dbName, storeName, data) {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(dbName, 1);

            request.onerror = () => reject("Error opening database");

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(storeName, { keyPath: "id" });
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(storeName, "readwrite");
                const objectStore = transaction.objectStore(storeName);

                console.log(data);


                const request = objectStore.put(data);

                request.onerror = () => reject("Error saving data to object store");

                request.onsuccess = () => resolve();


                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject("Error saving data to object store");
            };
        });
    }


    const handleInscricao = (cpf, email) => {
        let data = {
            cpf_user: cpf,
            id_event: id,
            email,
            active: 1
        };

        //se tem internet envia pro backend

        if (navigator.onLine) {
            instance
                .post("/event_user", data)
                .then((response) => {
                    console.log(response);
                    alert("Inscrição realizada com sucesso!");
                    setInit(!init);
                })
                .catch((error) => {
                    alert("Erro ao realizar inscrição!");
                    saveDataInIndexedDB("event_user", "event_user", data);
                });
        } else {

            alert("Inscrito (Offline)");
            saveDataInIndexedDB("event_user", "event_user", data);
            setInit(!init);
        }
    };

    const handleCancelamento = (cpf, email) => {
        const data = {
            cpf_user: cpf,
            id_event: id,
            email_user: email,
            active: false
        }

        if (navigator.onLine) {

            delete data.active;

            instance.delete(`/event_user/${data.cpf_user}/${data.id_event}`, { data }).then((response) => {
                console.log(response);
                alert('Cancelamento realizado com sucesso!');

                setInit(!init);

            }).catch((error) => {
                console.log(error);
                alert('Erro ao cancelar inscrição!');
            });
        } else {
            alert("Cancelado (Offline)");
            saveDataInIndexedDB("event_user", "event_user", data);
            setInit(!init);
        }

    }

    const handleCheckIn = (cpf, email) => {
        const data = {
            email_user: email,
            cpf_user: cpf,
            id_event: id,
            active: 2
        }
        if (navigator.onLine) {

            instance.post(`/checkin`, data).then((response) => {
                console.log(response);
                alert('Check-in realizado com sucesso!');
                setInit(!init);
            }
            ).catch((error) => {
                console.log(error);
                alert('Erro ao realizar check-in!');
            });
        } else {
            alert("Check in (Offline)");
            saveDataInIndexedDB("event_user", "event_user", data);
            setInit(!init);
        }
    }


    return (
        <>
            <div className='evento'>
                <h1>#{event.id_event}</h1>
                <h1>{event.name_event}</h1>
                <h2>{event.description}</h2>
                <h3>{moment(event.date_event).format(
                    'DD/MM/YYYY HH:mm:ss'
                )}</h3>
            </div>
            <table className='user-table'>
                <thead>
                    <tr>
                        <th>CPF</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {users_event.map((user, index) => (
                        <tr key={index}>
                            <td>{user.cpf}</td>
                            <td>{user.name_user}</td>
                            <td>{user.email_user}</td>
                            <td>
                                {(user.ativo == null || user.ativo == 1) && (
                                    <>
                                        <button className='btn' onClick={() => handleInscricao(user.cpf, user.email_user)} disabled={user.inscrito || user.ativo == 0}>Inscrever</button>
                                        <button className='btn btn-cancel ' onClick={() => handleCancelamento(user.cpf)} disabled={!user.inscrito || user.ativo == 0}>Cancelar</button>
                                        <button className='btn btn-check-in' onClick={() => handleCheckIn(user.cpf, user.email_user)} disabled={user.ativo == 0 || !user.inscrito}>Check-in</button>
                                    </>
                                )}


                                {
                                    (user.ativo == 0) && (
                                        <span className='status'>Compareceu ao evento</span>

                                    )
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

}

export default Event;