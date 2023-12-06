import express from 'express';
import cors from 'cors'
import jwt from 'jsonwebtoken';
import { DatabasePostgres } from './database-postgres.js';

const app = express();
const port = process.env.PORT || 3333;
const database = new DatabasePostgres();

app.use(cors({
  origin: '*',
  //methods: 'GET, HEAD, PUT, DELETE, POST, OPTIONS',
  //allowedHeaders: '*'
}))

/* const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['Authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ message: 'Não achou o token.', token: token })
  };

  const user = verifyToken(token);
  if (!user) {
    return res.status(404).json({ message: 'Unauthorized: invalid token.' })
  };

  req.user = user;
  next();
} */

function verifyToken(token) {
  const decodedToken = jwt.verify(token, 'segredo-do-jwt');
  const user = database.buscarUsuarioID(decodedToken.id);
  return user;
} 

app.use('/verificar-token', async (req, res) => {
  const { token } = req.headers;
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });
  return jwt.verify(token, 'segredo-do-jwt');
});

app.use(express.json());

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

app.get('/usuarios/:id', async (req, res) => {
  const userID = req.params.id;
  const userInfo = await database.buscarUsuarioID(userID);
  return res.json(userInfo);
});

app.put('/usuarios/:id', async (req, res) => {
  const { userID, musicasUsuario } = req.body;
  await database.atualizarMusicasUsuario(userID, musicasUsuario);
  return res.status(201).send();
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
