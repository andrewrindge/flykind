const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const filepath = "./airportcodes.db";

function connectToDatabase() {
  if (fs.existsSync(filepath)) {
    return new sqlite3.Database(filepath);
  } else {
    const db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
      createTable(db);
      console.log("Connected to the database successfully");
    });
    return db;
  }
}

function createTable(db) {
  db.exec(`
  CREATE TABLE airportcodes
  (
    abbr VARCHAR(100),
    airportname VARCHAR(100),
    latitude REAL(50),
    longitude REAL(50),
    altitude REAL(50),
    TZ INT(10),
    DST VARCHAR(10)
  )
`);
}

module.exports = connectToDatabase();