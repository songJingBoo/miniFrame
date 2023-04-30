const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/index')

module.exports = async (ctx, next) => {
    const token = ctx.request.headers.authorization.replace('Bearer ', '')
    try {
        const ret = await jwt.verify(token, jwtSecret)
        ctx.state.email = ret.email
    } catch (err) {
        console.log(err)
        if (err.name === 'TokenExpiredError') {
            ctx.error('登录过期!')
        } else {
            ctx.error('登录凭证错误！')
        }
        return
    }
    await next()
}