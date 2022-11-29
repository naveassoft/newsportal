import mysql from "mysql2/promise";

export async function mySql() {
  const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "newsportal",
    password: "",
    connectionLimit: 10,
    waitForConnections: true,
  });

  return db;
}
