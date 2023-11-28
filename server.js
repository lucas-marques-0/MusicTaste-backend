import { DatabasePostgres } from "./database-postgres.js"
import fastify from "fastify";
import cors from "fastify-cors";
import CryptoJS from "crypto-js";
import * as jwt from "jsonwebtoken";

const server = fastify({ logger: true })
const database = new DatabasePostgres()
server.register(cors, {
  origin: 'https://musictasteshare.vercel.app', 
  // origin: 'http://localhost:4200', 
});

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
    const userPassword = userInfo.password
    if (userPassword == password) {
      const token = jwt.sign({ id: userInfo.id, email: userInfo.email }, "segredo-do-jwt", { expiresIn: "1d" });
      return reply.status(201).send({ token, user: userInfo });
    } else {
      return reply.status(401).send({ error: 'Credenciais inválidas.', infos: { userID, password, userInfo, userPassword } });
    }
  }
})

server.get('/usuarios', async (request, reply) => {
    const usuarios = await database.buscarUsuarios()
    return usuarios
})

server.get('/usuarios/:id', async (request, reply) => {
  const userID = request.params.id;
  const userInfo = await database.buscarUsuarioID(userID)
  return userInfo
})

server.put('/usuarios/:id', async (request, reply) => {
  const { userID, musicasUsuario } = request.body
  await database.atualizarMusicasUsuario(userID, musicasUsuario)
  return reply.status(201).send()
})

server.listen({
  host: '0.0.0.0',
  port: process.env.PORT ?? 3333
})
