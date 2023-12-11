import express from 'express';
import cors from 'cors'
import jwt from 'jsonwebtoken';
import { DatabasePostgres } from './database-postgres.js';

const app = express();
const port = process.env.PORT || 3333;
const database = new DatabasePostgres();

app.use(cors({
  origin: '*',
}));

app.use(express.json());

const authenticateToken = (req, res, next) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Não achou o token.' })

  const verifyToken = jwt.verify(token, 'segredo-do-jwt');
  if (!verifyToken) return res.status(404).json({ message: 'Token inválido.' })

  next();
}

app.post('/usuarios', async (req, res) => {
  const { action } = req.body;
  if (action === 'cadastro') {
    const { username, email, password, avatar, musicas } = req.body;
    await database.criarUsuario({
      username: username,
      email: email,
      password: password,
      avatar: avatar,
      musicas: musicas,
    });
    return res.status(201).send();
  }
  if (action === 'login') {
    const { userID, password } = req.body;
    const userInfo = await database.buscarUsuarioID(userID);
    const userPassword = userInfo[0].password;
    if (userPassword === password) {
      const token = jwt.sign({ id: userInfo.id, email: userInfo.email }, 'segredo-do-jwt', {
        expiresIn: '1d',
      });
      const userObject = { ...userInfo[0], password: undefined };
      return res.status(201).json({ token, user: userObject });
    } else {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
  }
});

app.get('/usuarios', async (req, res) => {
  const users = await database.buscarUsuarios();
  const userObjects = users.map((user) => {
    const { password, ...userObject } = user;
    return userObject;
  });
  return res.json(userObjects);
});

app.post('/usuarios/:id', authenticateToken, async (req, res) => {
  const userID = req.params.id;
  const userInfos = await database.buscarUsuarioID(userID);
  const userObject = { ...userInfos[0], password: undefined };
  return res.status(201).json(userObject);
});

app.put('/usuarios/:id', authenticateToken, async (req, res) => {
  const { userID, musicasUsuario } = req.body;
  await database.atualizarMusicasUsuario(userID, musicasUsuario);
  return res.status(201).send();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
