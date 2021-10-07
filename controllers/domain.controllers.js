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
    let query = `select * from public.domain_tbl where is_delete=false order by creation_dt desc limit ${limit} offset ${offset}`;
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

    let query = `select * from public.domain_tbl where d_id = ${id} and is_delete=false`;

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

    let query = `update public.domain_tbl set is_delete = true where d_id = ${id}`;

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
    };

    await validate(req.body, rules, []);
    let name = req.body.name;
    let description = req.body.description;
    let url = req.body.url;
    let is_active = req.body.is_active;

    let query = `INSERT INTO public.domain_tbl (name,description,url,created_by,creation_dt,is_active) 
        VALUES ('${name}','${description}','${url}',${
      req.user.admin_id
    },now(),${is_active || false})`;

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
    };

    await validate(req.body, rules, []);

    let id = req.body.id;
    let name = req.body.name;
    let description = req.body.description;
    let url = req.body.url;
    let is_active = req.body.is_active;

    let query = `UPDATE public.domain_tbl
        SET name='${name}',description='${description}',url='${url}', is_active=${is_active}, updated_by=${req.user.admin_id}, updated_dt=NOW()
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
