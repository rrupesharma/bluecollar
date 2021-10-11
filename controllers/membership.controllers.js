const { returnStatus,sysErrorLog } = require('../helpers/utils');
const pool = require('../models/pgconnection');
const {validate} = require('../helpers/validation');
const config = require('config');


const create = async (req, res)=>{
    try {
        let rules = {  
            domain:'required',
            title: 'required',
            image1: 'required',
            price: 'required',
            orderno: 'required'
        }

        await validate(req.body, rules,[]);
        let domain = req.body.domain;
        let title = req.body.title;
        let description = req.body.description;
        let image1 = req.body.image1;
        let price = req.body.price;
        let orderno = req.body.orderno;
      

        
        let query = `INSERT INTO public.membership_tbl(domain, title, description, image1, price, orderno, creation_dt, updated_dt) 
        VALUES ('{${domain}}','${title}','${description}','${image1}',${price},${orderno},now(),now())`;
        
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
        let query = `select * from public.membership_tbl  order by creation_dt desc limit ${limit} offset ${offset}`;
       
        let result =  await pool.executeQueryWithMsg(query,[],'No records available.')
        query = `select count(meb_id) as cnt from public.membership_tbl where is_delete = false`;
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
        let meb_id = req.params.id;
        let query = `select * from public.membership_tbl where meb_id = ${meb_id}`;
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
        let meb_id = req.params.id;
        let domain = req.body.domain;
        let title = req.body.title;
        let description = req.body.description;
        let image1 = req.body.image1;
        let price = req.body.price;
        let orderno = req.body.orderno;

        let query = `UPDATE public.membership_tbl
        SET domain='{${domain}}', title ='${title}',description ='${description}',image1 ='${image1}',price =${price},orderno =${orderno},updated_dt = now()
        WHERE meb_id = ${meb_id}`;

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
            let meb_id = req.params.id;
            let is_active = req.body.is_active;

        let query = `UPDATE public.membership_tbl
        SET is_active = ${is_active}
        WHERE meb_id = ${meb_id}`;

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
        let meb_id = req.params.id;
        let query = `DELETE
        from public.membership_tbl
        where meb_id = ${meb_id}`;
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