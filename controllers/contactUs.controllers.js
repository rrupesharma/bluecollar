const { returnStatus, sysErrorLog } = require("../helpers/utils");
const pool = require("../models/pgconnection");
const jwtToken = require("../helpers/jwtToken");
const { validate } = require("../helpers/validation");
const { contactUsEmail } = require("../models/contactus.model");

const create = async (req, res) => {
  try {
    let rules = {
      email: "required",
      name: "required",
      phone: "required",
      comment: "required",
    };

    await validate(req.body, rules, []);
    let email = req.body.email;
    let name = req.body.name;
    let phone = req.body.phone;
    let comment = req.body.comment;

    let query = `INSERT INTO public.contactus_tbl (email,name,phone,comment,creation_dt) 
            VALUES ('${email}','${name}','${phone}','${comment}',now()) returning *`;
    let result = await pool.executeQuery(query, []);
    console.log(result.rows[0]);
    await contactUsEmail(result.rows[0].email);

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

module.exports = {
  create,
};
