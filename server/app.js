const Koa = require('koa')
const path = require('path')
const session = require('koa-session')
const route = require('koa-route')
const websockify = require('koa-websocket')
const router = require('./router/index')
const { koaBody } = require('koa-body')
const responseMiddle = require('./middleware/response')
// mongosse数据库配置
require('./config/db')
const app = websockify(new Koa())

// koa2自身无法接收form-data等其他body体
app.use(koaBody({ multipart: true }))

// websocket
const cilents = new Map()
app.ws.use(route.all('/chat/:id', (ctx) => {
    const userId = ctx.url.replace('/chat/', '')
    if (cilents.has(userId)) return

    // 加入群
    cilents.set(userId, ctx.websocket)
    console.log(`用户${userId}接入====>`)
    // 接收
    ctx.websocket.on('message', (msg) => {
        console.log('收到消息')
        for (let [id, socket] of cilents) {
            if (id !== userId) {
                socket.send(msg.toString())
            }
        }
    })
    // 广播
    ctx.websocket.on('close', () => {
        cilents.delete(userId)
        console.log(`用户${userId}断开!!!!!`)
    })
}))

// session
app.keys = ['zsxdc153']
app.use(session({
    key: 'koa:song',
    maxAge: 60000, // ms
}, app))

// ctx.success/ctx.error
app.use(responseMiddle)
app.use(router.routes())

app.listen(3000)






// const { routerPrefix } = require('./config/index')
// const { historyApiFallback } = require('koa2-connect-history-api-fallback')
// const static = require('koa-static')
// app.use(historyApiFallback({ whiteList: [routerPrefix] })) // 单页面应用刷新页面后404问题（一定要在静态服务前边）
// app.use(static(path.join(__dirname, 'public')))