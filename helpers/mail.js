const config = require('config');
const nodemailer = require('nodemailer');
//const mail = config.mail;
const mail = config.sandboxMail;
module.exports = {
    send: function (to, subject, mailbody) {
        return new Promise(function (resolve, reject) {
            let mailOptions = {
                from: mail.from,
                to: to,
                subject: subject,
                html: mailbody
            };
            let transporter = nodemailer.createTransport({
                host: mail.host,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: mail.user, // generated ethereal user
                    pass: mail.pass, // generated ethereal password
                },
            });
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('Error While Sending Mail - ' + error);
                    resolve(false)
                }
                else {
                    console.log("response===", error, info)
                    resolve(info)
                    /* 
                    {
                        accepted: [ 'rupesh.s@aditatechnologies.com' ],
                        rejected: [],
                        envelopeTime: 701,
                        messageTime: 821,
                        messageSize: 347,
                        response: '250 2.0.0 OK <b225fdda-3db5-4aeb-4d52-c74d71838980@sunshinesmallgoods.com.au> [Hostname=SYBP282MB2635.AUSP282.PROD.OUTLOOK.COM]',
                        envelope: {
                            from: 'sales@sunshinesmallgoods.com.au',
                            to: [ 'rupesh.s@aditatechnologies.com' ]
                        },
                        messageId: '<b225fdda-3db5-4aeb-4d52-c74d71838980@sunshinesmallgoods.com.au>'
                    }
                    */
                }
            });
        });
    },

    /* sendMail: function (emailid_to, emailid_cc, emailid_bcc, subject, mailbody, attachment) {

        var mailOptions = null;

        if (attachment == null || attachment == undefined || attachment == '') {
            mailOptions = {
                from: email_details.from,
                to: emailid_to,
                cc: emailid_cc,
                bcc: emailid_bcc,
                subject: subject,
                html: mailbody

            };
        } else {
            mailOptions = {
                from: email_details.from,
                to: emailid_to,
                cc: emailid_cc,
                bcc: emailid_bcc,
                subject: subject,
                html: mailbody,
                attachments: attachment
            };
        }

        // [{
        //     filename: attachment,
        //     contentType: 'application/pdf'
        // }]

        var transporter = nodemailer.createTransport(email_details.smtp_details);

        transporter.sendMail(mailOptions, function (error, info) {

            if (error) {
                console.log('Error While Sending Mail - ' + error);
            }
            else {
                console.log("Mail Sent - \n" +
                    "Subject: " + subject + "\n" +
                    "info: " + JSON.stringify(info) + "\n" +
                    "Email To: " + emailid_to + "\n" +
                    "Email CC: " + emailid_cc + "\n" +
                    "Email BCC: " + emailid_bcc + "\n");
            }
        });
    },
    sendAccountMail: function (emailid_to, emailid_cc, emailid_bcc, subject, mailbody, attachment) {

        var mailOptions = null;

        if (attachment == null || attachment == undefined || attachment == '') {
            mailOptions = {
                from: email_account_details.from,
                to: emailid_to,
                cc: emailid_cc,
                bcc: emailid_bcc,
                subject: subject,
                html: mailbody

            };
        } else {
            mailOptions = {
                from: email_account_details.from,
                to: emailid_to,
                cc: emailid_cc,
                bcc: emailid_bcc,
                subject: subject,
                html: mailbody,
                attachments: attachment
            };
        }

        // [{
        //     filename: attachment,
        //     contentType: 'application/pdf'
        // }]

        var transporter = nodemailer.createTransport(email_account_details.smtp_details);

        transporter.sendMail(mailOptions, function (error, info) {

            if (error) {
                console.log('Error While Sending Mail - ' + error);
            }
            else {
                console.log("Mail Sent - \n" +
                    "Subject: " + subject + "\n" +
                    "info: " + JSON.stringify(info) + "\n" +
                    "Email To: " + emailid_to + "\n" +
                    "Email CC: " + emailid_cc + "\n" +
                    "Email BCC: " + emailid_bcc + "\n");
            }
        });
    } */
}