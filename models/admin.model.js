const config = require('config');
const pool = require('./pgconnection');
const { validate } = require('../helpers/validation');
const { generateLogin } = require('../middleware/auth');
const md5 = require('md5');

/**
 * Validate user login
 * @param {*} info 
 * @returns 
 */
async function validateUserLogin(info) {
  return new Promise(async function (resolve, reject) {
    try {
      const rules = {
        email: 'required|email',
        password: 'required'
      }
      const message = {
        "required.email": "Please enter a valid email.",
        "required.password": "Please enter a password."
      }
      await validate(info, rules, message);
      resolve(true);
    } catch (error) {
      reject(error)
    }
  })
}

function validateUserReg(info) {
  return new Promise(async function (resolve, reject) {
    try {
      const rules = {
        first_name: 'required',
        last_name: 'required',
        email: 'required|email',
        phone: 'required',
        company: 'required',
        abn: 'required',
        acc_type: 'required',
        biz_address: 'required',
        delivery_address: 'required'
      }
      const message = {
        "required.first_name": "Please enter a valid first name.",
        "required.last_name": "Please enter a valid last name.",
        "required.email": "The Email ID field must contain a valid email address.",
        "required.phone": "Please enter a valid phone number.",
        "required.company": "Please enter a valid company name.",
        "required.abn": "Please enter a valid ABN.",
        "required.acc_type": "Please enter a valid acc type.",
        "required.biz_address": "Please enter a valid business address.",
        "required.delivery_address": "Please enter a valid delivery address."
      }
      await validate(info, rules, message);
      resolve(true);
    } catch (error) {
      reject(error)
    }
  })
}

function validateConfEmail(info) {
  return new Promise(async function (resolve, reject) {
    try {
      const rules = {
        code: 'required',
        password: 'required',
        conf_password: 'required|conf_password:' + info.password
      }
      await validate(info, rules, {});
      resolve(true);
    } catch (error) {
      reject(error)
    }
  })
}

function validateForgotPass(info) {
  return new Promise(async function (resolve, reject) {
    try {
      const rules = {
        email: 'required|email'
      }
      const message = {
        "required.email": "The Email ID field must contain a valid email address."
      }
      await validate(info, rules, message);
      resolve(true);
    } catch (error) {
      reject(error)
    }
  })
}

function validateResetPass(info) {
  return new Promise(async function (resolve, reject) {
    try {
      const rules = {
        code: 'required',
        newpassword: 'required',
        confpassword: 'required|conf_password:' + info.newpassword
      }
      const message = {
        "required.email": "The Email ID field must contain a valid email address.",
        "required.newpassword": "Please enter a valid password.",
        "required.confpassword": "Please enter a valid password."
      }
      await validate(info, rules, message);
      resolve(true);
    } catch (error) {
      reject(error)
    }
  })
}

function validateChangePassword(info) {
  return new Promise(async function (resolve, reject) {
    try {
      const rules = {
        newpassword: 'required',
        confpassword: 'required|conf_password:' + info.newpassword
      }
      const message = {
        "required.newpassword": "Please enter a valid password.",
        "required.confpassword": "Please enter a valid password."
      }
      await validate(info, rules, message);
      resolve(true);
    } catch (error) {
      reject(error)
    }
  })
}

function validateEditProfile(info) {
  return new Promise(async function (resolve, reject) {
    try {
      const rules = {
        first_name: 'required',
        last_name: 'required',
        email: 'required|email',
        phone: 'required',
        company: 'required',
        abn: 'required',
        acc_type: 'required',
        biz_address: 'required',
        delivery_address: 'required'
      }
      const message = {
        "required.first_name": "Please enter a valid first name.",
        "required.last_name": "Please enter a valid last name.",
        "required.email": "The Email ID field must contain a valid email address.",
        "required.phone": "Please enter a valid phone number.",
        "required.company": "Please enter a valid company name.",
        "required.abn": "Please enter a valid ABN.",
        "required.acc_type": "Please enter a valid acc type.",
        "required.biz_address": "Please enter a valid business address.",
        "required.delivery_address": "Please enter a valid delivery address."
      }
      await validate(info, rules, message);
      resolve(true);
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Process login request
 * @param {*} email 
 * @param {*} password 
 * @returns 
 */
async function getLoginUser(email, password) {
  return new Promise(async function (resolve, reject) {
    try {
      let query = `select u.user_id,u.user_email,u.first_name,u.last_name,u.company_name,u.phone,u.user_abn,u.business_type_id,u.account_type_id,bt.business_type_name,at.account_type_name
      FROM public.users u 
      INNER JOIN public.business_type bt ON u.business_type_id = bt.business_type_id
      INNER JOIN public.account_type at ON u.account_type_id = at.account_type_id
      where user_email='${email}' and user_password='${md5(password)}'`;
      let result = await pool.executeQueryWithMsg(query, [], 'Invalid email or password.')
      result[0].token = await generateLogin(result[0]);
      resolve({
        status_code: 200,
        status_message: "success",
        data: result[0] || {}
      })
    } catch (error) {
      reject(error);
    }
  })
}

async function getRegUser(params) {
  return new Promise(async function (resolve, reject) {
    try {
      let query = `select * from public.users where user_email='${params.email}'`;
      let result = await pool.executeQuery(query, [])
      if (result.rows.length > 0) {
        reject({
          status: 404,
          message: 'Email has already been taken.',
          data: {}
        })
      } else {

        let insertUser = `INSERT INTO public.users(
          user_email, first_name, last_name, user_password, reset_code, company_name, phone, user_abn, business_type_id, account_type_id,creation_dt, last_update_dt)
          VALUES ('${params.email}', '${params.first_name}', '${params.last_name}', '', '${utils.encrypt(params.email + new Date)}', '${params.company}', '${params.phone}','${params.abn}', ${params.bussness_type || 1},${params.acc_type != 0 ? params.acc_type : 1}, now(), now()) returning user_id;`;
        let userResult = await pool.executeQuery(insertUser, [])
        let user_id = userResult.rows[0]['user_id'];
        //console.log("userResult.rows====",userResult.rows)
        //console.log("delivery_address====",params.delivery_address)
        //console.log("biz_address====",params.biz_address)

        for (let [count, data] of params.delivery_address.entries()) {
          let insertAddress = `INSERT INTO public.address_tbl(
            user_id, address_email, address_details, zip_code, phone, creation_dt, last_update_dt, address_type, is_default)
            VALUES (${user_id},'', '${data.address_details}', '${data.zip_code}', '', now(), now(), 'delivery', ${data.is_default}) returning address_id;`

          let addressResut = await pool.executeQuery(insertAddress, []);
          let address_id = addressResut.rows[0]['address_id'];
          //console.log("delivery_addressaddressResut===",addressResut.rows)

          /* let insertUserAddress = `INSERT INTO public.users_address_tbl(
            address_id, user_id, creation_dt)
            VALUES (${address_id}, ${user_id}, now());`;

          await pool.executeQuery(insertUserAddress,[]); */
        }

        for (let [count, data] of params.biz_address.entries()) {
          let insertAddress = `INSERT INTO public.address_tbl(
            user_id,address_email, address_details, zip_code, phone, creation_dt, last_update_dt, address_type, is_default)
            VALUES (${user_id},'', '${data.address_details}', '${data.zip_code}', '', now(), now(), 'billing', ${data.is_default}) returning address_id;`

          let addressResut = await pool.executeQuery(insertAddress, []);
          let address_id = addressResut.rows[0]['address_id'];
          //console.log("biz_addressaddressResut===",addressResut.rows)

          /* let insertUserAddress = `INSERT INTO public.users_address_tbl(
            address_id, user_id, creation_dt)
            VALUES (${address_id}, ${user_id}, now());`;

          await pool.executeQuery(insertUserAddress,[]); */
        }

        resolve({
          status_code: 200,
          status_message: "successfully inserted",
          data: {}
        })
      }
    } catch (error) {
      reject(error);
    }
  })
}

async function getUserConf(params) {
  return new Promise(async function (resolve, reject) {
    try {
      let query = `select * from public.users where reset_code='${params.code}'`;
      await pool.executeQueryWithMsg(query, [], 'Invalid code')
      query = `UPDATE public.users SET user_password = '${md5(params.password)}', reset_code ='' where reset_code = '${params.code}'`;
      let result = await pool.executeQuery(query, [])
      resolve({
        status_code: 200,
        status_message: "Your password has been confirmed and activated successfully! Thank you.",
        data: {}
      })
    } catch (error) {
      reject(error);
    }
  })
}

async function getUserPass(params) {
  return new Promise(async function (resolve, reject) {
    try {
      await pool.executeQueryWithMsg(`select * from public.users where user_email = '${params.email}'`, [], `There's no Account with the info you provided.`)
      let query = `UPDATE public.users SET reset_code = '${utils.encrypt(params.email + new Date)}' where user_email = '${params.email}'`;
      let result = await pool.executeQuery(query, [])
      resolve({
        status_code: 200,
        status_message: "We have sent you an email with a link to reset your password.",
        data: {}
      })
    } catch (error) {
      reject(error);
    }
  })
}

async function getPassReset(params) {
  return new Promise(async function (resolve, reject) {
    try {
      let query = `select * from public.users where reset_code='${params.code}'`;
      await pool.executeQueryWithMsg(query, [], 'Invalid code')
      query = `UPDATE public.users SET user_password = '${md5(params.password)}',reset_code ='' where reset_code = '${params.code}'`;
      let result = await pool.executeQuery(query, [])
      resolve({
        status_code: 200,
        status_message: "Your password has been changed successfully! Thank you.",
        data: {}
      })
    } catch (error) {
      reject(error);
    }
  })
}

async function getChangePassword(req, params) {
  return new Promise(async function (resolve, reject) {
    try {
      let query = `select * from public.users where user_id='${req.user.user_id}'`;
      await pool.executeQueryWithMsg(query, [], 'Invalid user_id')
      query = `UPDATE public.users SET user_password = '${md5(params.password)}' where user_id='${req.user.user_id}'`;
      let result = await pool.executeQuery(query, [])
      resolve({
        status_code: 200,
        status_message: "Your password has been changed successfully! Thank you.",
        data: {}
      })
    } catch (error) {
      reject(error);
    }
  })
}

async function getViewProfile(params) {
  return new Promise(async function (resolve, reject) {
    try {

      let query = `select u.*,bt.business_type_name,at.account_type_name from public.users u 
      inner join business_type bt on bt.business_type_id = u.business_type_id 
      inner join account_type at on at.account_type_id = u.account_type_id 
      where user_id='${params.userid}'`;
      let result = await pool.executeQueryWithMsg(query, [], 'No records available.')

      delete result[0].reset_code
      delete result[0].user_password
      let data = result[0];

      query = `select at.* from address_tbl at
      where at.user_id = ${data.user_id}`;

      let resultAddres = await pool.executeQuery(query, [])
      data.address = {}
      if (resultAddres.rows.length > 0) {
        data.address = resultAddres.rows
      }

      resolve({
        status_code: 200,
        status_message: "success",
        data: data
      })
    } catch (error) {
      reject(error);
    }
  })
}

async function getEditProfile(req, params) {
  return new Promise(async function (resolve, reject) {
    try {
      params.user_id = req.user.user_id;
      let insertUser = `UPDATE public.users SET
        user_email='${params.email}', first_name='${params.first_name}', last_name='${params.last_name}', company_name='${params.company}', phone='${params.phone}', user_abn='${params.abn}', 
        business_type_id=${params.bussness_type || 1}, account_type_id=${params.acc_type != 0 ? params.acc_type : 1}, last_update_dt=now() where user_id=${params.user_id}`;

      let userResult = await pool.executeQuery(insertUser, [])
      //let user_id = userResult.rows[0]['user_id'];
      //console.log("userResult.rows====",userResult.rowCount)
      if (userResult.rowCount == 1) {
        //console.log("delivery_address====",params.delivery_address)
        //console.log("biz_address====",params.biz_address)

        for (let [count, data] of params.delivery_address.entries()) {
          if (data.address_id != undefined && data.address_id != null && data.address_id != 0) {
            let updateAddress = `UPDATE public.address_tbl SET address_email='',address_details='${data.address_details}',zip_code='${data.zip_code}',phone='',last_update_dt=now(),is_default=${data.is_default} where address_id=${data.address_id}`;
            await pool.executeQuery(updateAddress, []);
          } else {
            let insertAddress = `INSERT INTO public.address_tbl(
              user_id,address_email, address_details, zip_code, phone, creation_dt, last_update_dt, address_type, is_default)
              VALUES (${user_id},'', '${data.address_details}', '${data.zip_code}', '', now(), now(), 'delivery', ${data.is_default}) returning address_id;`

            let addressResut = await pool.executeQuery(insertAddress, []);
            let address_id = addressResut.rows[0]['address_id'];
            //console.log("delivery_addressaddressResut===",addressResut.rows)

            /* let insertUserAddress = `INSERT INTO public.users_address_tbl(
              address_id, user_id, creation_dt)
              VALUES (${address_id}, ${user_id}, now());`;
  
            await pool.executeQuery(insertUserAddress,[]); */
          }

        }

        for (let [count, data] of params.biz_address.entries()) {
          if (data.address_id != undefined && data.address_id != null && data.address_id != 0) {
            let updateAddress = `UPDATE public.address_tbl SET address_email='',address_details='${data.address_details}',zip_code='${data.zip_code}',phone='',last_update_dt=now(),is_default=${data.is_default} where address_id=${data.address_id}`;
            await pool.executeQuery(updateAddress, []);
          } else {
            let insertAddress = `INSERT INTO public.address_tbl(
              user_id,address_email, address_details, zip_code, phone, creation_dt, last_update_dt, address_type, is_default)
              VALUES (${user_id},'', '${data.address_details}', '${data.zip_code}', '', now(), now(), 'billing', ${data.is_default}) returning address_id;`

            let addressResut = await pool.executeQuery(insertAddress, []);
            let address_id = addressResut.rows[0]['address_id'];
            //console.log("biz_addressaddressResut===",addressResut.rows)

            /* let insertUserAddress = `INSERT INTO public.users_address_tbl(
              address_id, user_id, creation_dt)
              VALUES (${address_id}, ${user_id}, now());`;

            await pool.executeQuery(insertUserAddress,[]); */
          }
        }
        resolve({
          status_code: 200,
          status_message: "Your profile information saved",
          data: {}
        })
      } else {
        resolve({
          status_code: 404,
          status_message: 'Invalid user_id',
          data: {}
        })
      }



    } catch (error) {
      reject(error);
    }
  })
}

exports.validateUserLogin = validateUserLogin
exports.validateUserReg = validateUserReg
exports.validateConfEmail = validateConfEmail
exports.validateForgotPass = validateForgotPass
exports.validateResetPass = validateResetPass
exports.getLoginUser = getLoginUser
exports.getRegUser = getRegUser
exports.getUserConf = getUserConf
exports.getUserPass = getUserPass
exports.getPassReset = getPassReset
exports.validateChangePassword = validateChangePassword
exports.getChangePassword = getChangePassword
exports.getViewProfile = getViewProfile
exports.validateEditProfile = validateEditProfile
exports.getEditProfile = getEditProfile