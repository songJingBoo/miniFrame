module.exports = async (ctx, next) => {
    ctx.success = (data) => {
        ctx.body = {
            code: 200,
            success: true,
            data
        }
    }
    ctx.error = (message) => {
        ctx.body = {
            code: -200,
            success: false,
            message
        }
    }
    await next()
}