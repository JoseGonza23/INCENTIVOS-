const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'incentivos',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/metas_penalidades', (req, res) => {
  const id = req.query.id;

  const queryMetas = `SELECT * FROM metas WHERE coordinador_ID = ${id};`;
  const queryPenalidades = `SELECT * FROM penalizacion WHERE coordinador_ID = ${id};`;

  connection.query(queryMetas, (errorMetas, resultsMetas) => {
    if (errorMetas) {
      console.error('Error querying database for metas:', errorMetas);
      res.status(500).json({ error: 'Error querying database for metas' });
      return;
    }

    connection.query(queryPenalidades, (errorPenalidades, resultsPenalidades) => {
      if (errorPenalidades) {
        console.error('Error querying database for penalidades:', errorPenalidades);
        res.status(500).json({ error: 'Error querying database for penalidades' });
        return;
      }

      res.json({ metas: resultsMetas, penalidades: resultsPenalidades });
    });
  });
});

app.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  connection.query('DELETE FROM coordinadores WHERE id = ?', [id], (err, results) => {
      if (err) {
          handleError(res, 'Error al eliminar el registro', 500);
          return;
      }
      res.json({ message: 'Registro eliminado correctamente' });
  });
});

app.post('/insertar_datos', async (req, res) => {
  const { nombre, descripcion, penalizacion, coordinador } = req.body;

  try {
    // Consulta SQL para insertar datos
    const sql = `INSERT INTO penalizacion (Nombre, Descripcion, Penalizacion, Coordinador_ID) VALUES (?, ?, ?, ?)`;
    await connection.query(sql, [nombre, descripcion, penalizacion, coordinador]);
    console.log('Datos insertados correctamente.');
    res.json({ success: true, message: 'Datos insertados correctamente' });
  } catch (error) {
    console.error('Error al insertar datos:', error);
    res.status(500).json({ success: false, message: 'Error al insertar datos' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
