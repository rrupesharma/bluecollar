const { returnStatus, sysErrorLog } = require("../helpers/utils");
const pool = require("../models/pgconnection");
const { validate } = require("../helpers/validation");
const config = require("config");

const create = async (req, res) => {
  try {
    let rules = {
      cat_name: "required",
      cat_desc: "required",
      cat_image1: "required",
      cat_image2: "required",
      orderno: "required",
    };

    await validate(req.body, rules, []);
    let data = req.body;
    let query = `INSERT INTO public.category_tbl(
        cat_pid, domain, cat_name, cat_desc, cat_image1, cat_image2, orderno, created_by, creation_dt)
              VALUES (${data.cat_pid || 0}, '{${data.domain}}', '${
      data.cat_name
    }', '${data.cat_desc}', '${data.cat_image1}', '${data.cat_image2}', ${
      data.orderno
    }, ${req.user.admin_id}, now()) returning cat_id`;

    let result = await pool.executeQuery(query, []);
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

const getAll = async (req, res) => {
  try {
    let rules = {
      limit: "required",
      offset: "required",
    };

    await validate(req.body, rules, []);
    let limit = req.body.limit;
    let offset = req.body.offset;
    // let key =
    //   req.body.key != undefined && req.body.key != ""
    //     ? `and lower(sg.groupname) like lower('%${req.body.key}%') `
    //     : "";

    let query = `SELECT cat_id, cat_pid, cat_name FROM category_tbl where is_delete=false ORDER BY cat_name limit ${limit} offset ${offset}`;
    let result = await pool.executeQueryWithMsg(
      query,
      [],
      "No records available."
    );
    // console.log(result[0].cat_pid);
    let nested = subCategory(result);
    function subCategory(data, parentId = 0) {
      var out = [];
      for (var i in data) {
        if (data[i].cat_pid == parentId) {
          var children = subCategory(data, data[i].cat_id);

          if (children.length) {
            data[i].subCategory = children;
          }
          out.push(data[i]);
        }
      }
      return out;
    }

    let data = {
      result: nested,
      requestBody: req.body,
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
    let query = `select cat_id, cat_name from category_tbl where cat_pid=${id} and is_delete = false`;

    let result = await pool.executeQueryWithMsg(
      query,
      [],
      "No records available."
    );
    return returnStatus(res, result, 200, "success");
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

const updateById = async (req, res) => {
  try {
    let rules = {
      id: "required",
      cat_name: "required",
      cat_desc: "required",
      cat_image1: "required",
      cat_image2: "required",
    };

    await validate(req.body, rules, []);
    let data = req.body;
    let query = `UPDATE public.category_tbl
        SET cat_name='${data.cat_name}', cat_desc='${data.cat_desc}', cat_image1='${data.cat_image1}', cat_image2='${data.cat_image2}', updated_by=${req.user.admin_id}, updated_dt=NOW()
        WHERE cat_id = ${data.id}`;

    let result = await pool.executeQuery(query, []);
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

const deleteById = async (req, res) => {
  try {
    let rules = {
      id: "required",
    };

    await validate(req.params, rules, []);
    let id = req.params.id;
    let query = `update public.category_tbl set is_delete = true where cat_id = ${id}`;
    let countResult = await pool.executeQuery(query, []);
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

module.exports = {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
};
