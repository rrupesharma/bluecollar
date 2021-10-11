const { returnStatus,sysErrorLog } = require('../helpers/utils');
const pool = require('../models/pgconnection');
const {validate} = require('../helpers/validation');
const config = require('config');


const create = async (req, res)=>{
    try {
        let rules = {  
            meb_id:'required',
            domain:'required',
            title: 'required',
            orderno: 'required',
            starttime:'required',
            endtime:'required'
        }

        await validate(req.body, rules,[]);
        let meb_id = req.body.meb_id;
        let domain = req.body.domain;
        let title = req.body.title;
        let description = req.body.description;
        let orderno = req.body.orderno;
        let starttime = req.body.starttime;
        let endtime = req.body.endtime;
       
      

        
        let query = `INSERT INTO public.membership_reward_rule(meb_id, domain, title, description, orderno, starttime, endtime, creation_dt, updated_dt) 
        VALUES (${meb_id},'{${domain}}','${title}','${description}',${orderno},'${starttime}','${endtime}',now(),now())`;
        
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
        let query = `select * from public.membership_reward_rule  order by creation_dt desc limit ${limit} offset ${offset}`;
       
        let result =  await pool.executeQueryWithMsg(query,[],'No records available.')
        query = `select count(rp_id) as cnt from public.membership_reward_rule where is_delete = false`;
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
        let rp_id = req.params.id;
        let query = `select * from public.membership_reward_rule where rp_id = ${rp_id}`;
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
        let rp_id = req.params.id;
        let meb_id = req.body.meb_id;
        let domain = req.body.domain;
        let title = req.body.title;
        let description = req.body.description;
        let orderno = req.body.orderno;
        let starttime = req.body.starttime;
        let endtime = req.body.endtime;

        let query = `UPDATE public.membership_reward_rule
        SET meb_id = ${meb_id}, domain='{${domain}}',title ='${title}',description ='${description}',orderno ='${orderno}',starttime = '${starttime}',endtime = '${endtime}',updated_dt = now()
        WHERE rp_id = ${rp_id}`;

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
            let rp_id = req.params.id;
            let is_active = req.body.is_active;

        let query = `UPDATE public.membership_reward_rule
        SET is_active = ${is_active}
        WHERE rp_id = ${rp_id}`;

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
        let rp_id = req.params.id;
        let query = `DELETE
        from public.membership_reward_rule
        where rp_id = ${rp_id}`;
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