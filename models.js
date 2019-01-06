var mysql = require('mysql')

var con = mysql.createConnection({
    host: "sql12.freemysqlhosting.net",
    user: "sql12272481",
    password: "u9RHXtNkTc",
    multipleStatements: true
});

module.exports = con