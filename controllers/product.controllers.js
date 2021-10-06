const { returnStatus,sysErrorLog } = require('../helpers/utils');
const pool = require('../models/pgconnection');
const {validate} = require('../helpers/validation');
const config = require('config');


const create = async (req, res)=>{
    try {
        let rules = {  
            cat_id:'required',
            domain:'required',
            prod_name:'required',
            prod_feature:'required',
            prod_tech_spec:'required',
            prod_image1:'required',
            prod_price:'required',
            prod_tax:'required',
            country_origin:'required'   
           
        }

        await validate(req.body, rules,[]);
        let cat_id = req.body.cat_id;
        let domain = req.body.domain;
        let prod_name = req.body.prod_name;
        let prod_desc = req.body.prod_desc;
        let prod_feature = req.body.prod_feature;
        let prod_tech_spec = req.body.prod_tech_spec;
        let prod_image1 = req.body.prod_image1;
        let prod_image2 = req.body.prod_image2; 
        let prod_image3 = req.body.prod_image3;
        let prod_image4 = req.body.prod_image4;
        let prod_price = req.body.prod_price;
        let prod_tax = req.body.prod_tax;
        let country_origin = req.body.country_origin

        
        let query = `INSERT INTO public.product_tbl(cat_id, domain, prod_name, prod_desc, prod_feature, prod_tech_spec, prod_image1, prod_image2, prod_image3, prod_image4, prod_price, prod_tax, country_origin, creation_dt, updated_dt) 
        VALUES (${cat_id},'${domain}','${prod_name}','${prod_desc}','${prod_feature}','${prod_tech_spec}','${prod_image1}','${prod_image2}','${prod_image3}','${prod_image4}',${prod_price},${prod_tax},'${country_origin}',now(),now())`;
        
        let result =  await pool.executeQuery(query,[])
        return returnStatus(res, {}, 200, 'successfully created')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error) 
            // sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}


const getAll = async (req, res)=>{
    try {
        let rules = {
            limit: 'required',
            offset: 'required'
        }
        await validate(req.body, rules,[]);
        let limit = req.body.limit;
        let offset = req.body.offset;
        let query = `select * from public.product_tbl  order by creation_dt desc limit ${limit} offset ${offset}`;
        let result =  await pool.executeQueryWithMsg(query,[],'No records available.')
        query = `select count(prod_id) as cnt from public.product_tbl where is_delete = false`;
        let resultCount =  await pool.executeQuery(query,[])

        let data = {
            totalCount : parseInt(resultCount.rows[0]['cnt']),
            result : result
        }
        return returnStatus(res, data, 200, 'success')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            // sysErrorLog(error,__filename.slice(__dirname.length + 1))
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
        let prod_id = req.params.id;
        let query = `select * from public.product_tbl where prod_id = ${prod_id}`;
        let result =  await pool.executeQueryWithMsg(query,[],'No records available.')
        let data = result[0];
        return returnStatus(res, data, 200, 'success')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            // sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}

const updateById = async (req, res)=>{
    try {
        let rules = {
            id: 'required'

        }

        await validate(req.params, rules,[]);
        let prod_id = req.params.id;
        let cat_id = req.body.cat_id;
        let domain = req.body.domain;
        let prod_name = req.body.prod_name;
        let prod_desc = req.body.prod_desc;
        let prod_feature = req.body.prod_feature;
        let prod_tech_spec = req.body.prod_tech_spec;
        let prod_image1 = req.body.prod_image1;
        let prod_image2 = req.body.prod_image2; 
        let prod_image3 = req.body.prod_image3;
        let prod_image4 = req.body.prod_image4;
        let prod_price = req.body.prod_price;
        let prod_tax = req.body.prod_tax;
        let country_origin = req.body.country_origin

        let query = `UPDATE public.product_tbl
        SET cat_id=${cat_id}, domain='${domain}', prod_name='${prod_name}', prod_desc='${prod_desc}', prod_feature='${prod_feature}', prod_tech_spec='${prod_tech_spec}', prod_image1='${prod_image1}', prod_image2='${prod_image2}', prod_image3='${prod_image3}', prod_image4='${prod_image4}', prod_price=${prod_price}, prod_tax=${prod_tax}, country_origin='${country_origin}'updated_dt = now()
        WHERE prod_id = ${prod_id}`;

        let result =  await pool.executeQuery(query,[])
        return returnStatus(res, {}, 200, 'successfully updated')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            // sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}
const updateStatusById = async (req, res)=>{
    try {
        let rules = {
            id: 'required'
        }

        await validate(req.params, rules,[]);
            let prod_id = req.params.id;
            let is_active = req.body.is_active;

        let query = `UPDATE public.product_tbl
        SET is_active = ${is_active}
        WHERE prod_id = ${prod_id}`;

        let result =  await pool.executeQuery(query,[])
        return returnStatus(res, {}, 200, 'successfully updated')

    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            // sysErrorLog(error,__filename.slice(__dirname.length + 1))
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
        let prod_id = req.params.id;
        let query = `DELETE
        from public.product_tbl
        where prod_id = ${prod_id}`;
        await pool.executeQuery(query,[])
        return returnStatus(res, {}, 200, 'success')
    } catch (error) {
        if (error.stack){
            console.log("error", new Date(), ":", error)
            // sysErrorLog(error,__filename.slice(__dirname.length + 1))
        }
        return returnStatus(res, error.erorrLog || {}, error.status || 500, error.message)
    }
}


module.exports = {
    create,
    getById,
    getAll,
    updateById,
    deleteById,
    updateStatusById
}