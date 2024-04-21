const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const smtpTransport = require('nodemailer-smtp-transport');

process.on('uncaughtException', function (err) {
    console.log(err);
    process.exit(1);
});

// Configuração da conexão com o MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'eventos'
});

// Conexão com o MySQL
connection.connect((err) => {
    if (err) throw err;
    console.log('Conexão com o MySQL estabelecida!');
});

// Configuração do Express
const app = express();
app.use(cors());
const port = 21027;

// Adicionando middleware para o Express entender JSON
app.use(express.json());

// Definição de uma rota de teste
app.get('/', (req, res) => {
    connection.query('SELECT * FROM event', (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.post('/event', (req, res) => {

    console.log(req);

    const event = {
        name_event: req.body.name_event,
        date_event: req.body.date_event
    }
    connection.query('INSERT INTO event (name_event,date_event) VALUES (?,?)', [event.name_event, event.date_event], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.post('/user', (req, res) => {

    let users = req.body;

    //transforma o objeto em array se nao for
    if (!Array.isArray(users)) {
        users = [users];
    }

    const values = users.map(user => [user.cpf, user.name_user, user.email_user, user.password_user]);

    connection.query('SELECT cpf FROM user WHERE cpf IN (?)', [users.map(user => user.cpf)], (err, results) => {
        if (err) throw err;



        if (results.length === 0) {
            connection.query('INSERT INTO user (cpf,name_user,email_user,password_user) VALUES ?', [values], (err, results) => {
                if (err) throw err;
                console.log('Inserted ' + results.affectedRows + ' row(s).');
                res.send(results);
            });
        } else {
            res.send('CPF já cadastrado no banco de dados');
        }
    });
});



app.post('/user_login', (req, res) => {

    const user = {
        cpf: req.body.cpf,
        password: req.body.password
    }

    connection.query('SELECT * FROM user WHERE cpf = ? AND password_user = ?', [user.cpf, user.password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            res.send(user);
        } else {
            res.send(false);
        }
    });
});

app.get('/user_events/:cpf', (req, res) => {
    const cpf = req.params.cpf;
    connection.query('SELECT e.*,eu.cpf_user,eu.active FROM event e LEFT JOIN event_user eu ON eu.id_event = e.id_event LEFT JOIN user u ON u.cpf = eu.cpf_user AND u.cpf = ?', [cpf], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.post('/event_user', (req, res) => {
    const event_user = {
        cpf_user: req.body.cpf_user,
        id_event: req.body.id_event
    }
    connection.query('INSERT INTO event_user (cpf_user,id_event) VALUES (?,?)', [event_user.cpf_user, event_user.id_event], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.delete('/event_user/:cpf_user/:id_event', (req, res) => {
    const cpf_user = req.params.cpf_user;
    const id_event = req.params.id_event;
    connection.query('DELETE FROM event_user WHERE cpf_user = ? AND id_event = ?', [cpf_user, id_event], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.post('/admin_login', (req, res) => {

    const admin = {
        email_admin: req.body.email_admin,
        password: req.body.password
    }
    connection.query('SELECT * FROM admin WHERE email_admin = ? AND password_admin = ?', [admin.email_admin, admin.password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const admin = results[0];
            res.send(admin);
        } else {
            res.send(false);
        }
    });
});

app.post('/event', (req, res) => {

    const event = {
        name_event: req.body.name_event,
        date_event: req.body.date_event
    }
    connection.query('INSERT INTO event (name_event,date_event) VALUES (?,?)', [event.name_event, event.date_event], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.get('/users', (req, res) => {
    connection.query('SELECT * FROM user', (err, results) => {
        if (err) throw err;

        res.send(results);
    });
});

app.get('/event/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM event WHERE id_event = ?', [id], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.get('/event_user/:id', (req, res) => {
    //get all users left join event_user
    const id = req.params.id;
    connection.query(`
    SELECT u.*,(SELECT id FROM event_user WHERE cpf_user = u.cpf AND id_event = ? LIMIT 1) as inscrito,(SELECT active FROM event_user WHERE cpf_user = u.cpf AND id_event = ? LIMIT 1) as ativo  FROM user u
    GROUP BY u.cpf
`, [id, id], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

const nodemailer = require('nodemailer');

app.post('/checkin', (req, res) => {
    let event_users;
    if (Array.isArray(req.body)) {
        event_users = req.body;
    } else {
        event_users = [req.body];
    }

    console.log(event_users);

    const emails = event_users.map((event_user) => event_user.email_user || event_user.email);



    event_users.forEach((event_user) => {
        connection.query('UPDATE event_user SET active = 0 WHERE cpf_user = ? AND id_event = ?', [event_user.cpf_user, event_user.id_event], (err, results) => {
            if (err) throw err;
            //se nao tem insere
            if (results.affectedRows == 0) {
                connection.query('INSERT INTO event_user (cpf_user,id_event,active) VALUES (?,?,0)', [event_user.cpf_user, event_user.id_event], (err, results) => {
                    if (err) throw err;
                });
            }
        });
    });



    const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: 'felipe.feti@hotmail.com',
            pass: 'FeLybdi8113*'
        }
    });

    // Configurar as informações do email
    const mailOptions = {
        from: 'felipe.feti@hotmail.com',
        to: emails,
        subject: 'Certificado do evento',
        text: 'Olá, o seu certificado do evento está disponível para download. Acesse o site para baixar.'
    };

    // Enviar o email
    transporter.sendMail(mailOptions, (error, info) => {
        res.send('ok');
        if (error) {
            console.log(error);
            res.send(error);
        } else {
            console.log('Email enviado: ' + info.response);
            res.send(results);
        }
    });
});



app.post('/offline_users', (req, res) => {
    const users = req.body.users;

    users.forEach(user => {
        //insert user
        connection.query('INSERT INTO user (cpf,name_user,email_user,password_user) VALUES (?,?,?,?)', [user.cpf, user.name_user, user.email_user, user.password_user], (err, results) => {
            if (err) throw err;
        });
    });
    res.send(true);
});



// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}!`);
});
