import React, { useEffect, useState } from 'react'
import instance from '../../axios';
import moment from 'moment/moment';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './events.scss'

export default function ListaEventos() {


    const [events, setEvents] = useState([]);
    const [init, setInit] = useState(false);
    const location = useLocation();



    useEffect(() => {


        console.log('location', location);
        const fetchEvents = async () => {
            const response = await instance.get(``);
            const { data } = await response;
            console.log(data);

            setEvents(data);
        };

        fetchEvents();
    }, [init]);

    return (
        <div className="event-list">
            {events.map((event, index) => (
                <div className="event" key={index}>
                    <h2>{event.name_event}</h2>
                    <p>{moment(event.date_event).format(
                        'DD/MM/YYYY'
                    )}</p>
                    <Link to={{ pathname: `/event/${event.id_event}`} }>Ver evento</Link>
                </div>
            ))
            }
        </div >
    )
}