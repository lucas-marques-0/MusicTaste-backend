import { DatabasePostgres } from "./database-postgres.js"
import fastify from "fastify";
import cors from "fastify-cors";

const server = fastify({ logger: true })
const database = new DatabasePostgres()

server.register(cors, {
  origin: 'https://musictasteshare.vercel.app', 
  // origin: 'http://localhost:4200', 
});

server.post('/usuarios', async (request, reply) => {
    const { username, email, password, avatar, musicas } = request.body
    await database.criarUsuario({
        username: username,
        email: email,
        password: password,
        avatar: avatar,                     
        musicas: musicas
    })
    return reply.status(201).send()
})

server.get('/usuarios', async (request, reply) => {
    const usuarios = await database.buscarUsuarios()
    return usuarios
})

server.get('/usuarios/:userInfo', async (request, reply) => {
  const userInfo = request.params.userInfo;
  if (userInfo.lenght > 15) {
    return infosUsuario = await database.buscarInfoUsuarioID(userInfo)
  } else {
    return infosUsuario = await database.buscarInfoUsuarioUsername(userInfo)
  }
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
