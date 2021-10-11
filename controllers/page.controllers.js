const { returnStatus, sysErrorLog } = require("../helpers/utils");
const pool = require("../models/pgconnection");
const { validate } = require("../helpers/validation");
const config = require("config");

const create = async (req, res) => {
  try {
    let rules = {
      page_name: "required",
      page_body: "required",
      domain: "required",
    };

    await validate(req.body, rules, []);
    let page_name = req.body.page_name;
    let page_body = req.body.page_body;
    let domain = req.body.domain;

    let query = `INSERT INTO public.page_tbl (page_name,page_body,domain,created_by,creation_dt) 
          VALUES ('${page_name}','${page_body}','{${domain}}',${req.user.admin_id},now())`;

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

const getAll = async (req, res) => {
  try {
    let rules = {
      limit: "required",
      offset: "required",
    };
    await validate(req.body, rules, []);
    let limit = req.body.limit;
    let offset = req.body.offset;
    let query = `select * from public.page_tbl where is_delete=false order by creation_dt desc limit ${limit} offset ${offset}`;
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

    let query = `select * from public.page_tbl where page_id = ${id} and is_delete=false`;

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

    let query = `update public.page_tbl set is_delete = true where page_id = ${id}`;

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

const update = async (req, res) => {
  try {
    let rules = {
      id: "required",
      page_name: "required",
      page_body: "required",
      domain: "required",
    };

    await validate(req.body, rules, []);

    let id = req.body.id;
    let page_name = req.body.page_name;
    let page_body = req.body.page_body;
    let domain = req.body.domain;
    let is_active = req.body.is_active;

    let query = `UPDATE public.page_tbl
          SET page_name='${page_name}',page_body='${page_body}',domain='{${domain}}', is_active=${is_active}, updated_by=${req.user.admin_id}, updated_dt=NOW()
          WHERE page_id = ${id}`;

    let result = await pool.executeQuery(query, []);
    return returnStatus(res, {}, 200, "successfully Updated");
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
