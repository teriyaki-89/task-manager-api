//console.log(process.env.SENDGRID_API_KEY);

const sgMail = require("@sendgrid/mail");
//require("./sendgrid.env");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    //console.log(email, name);
    const msg = {
        to: email,
        from: "test@example.com",
        subject: "Sending with Twilio SendGrid is Fun",
        text: `Welcome to se ya here, ${name} even with Node.js`,
    };
    sgMail.send(msg);
};

module.exports = {
    sendWelcomeEmail,
};
