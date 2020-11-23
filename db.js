const Pool = require("pg").Pool;

const pool = new Pool({
    user : "detasys",
    database: "klikdaily",
    host : "localhost",
    port: 5432
})

module.exports = pool;