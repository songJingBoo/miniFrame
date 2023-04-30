const svgCaptcha = require('svg-captcha')
const nodemailer = require('nodemailer')

module.exports = {
    /**
     * 生成svg验证图
     * @returns 
     */
    createCaptche() {
        const captcha = svgCaptcha.create({
            size: 4,
            ignoreChars: '0o1li',
            fontSize: 50,
            width: 100,
            height: 40,
            noise: 3,
          })
        return captcha
    },
    /**
     * 发送邮件
     * @param {*} email 邮件地址
     * @param {*} subject 邮件标题
     * @param {*} text 邮件文本内容
     * @param {*} html 邮件html格式内容
     */
    async sendMail(email, subject, text, html) {
        const userEmail = 'wdssdz@163.com'
        const transporter = nodemailer.createTransport({
            service: '163',
            secureConnection: true,
            auth: {
                user: userEmail,
                pass: 'PBXGNFPMGLABAYYJ',
            },
        })

        const mailOptions = {
            from: userEmail,
            cc: userEmail, // 抄送
            to: email,
            subject,
            text,
            html
        }
        try {
            await transporter.sendMail(mailOptions)
            return true
        } catch (err) {
            console.log('email error', err)
            return false
        }
    }
}