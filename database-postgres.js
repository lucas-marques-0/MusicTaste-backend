import { randomUUID } from "crypto"
import { sql } from "./db.js"

export class DatabasePostgres {
    async criarUsuario(usuario) {
        const usuarioId = randomUUID()
        const { username, password, avatar, musicas } = usuario
        await sql `insert into usuarios (id, username, password, avatar, musicas) VALUES (${usuarioId}, ${username}, ${password}, ${avatar}, ${musicas})`
    }

    async buscarUsuarios() {
        let usuarios = await sql `select * from usuarios`
        return usuarios
    }

    async buscarInfosUsuario(userID) {
        let infosUsuarios = await sql `select * from usuarios where id = ${userID}`
        return infosUsuarios
    }

    async retornarUserLogin(username) {
        let infosUsuario = await sql `select * from usuarios where username = ${username}`
        return infosUsuario
    }

    async atualizarMusicasUsuario(id, musicasAtualizadas) {
        await sql `UPDATE usuarios SET musicas = ${musicasAtualizadas} WHERE id = ${id}`
    }
}