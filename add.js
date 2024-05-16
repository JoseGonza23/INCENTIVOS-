const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(express.json()); 
app.use(cors({
    origin: 'http://127.0.0.1:5501' 
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'incentivos',
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});


const handleError = (res, message, status = 500) => {
    console.error(message);
    res.status(status).json({ error: message });
};

app.delete('/penalidades/:id', (req, res) => {
    const penalidadId = req.params.id;
    const query = 'DELETE FROM penalizacion WHERE id = ?';
    connection.query(query, [penalidadId], (err, results) => {
        if (err) {
            handleError(res, 'Error al eliminar penalidad', 500);
            return;
        }
        res.json({ message: `Penalidad con ID ${penalidadId} eliminada correctamente` });
    });
});

app.get('/data', (req, res) => {
    const { month } = req.query;
    let query = 'SELECT * FROM coordinadores';

    // Verifica si se ha proporcionado un mes en la consulta
    if (month !== undefined) {
        // Agrega una cláusula WHERE para filtrar por mes
        query += ` WHERE MONTH(fecha) = ${parseInt(month) + 1}`; // Sumamos 1 al mes porque en MySQL los meses van de 1 a 12
    }

    query += ' ORDER BY fecha DESC';

    connection.query(query, (err, results) => {
        if (err) {
            handleError(res, 'Error al obtener datos', 500);
            return;
        }
        res.json(results);
    });
});




app.get('/buscar', (req, res) => {
    const nombre = req.query.nombre;
    if (!nombre) {
        return res.status(400).json({ error: 'Por favor, proporciona un nombre para buscar.' });
    }
    const query = 'SELECT * FROM coordinadores WHERE nombre LIKE ?';
    connection.query(query, [`%${nombre}%`], (err, results) => {
        if (err) {
            handleError(res, 'Error al obtener datos', 500);
            return;
        }
        res.json(results);
    });
});
app.post('/insertar', (req, res) => {
    const { id, nombre, operacion, segmento, campana, gerente, mes } = req.body;
    const query = 'INSERT INTO coordinadores (id, nombre, Operación, Segmeto, Campaña, Gerente, Mes) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [id, nombre, operacion, segmento, campana, gerente, mes], (err, results) => {
        if (err) {
            console.error('Error al insertar datos: ' + err);
            res.status(500).json({ error: 'Error al insertar datos' });
            return;
        }
        res.json({ message: 'Datos insertados correctamente' });
    });
});

app.delete('/eliminar/:id', eliminarPena);
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
