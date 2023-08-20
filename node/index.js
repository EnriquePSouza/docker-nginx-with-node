const express = require('express')
const app = express()
const port = 3000
const config = {
    host: 'db',
    user: 'root',
    password: 'root'
};
const mysql = require('mysql')
const connection = mysql.createConnection(config)

const sqlDb = "CREATE DATABASE IF NOT EXISTS nodedb"
connection.query(sqlDb)

const sqlUse = "use nodedb"
connection.query(sqlUse)

const sqlPeople = "CREATE TABLE IF NOT EXISTS people (id int not null auto_increment, name varchar(255), primary key(id));"
connection.query(sqlPeople)

const sqlRegister = "INSERT INTO people(name) values('Enrique Souza')"
connection.query(sqlRegister)

app.get('/', (req, res) => {
    const sqlSelect = "SELECT * FROM people";
    connection.query(sqlSelect, (err, rows) => {
        if (err) {
            res.send('<h1>Erro ao buscar registros no banco de dados</h1>');
            return;
        }

        let namesList = '<ul>';
        rows.forEach(row => {
            namesList += `<li>${row.name}</li>`;
        });
        namesList += '</ul>';

        res.send(`
            <h1>Full Cycle Rocks!</h1>
            <h2>Nomes cadastrados no banco de dados:</h2>
            ${namesList}
        `);
    });
});

app.listen(port, ()=> {
    console.log('Rodando na porta ' + port)
})