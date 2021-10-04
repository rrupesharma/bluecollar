const { returnStatus, sysErrorLog } = require("../helpers/utils");
const pool = require("../models/pgconnection");
const { validate } = require("../helpers/validation");
const config = require("config");

const getAll = async (req, res) => {
  try {
    let rules = {
      limit: "required",
      offset: "required",
    };
    await validate(req.body, rules, []);
    let limit = req.body.limit;
    let offset = req.body.offset;
    let query = `select * from public.domain_tbl order by creation_dt desc limit ${limit} offset ${offset}`;
    let result = await pool.executeQueryWithMsg(
      query,
      [],
      "No records available."
    );
    let data = {
      totalCount: parseInt(result.length),
      result: result,
    };
    return returnStatus(res, data, 200, "success");
  } catch (error) {
    if (error.stack) {
      console.log("error", new Date(), ":", error);
      sysErrorLog(error, __filename.slice(__dirname.length + 1));
    }
    return returnStatus(
      res,
      error.erorrLog || {},
      error.status || 500,
      error.message
    );
  }
};

const getById = async (req, res) => {
  try {
    let rules = {
      id: "required",
    };

    await validate(req.params, rules, []);
    let id = req.params.id;

    let query = `select * from public.domain_tbl where d_id = ${id}`;

    let result = await pool.executeQueryWithMsg(
      query,
      [],
      "No records available."
    );
    let data = result[0];
    return returnStatus(res, data, 200, "success");
  } catch (error) {
    if (error.stack) {
      console.log("error", new Date(), ":", error);
      sysErrorLog(error, __filename.slice(__dirname.length + 1));
    }
    return returnStatus(
      res,
      error.erorrLog || {},
      error.status || 500,
      error.message
    );
  }
};

const del = async (req, res) => {
  try {
    let rules = {
      id: "required",
    };

    await validate(req.params, rules, []);
    let id = req.params.id;

    let query = `DELETE from public.domain_tbl where d_id = ${id}`;

    await pool.executeQuery(query, []);
    return returnStatus(res, {}, 200, "success");
  } catch (error) {
    if (error.stack) {
      console.log("error", new Date(), ":", error);
      sysErrorLog(error, __filename.slice(__dirname.length + 1));
    }
    return returnStatus(
      res,
      error.erorrLog || {},
      error.status || 500,
      error.message
    );
  }
};

const create = async (req, res) => {
  try {
    let rules = {
      name: "required",
      description: "required",
      url: "required",
      created_by: "required",
      updated_by: "required",
    };

    await validate(req.body, rules, []);
    let name = req.body.name;
    let description = req.body.description;
    let url = req.body.url;
    let created_by = req.body.created_by;
    // let creation_dt = req.body.creation_dt;
    let updated_by = req.body.updated_by;
    let is_active = req.body.is_active;
    let is_delete = req.body.is_delete;

    let query = `INSERT INTO public.domain_tbl (name,description,url,created_by,creation_dt,updated_by,is_active,is_delete) 
        VALUES ('${name}','${description}','${url}',${created_by},now(),${updated_by},${is_active},${is_delete})`;

    let result = await pool.executeQuery(query, []);
    return returnStatus(res, {}, 200, "successfully Created");
  } catch (error) {
    if (error.stack) {
      console.log("error", new Date(), ":", error);
      sysErrorLog(error, __filename.slice(__dirname.length + 1));
    }
    return returnStatus(
      res,
      error.erorrLog || {},
      error.status || 500,
      error.message
    );
  }
};

const update = async (req, res) => {
  try {
    let rules = {
      id: "required",
      name: "required",
      description: "required",
      url: "required",
      created_by: "required",
      updated_by: "required",
    };

    await validate(req.body, rules, []);

    let id = req.body.id;
    let name = req.body.name;
    let description = req.body.description;
    let url = req.body.url;
    let created_by = req.body.created_by;
    let updated_by = req.body.updated_by;
    let is_active = req.body.is_active;
    let is_delete = req.body.is_delete;

    let query = `UPDATE public.domain_tbl
        SET name='${name}',description='${description}',url='${url}',created_by=${created_by}, updated_by=${updated_by}, is_active=${is_active}, is_delete=${is_delete}, updated_dt=NOW()
        WHERE d_id = ${id}`;

    let result = await pool.executeQuery(query, []);
    return returnStatus(res, {}, 200, "successfully updated");
  } catch (error) {
    if (error.stack) {
      console.log("error", new Date(), ":", error);
      sysErrorLog(error, __filename.slice(__dirname.length + 1));
    }
    return returnStatus(
      res,
      error.erorrLog || {},
      error.status || 500,
      error.message
    );
  }
};
module.exports = {
  create,
  getAll,
  getById,
  del,
  update,
};
