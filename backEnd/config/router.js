'use strict'

const LotteryCode = require('../app/controller/lotterycode')
const Staff       = require('../app/controller/staff')
const Prize       = require('../app/controller/prize')
const Winner      = require('../app/controller/winner')
const Lottery     = require('../app/controller/lottery')
const Log         = require('../app/controller/log')
// const DefaultTest = require('../test/default')

const SystemConf = require('./system')
const fs         = require('fs')
const Koa        = require('koa')
const Router     = require('koa-router')
const koaBody    = require('koa-body')

const app = new Koa()
app.use(koaBody())

let koaBodyRules = koaBody({
    multipart: true,
    // encoding: 'gbk',
    formidable: {
        uploadDir: SystemConf.storage.rootPath,
        keepExtensions: SystemConf.storage.keepExtensions,
        maxFieldsSize: SystemConf.storage.maxFieldsSize,
        onFileBegin: (name, file) => {
            // http://www.ptbird.cn/koa-body-diy-upload-dir-and-filename.html
            // console.log(file)
            // 若文件夹未存在，则创建
            if (!fs.existsSync(SystemConf.storage.rootPath)) fs.mkdirSync(SystemConf.storage.rootPath)

            // 上传文件名即为保存文件名
            file.path = `${SystemConf.storage.rootPath}/${file.name}`
        },
        onError: (error) => {
            console.error(error)
        }
    }
})

module.exports = function(){
    // 实例化路由中间件，传入全局配置
    // let router = new Router({
    //     prefix: '/'
    // })

    let router = new Router()

    // 首页资源托管
    router.get('/', async (ctx) => {
        ctx.type = 'html'
        ctx.body = fs.createReadStream(`./dist/index.html`)
    })

    // 静态资源托管
    router.get('/static/*', async (ctx) => {
        let filePath = ctx.request.url.replace(/\/(2018annualparty\/)?static/, './dist/static/'),
            stats = fs.statSync(filePath)
        console.log(filePath)
        ctx.set('Content-Length', stats.size)
        if (!ctx.response.get('Last-Modified')) {
            ctx.set('Last-Modified', stats.mtime.toUTCString())
        }
        if (!ctx.response.get('Cache-Control')) {
            ctx.set('Cache-Control', 'max-age=' + (1 * 24 * 60 * 60 | 0))
        }
        ctx.type = filePath.split('.').pop()
        ctx.body = fs.createReadStream(filePath)
    })

    // 嘉宾抽奖码
    router.post('/api/lottery_code/add',        koaBodyRules, LotteryCode.add)
    router.post('/api/lottery_code/del',        koaBodyRules, LotteryCode.del)
    router.post('/api/lottery_code/edit',       koaBodyRules, LotteryCode.edit)
    router.get('/api/lottery_code/get',         LotteryCode.get)
    router.get('/api/lottery_code/export_csv',  LotteryCode.exportCSV)
    router.post('/api/lottery_code/import_csv', koaBodyRules, LotteryCode.importCSV)

    // 公司员工
    router.post('/api/staff/add',        koaBodyRules, Staff.add)
    router.post('/api/staff/del',        koaBodyRules, Staff.del)
    router.post('/api/staff/edit',       koaBodyRules, Staff.edit)
    router.get('/api/staff/get',         Staff.get)
    router.get('/api/staff/export_csv',  Staff.exportCSV)
    router.post('/api/staff/import_csv', koaBodyRules, Staff.importCSV)

    // 奖项规则
    router.post('/api/prize/add',        koaBodyRules, Prize.add)
    router.post('/api/prize/del',        koaBodyRules, Prize.del)
    router.post('/api/prize/edit',       koaBodyRules, Prize.edit)
    router.get('/api/prize/get',         Prize.get)
    router.get('/api/prize/export_csv',  Prize.exportCSV)
    router.post('/api/prize/import_csv', koaBodyRules, Prize.importCSV)

    // 中奖人员 (未中奖者当做抽中无奖励奖项处理)
    // router.post('/api/winner/add',       koaBodyRules, Winner.add)
    router.post('/api/winner/del',       koaBodyRules, Winner.del)
    // router.post('/api/winner/edit',      koaBodyRules, Winner.edit)
    router.get('/api/winner/get',        Winner.get)
    router.get('/api/winner/export_csv', Winner.exportCSV)

    // 抽奖活动
    router.post('/api/lottery/validate', koaBodyRules, Lottery.validate)
    router.post('/api/lottery/join',     koaBodyRules, Lottery.join)
    

    // 系统管理
    router.get('/api/lottery/overview',  Lottery.overview)
    router.post('/api/lottery/control',  koaBodyRules, Lottery.control)
    router.get('/api/system/log',        Log.get)

    // 测试API
    // router.get('/api/test/list', DefaultTest.listTest)

    return router
}

// Nginx配置
// location ^~ /2018annualparty/ {
//     proxy_http_version  1.1;
//     proxy_set_header    Upgrade          $http_upgrade;
//     proxy_set_header    Connection       "upgrade";
//     proxy_set_header    Host             $host;
//     proxy_set_header    X-Nginx-Proxy    true;
//     proxy_set_header    X-Real-IP        $remote_addr;
//     proxy_set_header    X-Forwarded-For  $proxy_add_x_forwarded_for;
//     proxy_cache_bypass  $http_upgrade;
//     proxy_pass          http://127.0.0.1:8888/;
// }
