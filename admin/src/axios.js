import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://devfelipeborges.com.br/eventos/', // substitua pela URL da sua API
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;
