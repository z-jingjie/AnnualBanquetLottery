'use strict'

const SystemConf = require('../../config/system')
const Log4JSConf = require('../../config/log4js')
const Log4JS     = require('log4js')

Log4JS.configure(Log4JSConf)

// 实时添加系统日志信息
var add = async (content, level = 'debug', category = undefined) => {
    // if (!content.length) {
    //     return false
    // }
    const JSLogger = Log4JS.getLogger(category)  // 传入分类字符串，指定Log4JS日志的所属类别

    switch (level) {
        case 'trace':
            JSLogger.trace(content)
            break;
        case 'info':
            JSLogger.info(content)
            break;
        case 'warn':
            JSLogger.warn(content)
            break;
        case 'error':
            JSLogger.error(content)
            break;
        case 'fatal':
            JSLogger.fatal(content)
            break;
        case 'mark':
            JSLogger.mark(content)
            break;
        case 'debug':
        default:
            JSLogger.debug(content)
            break;
    }
}

// 获取指定系统日志信息
var get = async (ctx) => {
    // var get = async (logType = 'all', logDate = undefined) => {
    let logPath = `${SystemConf.log4js.rootPath}/all.log`
    if (Object.prototype.hasOwnProperty.call(ctx.request.query, 'logType')) {
        logPath = `${SystemConf.log4js.rootPath}/${ctx.request.query.logType}.log`
    }
    if (Object.prototype.hasOwnProperty.call(ctx.request.query, 'logDate')) {
        if (ctx.request.query.logDate) {
            logPath = logPath.replace(/\.log$/i, `_${ctx.request.query.logDate}.log`)
        }
    }

    const fs = require('fs')
    let logData = fs.readFileSync(logPath)
    if (logData) {
        // let EOL = process.platform === 'win32' ? '\r\n' : '\n'
        ctx.body = {
            status: 1000,
            info: logData.toString(),
        }
    } else {
        ctx.body = {
            status: 1001,
            errMsg: logData.toString(),
        } 
    }
}

// 清空系统日志信息 (暂无必要)
var empty = async (filePath = null, timeRange = null) => {}

module.exports = {
    add,
    get,
    // empty,
}