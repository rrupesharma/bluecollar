const pg = require("pg");
const config = require("config");
const getPool = config.get("db");

const pool = new pg.Pool({
  host: getPool.host,
  port: getPool.port,
  user: getPool.username,
  password: getPool.password,
  database: getPool.db,
  max: 1000,
  // ssl: {
  //     sslmode: 'require',
  //     rejectUnauthorized: false
  // },
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 50000000,
});

async function executeQuery(query, bindvars = []) {
  return new Promise(async function (resolve, reject) {
    let client = null;
    try {
      client = await pool.connect();
      //console.log(query,bindvars);
      let result = await client.query(query, bindvars);
      resolve(result);
    } catch (error) {
      reject({ stack: error.stack, query: query });
    } finally {
      if (client != null) {
        client.release();
      }
    }
  });
}

async function executeQueryWithMsg(query, bindvars = [], msg) {
  return new Promise(async function (resolve, reject) {
    let client = null;
    try {
      client = await pool.connect();
      //console.log(query,bindvars)
      let result = await client.query(query, bindvars);

      if (result.rows.length > 0) resolve(result.rows);

      reject({ status: 404, message: msg, data: null });
    } catch (error) {
      reject({ stack: error.stack, query: query });
    } finally {
      if (client != null) {
        client.release();
      }
    }
  });
}

async function executeBulkQuery(query, bindvars = []) {
  return new Promise(async function (resolve, reject) {
    let client = null;
    let data = "";
    try {
      client = await pool.connect();
      for (let [count, item] of bindvars.entries()) {
        data = JSON.stringify(filterSingleQoute(item));
        //data = JSON.stringify(item);
        let result = await client.query(query, [data]);
        //console.log('result',count,result.rows)
      }
      resolve(true);
    } catch (error) {
      reject({ stack: error.stack, query: query });
    } finally {
      if (client != null) {
        client.release();
      }
    }
  });
}

function filterSingleQoute(data) {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      data[key] =
        typeof data[key] == "string" && data[key].indexOf("'") > -1
          ? data[key].split("'").join("''")
          : data[key];
    }
  }
  return data;
}

exports.executeQuery = executeQuery;
exports.executeQueryWithMsg = executeQueryWithMsg;
exports.executeBulkQuery = executeBulkQuery;
exports.pool = pool;
