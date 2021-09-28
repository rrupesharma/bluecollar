const config = require('config');
const pool = require('./pgconnection');
const { validate } = require('../helpers/validation');
const { escapeSingleQuote } = require('../helpers/utils');


async function getEmailTemplate(name) {
  return new Promise(async function (resolve, reject) {
    try {
      let result = await pool.executeQuery(`select * from email_tempate_tbl where temp_name='${name}'`, []);
      resolve(result.rows[0]);
    } catch (error) {
      reject(error)
    }
  })
}

async function getMyobUpsertData(endpoint) {
  return new Promise(async function (resolve, reject) {
    try {
      let result = await pool.executeQuery(`select * from myob_upsert_log where endpoint='${endpoint}' and is_processed = false and retry=0 order by creation_dt desc;`, []);
      resolve(result.rows);
    } catch (error) {
      reject(error)
    }
  })
}

async function updateMyobUpsert(id,is_processed,retry,response) {
  return new Promise(async function (resolve, reject) {
    try {
      response = escapeSingleQuote(response);
      let result = await pool.executeQuery(`UPDATE myob_upsert_log SET is_processed = ${is_processed},retry = ${retry},response = '${response}' where id=${id};`, []);
      resolve(result.rows);
    } catch (error) {
      reject(error)
    }
  })
}

async function updateMyobUpsertAsync(id,is_processed,retry,response) {
  response = escapeSingleQuote(response);
  await pool.executeQuery(`UPDATE myob_upsert_log SET is_processed = ${is_processed},retry = ${retry},response = '${response}' where id=${id};`, []);
}

async function getSaleOrderLine(id) {
  return new Promise(async function (resolve, reject) {
    try {
      let result = await pool.executeQuery(`select * from public.myob_salesorderline where salesorder_id=${id};`, []);
      resolve(result.rows);
    } catch (error) {
      reject(error)
    }
  })
}



exports.getEmailTemplate = getEmailTemplate
exports.getMyobUpsertData = getMyobUpsertData
exports.updateMyobUpsert = updateMyobUpsert
exports.updateMyobUpsertAsync = updateMyobUpsertAsync
exports.getSaleOrderLine = getSaleOrderLine