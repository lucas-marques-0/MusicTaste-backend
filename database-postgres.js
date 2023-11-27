import { randomUUID } from "crypto"
import { sql } from "./db.js"

export class DatabasePostgres {
    async criarUsuario(usuario) {
        const usuarioId = randomUUID()
        const { username, email, password, avatar, musicas } = usuario
        await sql `insert into usuarios (id, username, email, password, avatar, musicas) VALUES (${usuarioId}, ${username}, ${email}, ${password}, ${avatar}, ${musicas})`
    }

    async buscarUsuarios() {
        let usuarios = await sql `select * from usuarios`
        return usuarios
    }

    async buscarUsuarioID(userID) {
        let infosUsuarios = await sql `select * from usuarios where id = ${userID}`
        return infosUsuarios
    }

    async atualizarMusicasUsuario(id, musicasAtualizadas) {
        await sql `UPDATE usuarios SET musicas = ${musicasAtualizadas} WHERE id = ${id}`
    }
}