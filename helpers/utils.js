const config = require('config');
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const CryptoJS = require("crypto-js");
const setCookie = require('set-cookie-parser');
const base64 = require('base-64');
const pool = require('../models/pgconnection');
const mail = require('./mail');

/**
 * Encrypt String
 * @param {*} text 
 */
function encrypt(text) {
    return CryptoJS.AES.encrypt(text, config.get('encrypt').salt).toString();
}

/**
 * Decrypt string
 * @param {*} text 
 */
function decrypt(text) {
    return CryptoJS.AES.decrypt(text, config.get('encrypt').salt).toString(CryptoJS.enc.Utf8);
}

function returnStatus(res, data, status_code = 404, status_message='Invalid data') {
    //if(!data) return res.status(status_code || 404).send({status:'ERROR', 'message': status_message});
    return res.status(status_code).send({status:status_code==200?"OK":"FAIL",message:status_message,data:data});
}

function IsJsonString(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}

async function handleTestEntry(table, data, flag=1) {
    return new Promise(async function(resolve, reject) {
        try {
            let query = '';
            let result = null;
            if(flag==1){
                query = `insert into public.${table} `;
                let field = '';
                let value = '';
                for (let [k, v] of Object.entries(data)) {
                    field +=k+',';
                    value +=typeof v == 'number' ? v+',':`'${v}',`;
                }
                field = field.replace(/,\s*$/, "");
                value = value.replace(/,\s*$/, "");
                query += `(${field}) values (${value}) `
                result = await pool.executeQuery(query,[])
                resolve(true)
            }else{
                query = `delete from public.${table} `;
                let where = 'where ';
                for (let [k, v] of Object.entries(data)) {
                    let value =typeof v == 'number' ? v:`'${v}'`;
                    where +=`${k}=${value} and `;
                }
                query += where.replace(/and\s*$/, "")
                result = await pool.executeQuery(query,[])
                resolve(true)
            }
        } catch (error) {
            console.log("error=",error)
        }
        
    })
}

function pgFormat(values) {
    if(Array.isArray(values)){
        return `'${values.join("','")}'`;
    }
    return null;
}

function getDateTime(date, format){
    let DD = "";
    let MM = "";
    let HH = "";
    let Minutes = "";
    let SS = "";
    if(date){
        DD = (date.getDate() < 10 ? '0' : '') + date.getDate();
        MM = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
        HH = (date.getHours() < 10 ? '0' : '') + date.getHours();
        Minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
        SS = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    }
    if(date && format === "MM/DD/YYYY HH:MM"){
        return `${MM}/${DD}/${date.getFullYear()} ${HH}:${Minutes}`;
    }else if(date && format === "YYYY-MM-DD"){
        return `${date.getFullYear()}-${MM}-${DD}`;
    }else if(date && format === "YYYY-MM-DD HH:MM:SS"){
        return `${date.getFullYear()}-${MM}-${DD} ${HH}:${Minutes}:${SS}`;
    }else if(!date && format){
        return "";
    }else{
        let d = new Date();
        let amOrPm = (d.getHours() < 12) ? "AM" : "PM";
        let hour = (d.getHours() < 12) ? d.getHours() : d.getHours() - 12;
        hour = (hour < 10 ? '0' : '') + hour;
        let DD = (d.getDate() < 10 ? '0' : '') + d.getDate();
        let MM = ((d.getMonth() + 1) < 10 ? '0' : '') + (d.getMonth() + 1);
        let Minutes = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        let SS = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
        return `${MM}/${DD}/${d.getFullYear()} ${hour}:${Minutes}:${SS} ${amOrPm}`;
    }
}

function escapeSingleQuote(value) {
    return value.replace(/'/g, "''");
}

function sysErrorLog(error,filename,is_cronjob=false){
    let funcName = sysErrorLog.caller.name;
    let errorLog = escapeSingleQuote(error.stack);
    let errorQuery = error.query !=undefined ? escapeSingleQuote(error.query):'';
    let query = `INSERT INTO public.sys_error_log(
        error_log, error_query, error_function, error_file, is_cronjob)
        VALUES ('${errorLog}', '${errorQuery}', '${funcName}', '${filename}',${is_cronjob});`;
    (async () => {
        await pool.executeQuery(query, []);
        if(is_cronjob && (errorLog.indexOf('Request failed with status code 500')>-1 || errorLog.indexOf('Request failed with status code 415')>-1)){
        //if(is_cronjob && errorLog.indexOf('Request failed with status code 500')>-1){
            let updateQuery = `UPDATE public.myob_cron
                SET scheduled=false
                WHERE apiname='${funcName}' RETURNING *;`;
            let result = await pool.executeQuery(updateQuery, []);
            //console.log('result.rows==',result.rows)
            let cronName = []
            for (let [count, item] of result.rows.entries()) {
                cronName.push(item.name)
            }
            let CRON_NAME = cronName.join(",");
            let to = config.to_mail;
            let resultMail = await pool.executeQuery(`select * from email_tempate_tbl where temp_name='Cron job Stop'`, []);
            let subject = resultMail.rows[0]['temp_subject'].replace('{CRON_NAME}',CRON_NAME);
            let body = resultMail.rows[0]['temp_body'].replace('{CRON_NAME}',CRON_NAME);
            mail.send(to,subject,body)
        }
    })();
}

function filterSingleQoute(data){
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            data[key] = typeof data[key] == 'string' && data[key].indexOf("'") > -1 ? data[key].split("'").join("''") : data[key];
        }
    }
    return data;
}

function recordTypeId(type) {
    if(type === "customer") {
        return "012O0000000cHxiIAE";
    } else if(type === "supplier") {
        return "012O0000000cHxdIAE";
    }
    return "";
}

async function customAxios(option,erroHandel){
    return new Promise(async function (resolve, reject) {
        try {
            let response = await axios(option) 
            resolve(response)
        } catch (error) {
            error.item = erroHandel
            reject(error)
        }
    })
}

module.exports = {
    encrypt,
    decrypt,
    returnStatus,
    IsJsonString,
    handleTestEntry,
    pgFormat,
    escapeSingleQuote,
    sysErrorLog,
    filterSingleQoute,
    getDateTime,
    recordTypeId,
    customAxios
}

