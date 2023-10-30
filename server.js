import { DatabasePostgres } from "./database-postgres.js"
import fastify from "fastify";
import cors from "fastify-cors";
const bcrypt = require('bcrypt');

const server = fastify({ logger: true })
const database = new DatabasePostgres()

server.register(cors, {
  origin: 'https://musictasteshare.vercel.app', 
  // origin: 'http://localhost:4200', 
});

server.post('/usuarios', async (request, reply) => {
    const { username, password, avatar, musicas } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await database.criarUsuario({
        username: username,
        password: hashedPassword,
        avatar: avatar,                     
        musicas: musicas
    })
    return reply.status(201).send()
})

server.get('/usuarios', async (request, reply) => {
    const usuarios = await database.buscarUsuarios()
    return usuarios
})

server.get('/usuarios/:id', async (request, reply) => {
  const userID = request.params.id;
  const infosUsuario = await database.buscarInfosUsuario(userID)
  return infosUsuario
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
