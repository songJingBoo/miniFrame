const { routerPrefix } = require('../config/index')
const router = require('koa-router')({ prefix: routerPrefix })
const jwtMid = require('../middleware/jwt')

const userController = require('../controller/user')

// 登录/注册页
router.get('/captcha', userController.captcha)
router.get('/sendcode', userController.sendcode)
router.post('/user/register', userController.register)
router.post('/user/login', userController.login)

// 获取用户信息
router.get('/user/info', jwtMid, userController.getInfo)

module.exports = router