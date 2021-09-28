const { returnStatus,sysErrorLog } = require('../helpers/utils');
const pool = require('../models/pgconnection');
const jwtToken = require('../helpers/jwtToken');
const iplocation = require('../helpers/iplocation');
const {validate} = require('../helpers/validation');
const mail = require('../helpers/mail');
const md5 = require('md5');
const adminModel = require('../models/admin.model');
const {getEmailTemplate} = require('../models/utils.model');
const config = require('config');

const login = async (req, res)=>{
    try {
        let rules = {
            username: 'required',
            password: 'required'
        }

        await validate(req.body, rules,[]);
        let username = req.body.username;
        let password = req.body.password;

        let query = `select * from admin_tbl where username='${username}' and password='${md5(password)}' and is_active = true`;
        //console.log(query);
        let result = await pool.executeQueryWithMsg(query, [], 'INVALID USERNAME OR PASSWORD')
        //console.log("result====",result)
        let iplocations = await iplocation.getIpLocation(req);
        let data = result[0];
        data.iplocation = iplocations
        /* let data = {
            userName: result[0]['customer_first_name'] + " " + result[0]['customer_last_name'],
            userId: result[0]['customer_id'],
            contactId: result[0]['contact_id'],
            accountNo: result[0]['account_no'],
            role: result[0]['role'],
            iplocation: iplocations
        } */
        //console.log("data====",data)
        let token = await jwtToken.generateLogin(data);
        return returnStatus(res, { userData: data, token: token }, 200, 'success')
    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const setForgotPassword = async (req, res)=>{
    try {

        let rules = {
            token: 'required|checkToken',
            password: 'required|conf_password:'+req.body.confpassword
        }

        await validate(req.body, rules,[]);
        let token = req.body.token;
        let password = req.body.password;
        let query = `update admin_tbl set password='${md5(password)}',reset_code='' where reset_code='${token}'`;
        // console.log(query);
        let result = await pool.executeQuery(query, [])

        return returnStatus(res, {}, 200, 'success')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const setChangePassword = async (req, res)=>{
    try {
        console.log("req.user===",req.user)
        let rules = {
            password: 'required|conf_password:'+req.body.confpassword
        }

        await validate(req.body, rules,[]);
        let token = req.body.token;
        let password = req.body.password;
        let query = `update admin_tbl set password='${md5(password)}' where id='${req.user.id}'`;
        let result = await pool.executeQuery(query, [])

        return returnStatus(res, {}, 200, 'success')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const sendForgotPasswordLink = async (req, res)=>{
    try {

        let rules = {
            email: 'required|email|checkLink'
        }

        await validate(req.body, rules,[]);
        let email = req.body.email;
        let token = await jwtToken.generate({ "email": email, action: 'reset', role: 'admin'}, 0.5)
        //let jwtDataDecord = await jwtToken.verify(jwtData)

        let query = `update admin_tbl set reset_code='${token}' where email = '${email}' Returning *;`;
        // console.log(query);
        let resultAdmin = await pool.executeQuery(query, [])
        //mail.send(email,'Sunshine reset password token',`Hi, <br><br>
        //please use below token to reset password <a href='https://sunshine-admin-frontend-dev.herokuapp.com/#/set-pwd?token=${token}'>link</a>`)
        let result = await getEmailTemplate('Dashboard Forgot Password Link');
        let name = resultAdmin.rows[0].first_name+' '+resultAdmin.rows[0].last_name;
        //let link = `${config.dasboardUrl}/#/set-pwd?token=${token}`;
        let subject = result['temp_subject'];
        let body = result['temp_body'].replace('{NAME}',name).replace('{TOKEN}',token);
        mail.send(email,subject,body);
        return returnStatus(res, {}, 200, 'successfully send mail')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const checkVerificationLink = async (req, res)=>{
    try {

        let rules = {
            token: 'required',
            username: 'required|checkUsername',
            password: 'required|conf_password:'+req.body.confpassword
        }

        await validate(req.body, rules,[]);
        let token = req.body.token;
        let password = req.body.password;
        let username = req.body.username;
        //let token = await jwtToken.generate({ "email": useremail, action: 'verification' }, 48)
        let token_data = await jwtToken.verify(token);
        let query = '';
        if(!token_data){
            return returnStatus(res, {}, 401, 'Invalid token')
        }else{
            if(token_data.role=='supplier'){
                let email = token_data.email
                let query = `select id from public.admin_tbl where email='${email}' and role='supplier'`;
                let checkuser = await pool.executeQuery(query, [])
                if(checkuser.rows.length >0 ){
                    return returnStatus(res, {}, 401, 'Supplier already exist')
                }
                query = `select accno,name,phone,email from public.myob_cr_accs where email='${email}'`;
                let result =  await pool.executeQueryWithMsg(query,[],'Invalid token.')
                query = `INSERT INTO public.admin_tbl(
                    extid,email, first_name, last_name, phone, username, password, role, creation_dt, is_active)
                    VALUES (${result[0].accno},'${result[0].email}', '${result[0].name}', '', '${result[0].phone}', '${username}', '${md5(password)}', '${token_data.role}', now(), true) returning id;`;
                await pool.executeQuery(query, [])
            }else{
                query = `select  * from admin_tbl where reset_code='${token}'`;
                let result =  await pool.executeQueryWithMsg(query,[],'Invalid token.')
                query = `update admin_tbl set password='${md5(password)}',username='${username}',reset_code='',is_active = true where reset_code='${token}'`;
                await pool.executeQuery(query, [])
            }
            return returnStatus(res, {}, 200, 'success')
        }
    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const create = async (req, res)=>{
    try {
        let rules = {
            email: 'required|email|email_available',
            first_name: 'required',
            last_name: 'required'
        }

        await validate(req.body, rules,[]);
        let data = req.body;
        let role = 'admin';
        let token = await jwtToken.generate({ "email": data.email, action: 'verification' ,role: role}, 48)
        let query = `INSERT INTO public.admin_tbl(
            email, first_name, last_name, phone, reset_code, role, created_by, creation_dt)
            VALUES ('${data.email}', '${data.first_name}', '${data.last_name}', '${data.phone || ""}', '${token}', '${role}', ${req.user.id}, now()) returning id;`;

        await pool.executeQuery(query, [])
        /*mail.send(data.email,'Sunshine Admin Verification e-mail',`Hi ${data.first_name}, <br><br> 
        Please click this verification <a href='https://sunshine-admin-frontend-dev.herokuapp.com/#/set-pwd?token=${token}'>link</a>
        <br><br>Regards,<br>Sunshine Team`) */
        let result = await getEmailTemplate('Customer Verification Link');
        let email = data.email;//'rupesh.s@aditatechnologies.com';
        let name = req.body.first_name+' '+req.body.last_name;
        let link = `${config.dasboardUrl}/#/set-pwd?token=${token}`;
        let subject = result['temp_subject'].replace('{ROLE}',role);
        let body = result['temp_body'].replace('{NAME}',name).replace('{LINK}',link);
        mail.send(email,subject,body);
        return returnStatus(res, {}, 200, 'success')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const getById = async (req, res)=>{
    try {
        let rules = {
            id: 'required'
        }

        await validate(req.params, rules,[]);
        let id = req.params.id;
        let query = `select * from public.admin_tbl where id = ${id} and is_delete = false`;
        let result =  await pool.executeQueryWithMsg(query,[],'No records available.')
        return returnStatus(res, result[0], 200, 'success')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const getAll = async (req, res)=>{
    try {
        let rules = {
            limit: 'required',
            offset: 'required',
        }

        await validate(req.body, rules,[]);
        let limit = req.body.limit;
        let offset = req.body.offset;
        let key = req.body.key!=undefined && req.body.key!=''?`and (lower(first_name) like lower('%${req.body.key}%') or lower(last_name) like lower('%${req.body.key}%') or lower(email) like lower('%${req.body.key}%')) `:"";
        let query = `select * from public.admin_tbl where is_delete = false ${key} order by creation_dt desc limit ${limit} offset ${offset}`;
        let result =  await pool.executeQueryWithMsg(query,[],'No records available.')
        query = `select count(id) as cnt from public.admin_tbl where is_delete = false ${key}`;
        let resultCount =  await pool.executeQuery(query,[])
        let data = {
            totalCount : parseInt(resultCount.rows[0]['cnt']),
            result : result
        }
        return returnStatus(res, data, 200, 'success')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const updateById = async (req, res)=>{
    try {
        let rules = {
            id: 'required',
            email: 'required|email',
            first_name: 'required',
            last_name: 'required'
        }

        await validate(req.body, rules,[]);
        let data = req.body;
        let query = `UPDATE public.admin_tbl
        SET email='${data.email}', first_name='${data.first_name}', last_name='${data.last_name}', phone='${data.phone || ""}'
        WHERE id = ${data.id}`

        let result = await pool.executeQuery(query, [])
        return returnStatus(res, {}, 200, 'success')
    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const deleteById = async (req, res)=>{
    try {
        let rules = {
            id: 'required'
        }

        await validate(req.params, rules,[]);
        let id = req.params.id
        let query = `update public.admin_tbl set is_delete = true where id = ${id}`;
        let countResult = await pool.executeQuery(query, []);
        return returnStatus(res, {}, 200, 'success')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

module.exports = {
    login,
    setForgotPassword,
    setChangePassword,
    sendForgotPasswordLink,
    checkVerificationLink,
    create,
    getById,
    getAll,
    updateById,
    deleteById
}