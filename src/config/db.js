const oracledb = require('oracledb');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

console.log('Database config:', {
  user: dbConfig.user,
  password: dbConfig.password ? '***' : 'MISSING',
  connectString: dbConfig.connectString
});
console.log('Full connection string:', dbConfig.connectString);

async function execute(sql, binds = []) {
  let connection;
  try {
    // Clean up SQL: trim whitespace
    let cleanedSql = sql.trim();

    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(cleanedSql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

module.exports = {
  execute
};