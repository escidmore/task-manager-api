const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'escidmore@gmail.com',
        subject: 'Thanks for joining!',
        text: `Welcome to the app, ${name}.  Let me know how you like the app`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'escidmore@gmail.com',
        subject: 'Sorry to see you go.',
        text: `We're sorry to see that you cancelled your account, ${name}.  If there's anything we could have done to make the service better, please let us know!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}