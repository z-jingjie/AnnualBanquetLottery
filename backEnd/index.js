'use strict'

// 引入外部库
const Router     = require('./config/router')()
const SystemConf = require('./config/system')
const Log4JSConf = require('./config/log4js')
const fs         = require('fs')
const Log4JS     = require('log4js')
const Koa        = require('koa')
const KoaLogger  = require('koa-logger')
const Serve      = require('koa-static')
const Compress   = require('koa-compress')
const Session    = require('koa-session')

// https://github.com/koajs/static
const ServeOpts = {
  maxage: 1 * 24 * 60 * 60 * 1000,
  hidden: false,     // 能否返回隐藏文件（以`.`打头），默认false不返回
  index: 'index.js', // 默认文件名
  defer: true,       // 在yield* next之后返回静态文件，默认在之前
  gzip: true,        // 允许传输gzip，优先传输*.gz文件，默认开启
}

const DistFolder = './dist'

// Log4JS配置
if (!fs.existsSync(SystemConf.log4js.rootPath)) fs.mkdirSync(SystemConf.log4js.rootPath)
Log4JS.configure(Log4JSConf)

// 实例化
const app = new Koa()
const JSLogger = Log4JS.getLogger('System')  // 传入分类字符串，指定Log4JS日志的所属类别

// Request Logger
app.use(async (ctx, next) => {
  await next()
  const rt = ctx.response.get('X-Response-Time')
  console.log(`${ctx.method} ${ctx.url} - ${rt}`)
  // JSLogger.info(`${ctx.method} ${ctx.url} - ${rt}`)
})

// X-Response-Time
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

// https://segmentfault.com/a/1190000013039187
const KoaSessonConfig = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 43200000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}
app.keys = ['zhoujj-annual_lottery']

// 引入其他中间件
app.use(KoaLogger((str, args) => {
  JSLogger.info(str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, ''))
}))
app.use(Session(KoaSessonConfig, app))
app.use(Compress())
app.use(Serve(DistFolder, ServeOpts))
app.use(Router.routes())
app.use(Router.allowedMethods())

app.listen(SystemConf.port)
console.log(`server starting at http://${SystemConf.host}:${SystemConf.port}`)

// https://docs.mongodb.com/manual/reference/method/
// MongoDB数据库安装路径：C:\Program Files\MongoDB\Server\4.0
// MongoDB数据库存储路径：C:\data\db
// mongo
// db.getMongo()
// show databases
// use annual_lottery
// show tables
// db.createCollections('candidate')
// db.candidate.insert({name: '测试用户名',phone: '13792225555',is_guest: false,is_participated: false,created_at: Math.floor(new Date().getTime() / 1000),updated_at: Math.floor(new Date().getTime() / 1000)})
// db.candidate.find({})
// db.candidate.updateOne({"created_at": 1546418291}, {$set: {"uid": 1}})


// https://www.jianshu.com/p/102825fc4180
// https://www.jianshu.com/p/c1e0ca3f9764

// monk: https://automattic.github.io/monk/docs/collection/findOne.html
// 《Koa2进阶学习笔记》：https://chenshenhai.github.io/koa2-note/note/project/sql.html