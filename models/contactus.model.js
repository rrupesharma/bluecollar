const mail = require("../helpers/mail");

async function contactUsEmail(data) {
  return new Promise(async function (resolve, reject) {
    try {
      if (data) {
        let to = data;
        let subject = "Contact Us";
        let body = "Thanks you for contact us";
        console.log(data);
        mail.send(to, subject, body);
        resolve(true);
      } else {
        reject(false);
      }
    } catch (error) {
      console.log(error);
    }
  });
}

exports.contactUsEmail = contactUsEmail;
