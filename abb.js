const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const PORT = 8000;

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


const validateData = (req, res, next) => {
    const { nombre, operacion, segmento, campana, gerente, mes } = req.body;
    if (!nombre || !operacion || !segmento || !campana || !gerente || !mes) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    next();
};

function eliminarMeta(req, res) {
    const metaId = req.params.id;

    const query = 'DELETE FROM metas WHERE id = ?';
    connection.query(query, [metaId], (err, results) => {
        if (err) {
            handleError(res, 'Error al eliminar meta', 500);
            return;
        }
        res.json({ message: `Meta con ID ${metaId} eliminada correctamente` });
    });
}



const actualizarCoordinador = (req, res) => {
    const id = req.params.id;
    const { nombre, operacion, segmento, campana, gerente, mes } = req.body;
    const query = 'UPDATE coordinadores SET nombre=?, Operación=?, Segmeto=?, Campaña=?, Gerente=?, Mes=? WHERE id=?';
    connection.query(query, [nombre, operacion, segmento, campana, gerente, mes, id], (err, results) => {
        if (err) {
            console.error('Error al actualizar datos: ' + err);
            return res.status(500).json({ error: 'Error al actualizar datos' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró ningún registro para actualizar' });
        }
        res.json({ message: 'Datos actualizados correctamente' });
    });
};

const eliminarCoordinador = (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM coordinadores WHERE id=?';
    connection.query(query, [id], (err, results) => { 
        if (err) {
            console.error('Error al eliminar el registro: ' + err);
            return res.status(500).json({ error: 'Error al eliminar el registro' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'No se encontró ningún registro para eliminar' });
        }
        res.json({ message: 'Registro eliminado correctamente' });
    });
};



app.post('/metas', (req, res) => {
    const { coordinador_ID, Metas, Piso_1, Piso_2, Piso_3 } = req.body;
    const query = 'INSERT INTO metas (coordinador_ID, Metas, Piso_1, Piso_2, Piso_3) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [coordinador_ID, Metas, Piso_1, Piso_2, Piso_3], (err, results) => {
        if (err) {
            console.error('Error al insertar datos en la tabla de metas: ' + err);
            res.status(500).json({ error: 'Error al insertar datos en la tabla de metas' });
            return;
        }
        res.json({ message: 'Datos insertados correctamente en la tabla de metas' });
    });
});



  
app.delete('/eliminar/:id', eliminarMeta);
app.patch('/actualizar/:id', validateData, actualizarCoordinador);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
