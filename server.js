import { DatabasePostgres } from "./database-postgres.js"
import fastify from "fastify";
import cors from "fastify-cors";
import jwt from 'jsonwebtoken';

const server = fastify({ logger: true })
const database = new DatabasePostgres()
server.register(cors, {
  origin: 'https://musictasteshare.vercel.app', 
  // origin: 'http://localhost:4200', 
});

const authenticatedRouteOptions = {
  preHandler: (request, reply, done) => {
    const token = request.headers.authorization?.replace(/^Bearer /, "");
    if (!token) reply.code(401).send({ message: "Unauthorized: token missing." });

    const user = verifyToken(token);
    if (!user) reply.code(404).send({ message: "Unauthorized: invalid token." });
    
    request.user = user;
    done();
  }
};

function verifyToken(token) {
  const decodedToken = jwt.verify(token, "segredo-do-jwt");
  const user = database.buscarUsuarioID(decodedToken.id);
  return user;
}

server.post('/usuarios', async (request, reply) => {
  const { action } = request.body
  if(action == 'cadastro') {
    const { username, email, password, avatar, musicas } = request.body
    await database.criarUsuario({
        username: username,
        email: email,
        password: password,
        avatar: avatar,                     
        musicas: musicas
    })
    return reply.status(201).send()
  } 
  if(action == 'login') {
    const { userID, password } = request.body
    const userInfo = await database.buscarUsuarioID(userID)
    const userPassword = userInfo[0].password
    if (userPassword == password) {
      const token = jwt.sign({ id: userInfo.id, email: userInfo.email }, "segredo-do-jwt", { expiresIn: "1d" });
      const userObject = { ...userInfo[0], password: undefined };
      return reply.status(201).send({ token, user: userObject });
    } else {
      return reply.status(401).send({ error: 'Credenciais inválidas.' });
    }
  }
})

server.get('/usuarios', async (request, reply) => {
    const users = await database.buscarUsuarios()
    const userObjects = users.map(user => {
      const { password, ...userObject } = user;
      return userObject;
    });
    return userObjects
})

server.get('/usuarios/:id', authenticatedRouteOptions, async (request, reply) => {
  const userID = request.params.id;
  const userInfo = await database.buscarUsuarioID(userID)
  return userInfo
})

server.put('/usuarios/:id', authenticatedRouteOptions, async (request, reply) => {
  const { userID, musicasUsuario } = request.body
  await database.atualizarMusicasUsuario(userID, musicasUsuario)
  return reply.status(201).send()
})

server.listen({
  host: '0.0.0.0',
  port: process.env.PORT ?? 3333
})
