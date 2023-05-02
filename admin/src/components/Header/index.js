import React, { useEffect, useState } from 'react'
import Sincronizar from './sincronizar.png'
import instance from '../../axios';
import './index.scss'


function Header() {
    const [user, setUser] = useState(false);
    const [pendentes, setPendentes] = useState(false);

    const sair = () => {
        localStorage.removeItem('user');
        window.location.href = '/';
    }

    const handleSincronizar = () => {

        return new Promise((resolve, reject) => {
            enviaCheckIn().then((response) => {
               
            });
            const request = window.indexedDB.open("users", 1);

            request.onerror = () => reject("Error opening database");

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore("users", { keyPath: "id" });
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction("users", "readonly");
                const objectStore = transaction.objectStore("users");

                // Adicione um evento onerror à transação para verificar se a tabela existe
                transaction.onerror = (event) => {
                    const db = event.target.db;
                    if (!db.objectStoreNames.contains("users")) {
                        db.createObjectStore("users", { keyPath: "id" });
                    }
                };

                const request = objectStore.getAll();

                request.onsuccess = () => {
                    const users = request.result;
                    if (users.length > 0) {
                        instance.post('/user', users).then((response) => {
                            const request = window.indexedDB.open("users", 1);

                            request.onerror = () => reject("Error opening database");

                            request.onupgradeneeded = (event) => {
                                const db = event.target.result;
                                db.createObjectStore("users", { keyPath: "id" });
                            };

                            request.onsuccess = (event) => {
                                const db = event.target.result;
                                const transaction = db.transaction("users", "readwrite");
                                const objectStore = transaction.objectStore("users");

                                // Adicione um evento onerror à transação para verificar se a tabela existe
                                transaction.onerror = (event) => {
                                    const db = event.target.db;
                                    if (!db.objectStoreNames.contains("users")) {
                                        db.createObjectStore("users", { keyPath: "id" });
                                    }
                                };

                                const request = objectStore.clear();

                                request.onsuccess = () => {
                                    enviaCheckIn();
                                };
                            };
                        }).catch((error) => {
                            console.log(error);
                            resolve(false);
                        });


                    } else {
                        resolve(false);
                    }
                }
            };
        });



    }

    function enviaCheckIn() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open("event_user", 1);

            request.onerror = () => reject("Error opening database");

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore("event_user", { keyPath: "id" });
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction("event_user", "readonly");
                const objectStore = transaction.objectStore("event_user");

                // Adicione um evento onerror à transação para verificar se a tabela existe
                transaction.onerror = (event) => {
                    const db = event.target.db;
                    if (!db.objectStoreNames.contains("event_user")) {
                        db.createObjectStore("event_user", { keyPath: "id" });
                    }
                };

                const request = objectStore.getAll();

                request.onsuccess = () => {
                    const event_user = request.result;
                    if (event_user.length > 0) {
                        instance.post('/checkin', event_user).then((response) => {
                            const request = window.indexedDB.open("event_user", 1);

                            request.onerror = () => reject("Error opening database");

                            request.onupgradeneeded = (event) => {
                                const db = event.target.result;
                                db.createObjectStore("event_user", { keyPath: "id" });
                            };

                            request.onsuccess = (event) => {
                                const db = event.target.result;
                                const transaction = db.transaction("event_user", "readwrite");
                                const objectStore = transaction.objectStore("event_user");

                                // Adicione um evento onerror à transação para verificar se a tabela existe
                                transaction.onerror = (event) => {
                                    const db = event.target.db;
                                    if (!db.objectStoreNames.contains("event_user")) {
                                        db.createObjectStore("event_user", { keyPath: "id" });
                                    }
                                };

                                const request = objectStore.clear();

                                request.onsuccess = () => {
                                    enviaCheckIn();
                                };
                            };
                        }).catch((error) => {
                            console.log(error);
                            resolve(false);
                        });


                    } else {
                        resolve(false);
                    }
                }
            };
        });


    }

    useEffect(() => {

        const user = JSON.parse(localStorage.getItem('user'));

        if (!user) {
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }

        if (!user) {
            return;
        }

        setUser({
            name_admin: user.name_admin || 'Admin',
        });

        function hasPendingItems() {
            return new Promise((resolve, reject) => {
                const request = window.indexedDB.open("users", 1);

                request.onerror = () => reject("Error opening database");

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    db.createObjectStore("users", { keyPath: "id" });
                };

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction("users", "readonly");
                    const objectStore = transaction.objectStore("users");

                    // Adicione um evento onerror à transação para verificar se a tabela existe
                    transaction.onerror = (event) => {
                        const db = event.target.db;
                        if (!db.objectStoreNames.contains("users")) {
                            db.createObjectStore("users", { keyPath: "id" });
                        }
                    };

                    const request = objectStore.getAll();

                    request.onsuccess = () => {
                        const users = request.result;
                        if (users.length > 0) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    };

                    request.onerror = () => reject("Error retrieving data from object store");
                };
            });
        }

        function hasPendingItems2() {
            return new Promise((resolve, reject) => {
                const request = window.indexedDB.open("event_user", 1);

                request.onerror = () => reject("Error opening database");

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    db.createObjectStore("event_user", { keyPath: "id" });
                };

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction("event_user", "readonly");
                    const objectStore = transaction.objectStore("event_user");

                    // Adicione um evento onerror à transação para verificar se a tabela existe
                    transaction.onerror = (event) => {
                        const db = event.target.db;
                        if (!db.objectStoreNames.contains("event_user")) {
                            db.createObjectStore("event_user", { keyPath: "id" });
                        }
                    };

                    const request = objectStore.getAll();

                    request.onsuccess = () => {
                        const event_user = request.result;
                        if (event_user.length > 0) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    };

                    request.onerror = () => reject("Error retrieving data from object store");
                };
            });
        }







        setInterval(async () => {
            const hasPending = await hasPendingItems();
            const hasPending2 = await hasPendingItems2();

            if (hasPending || hasPending2) {
                setPendentes(true);
            } else {
                setPendentes(false);
            }

        }, 1000);

    }, []);



    if (!user) {
        return null;
    }


    return (
        <header>
            <h1>Bem-vindo, {user.name_admin}!</h1>
            <div className='sincronizar'>
                {pendentes && <span onClick={
                    () => handleSincronizar()
                }>Itens pendentes para sincronizar<img src={Sincronizar} alt="Sincronizar" width={40} /></span>}
            </div>
            <a onClick={sair}>Sair</a>
        </header>

    )
}

export default Header;