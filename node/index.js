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
            res.send('<h1>Error fetching records from database.</h1>');
            return;
        }

        let namesList = '<ul>';
        rows.forEach(row => {
            namesList += `<li>${row.name}</li>`;
        });
        namesList += '</ul>';

        res.send(`
            <h1>Full Cycle Rocks!</h1>
            <h2>List of registered names in database:</h2>
            ${namesList}
        `);
    });
});

app.listen(port, ()=> {
    console.log('Running at ' + port)
})