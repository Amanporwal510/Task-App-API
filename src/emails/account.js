const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tprojectemail1234@gmail.com',
        subject: "Welcome!! Welcome!! to Task App",
        text: `Hi ${name}, We are very delighted to welcome you in our TASK APP family. Please feel free to contact us at tprojectemail1234@gmail.com`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tprojectemail1234@gmail.com',
        subject: "Sorry, to yee you go!",
        text: `Bye ${name}, Hope to see you back sometime soon`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}