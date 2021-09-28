const pool = require('../models/pgconnection');
const Validator = require('validatorjs');
const jwtToken = require('./jwtToken');

async function validate(data,rules,msg={}){
    return new Promise(function(resolve, reject) {
        let validation = new Validator(data, rules, msg);
        validation.checkAsync(function(){
            resolve(true)
        },function(){
            let message = "validation_error";
            let erorrLog = []
            let status = 400;
            for (const [key, value] of Object.entries(validation.errors.errors)) {
                erorrLog.push({
                    field:key,
                    message:value[0]
                })
            }
            reject({status:status,message:message,erorrLog:erorrLog})
        });
    });
}

//added custome validation to check username is exist or not
Validator.registerAsync('email_available',async function(value, attribute, req, passes) {
    let query = `select * from admin_tbl where email='${value}' and is_delete = false`;
    let result = await pool.executeQuery(query,[])
    if(result.rows.length==0){
        passes()
    }else{
        passes(false, 'Email has already been taken.'); // if username is not available
    }
});

//added admin validation to check username is exist or not
Validator.registerAsync('checkUsername',async function(value, attribute, req, passes) {
    let query = `select * from admin_tbl where username='${value}'  and is_delete = false`;
    let result = await pool.executeQuery(query,[])
    if(result.rows.length==0){
        passes()
    }else{
        passes(false, 'Username has already been taken.'); // if username is not available
    }
});

//added custome validation to check username is exist or not
Validator.registerAsync('checkLink',async function(value, attribute, req, passes) {
    let query = `select * from admin_tbl where email='${value}'`;
    let result = await pool.executeQuery(query,[])
    if(result.rows.length>0){
        passes();
    }else{
        passes(false, 'Email not register with us.'); // if username is not available
    }
    
});

//added custome validation to check conf_password and password match
Validator.registerAsync('conf_password',async function(value, attribute, req, passes) {
    console.log(attribute,value)
    if(attribute==value){
        passes()
    }else{
        passes(false, 'Password and confirm password does not match.');
    }
});

//added custome validation to check token is exist or not
Validator.registerAsync('checkToken',async function(value, attribute, req, passes) {
    let query = `select * from admin_tbl where reset_code='${value}'`;
    let result = await pool.executeQuery(query,[])
    if(result.rows.length>0){
        let jwtDataDecord = await jwtToken.verify(result.rows[0]['reset_code'])
        if(jwtDataDecord==false){
            passes(false, 'Invalid token'); 
        }else{
            if(jwtDataDecord.action=='verification' || jwtDataDecord.action=='reset'){
                passes()
            }else{
                passes(false, 'Invalid token'); 
            }
        }
        
    }else{
        passes(false, 'Invalid token'); // if username is not available
    }
});

//added custome validation to check userVerificationToken is exist or not
Validator.registerAsync('verificationToken',async function(value, attribute, req, passes) {
    let query = `select * from admin_tbl where reset_code='${value}'`;
    let result = await pool.executeQuery(query,[])
    if(result.rows.length>0){
        let jwtDataDecord = await jwtToken.verify(result.rows[0]['reset_code'])
        if(jwtDataDecord==false){
            passes(false, 'Invalid token');  
        }else{
            if(jwtDataDecord.action=='verification'){
                passes()
            }else{
                passes(false, 'Invalid token'); 
            }
            //passes();
        }
    }else{
        passes(false, 'Invalid token');
    }
});

//added custome validation to check ProductCode is exist or not
Validator.registerAsync('checkProductCode',async function(value, attribute, req, passes) {
    let query = `select id from public.myob_stockitems where stockcode='${value}'`;
    let result = await pool.executeQuery(query,[])
    if(result.rows.length>0){
        passes(false, 'Stockcode already exist.');
    }else{
        passes();
    }
    
});


exports.validate = validate
