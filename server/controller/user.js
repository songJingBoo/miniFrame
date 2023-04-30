const { createCaptche, sendMail } = require('../utils/index')
const userModel = require('../model/user')
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/index')

module.exports = {
    /**
     * 获取svg验证图
     */
    async captcha(ctx) {
        const { data, text } = createCaptche()
        ctx.response.type = 'image/svg+xml'
        ctx.session.captcha = text
        console.log('图片验证码 =>', text)
        ctx.body = data
    },
    /**
     * 发送邮箱验证码
     */
    async sendcode(ctx) {
        const { email }= ctx.query
        const code = Math.random().toString().slice(2, 6)
        const subject = 'Song登录验证码'
        const text = ''
        const html = `<h2>Song</h2><a href="https://songjingbo.com"><span>${code}</span></a>`
    
        const hasSend = await sendMail(email, subject, text, html)
        if (hasSend) {
            ctx.session.emailcode = code
            console.log('邮箱验证码 =>', code)
            ctx.success()
        } else {
            ctx.error('邮箱验证码发送失败')
        }
    },
    /**
     * 登录
     */
    async login(ctx) {
        const { email, nickname, password, captcha, emailcode  } = ctx.request.body
        if (!ctx.session.captcha) {
            ctx.error('验证码已过期')
            return
        }
        // 校验验证码是否正确
        if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
            ctx.error('验证码错误')
            return
        }
        if (!ctx.session.emailcode) {
            ctx.error('邮箱验证码已过期')
            return
        }
        // 校验验证码是否正确
        if (emailcode.toUpperCase() !== ctx.session.emailcode.toUpperCase()) {
            ctx.error('邮箱验证码错误')
            return
        }

        // 校验email是否已经注册
        const ret = await userModel.findOne({ email })
        if (ret) {
            if (ret.password === password) {
                // 生成token
                const token = jwt.sign({
                    email,
                    nickname
                }, jwtSecret, { expiresIn: '1h' })
                ctx.success({ token })
                return
            }
            ctx.error('密码错误')
            return
        }
        ctx.error('登录失败')
        return
    },
    /**
     * 注册
     */
    async register(ctx) {
        const { email, nickname, password, captcha  } = ctx.request.body
        if (!ctx.session.captcha) {
            ctx.error('验证码已过期')
            return
        }
        // 校验验证码是否正确
        if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
            ctx.error('验证码错误')
            return
        }
        // 校验email是否已经注册
        if (await userModel.findOne({ email })) {
            ctx.error('邮箱已被注册')
            return
        }
        const ret = await userModel.create({
            email,
            nickname,
            password,
            // password: md5(passwd + HashSalt),
        })
        if (ret._id) {
            ctx.success(ret._id)
        } else {
            ctx.error('注册失败')
        }
    },
    /**
     * 获取用户信息
     */
    async getInfo(ctx) {
        const { email } = ctx.state
        const user = await userModel.findOne({ email })
        ctx.success({
            userId: user._id,
            nickname: user.nickname,
            avatar: user.avatar
        })
    }
}