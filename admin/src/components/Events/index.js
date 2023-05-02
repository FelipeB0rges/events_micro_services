import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './index.scss';
import instance from '../../axios';

import CadastroEvento from './CadastroEvento';
import ListaEventos from './ListaEventos';
import CadastroCliente from './CadastroClientes';

function EventTabs() {
    const [activeTab, setActiveTab] = useState(0);

    const [user, setUser] = useState(false);
    const [events, setEvents] = useState([]);
    const [init, setInit] = useState(false);


    useEffect(() => {


        const fetchEvents = async () => {
            const response = await instance.get(`user_events/${user.cpf}`);
            const { data } = await response;
            console.log(data);
            setEvents(data);
        };

        fetchEvents();
    }, [init]);

    return (

        <>
      
            <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
                <TabList>
                    <Tab>Lista de Eventos</Tab>
                    <Tab>Cadastro de Eventos</Tab>
                    <Tab>Cadastro de Clientes</Tab>
                </TabList>

                <TabPanel>
                    <ListaEventos />
                </TabPanel>
                <TabPanel>
                    <CadastroEvento Tab={setActiveTab}/>
                </TabPanel>
                <TabPanel>
                    <CadastroCliente />
                </TabPanel>
            </Tabs>
        </>
    );
}


export default EventTabs;
