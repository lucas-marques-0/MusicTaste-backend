import { sql } from "./db.js";

 sql `
    CREATE TABLE usuarios (
        id TEXT PRIMARY KEY,
        username TEXT,
        email TEXT,
        password TEXT,
        avatar TEXT,
        musicas JSON[]   
    )`.then(() => console.log('Tabela criada!')) 


// Comando para deletar tabela.
/* sql `DROP TABLE IF EXISTS usuarios`.then(() => {
    console.log('tabela deletada!')
}) */
