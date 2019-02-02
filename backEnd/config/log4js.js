'use strict'

const SystemConf = require('./system')

// feature: file appender, with configurable log rolling based on file size or date
// Log4JS日志等级: https://github.com/log4js-node/log4js-node/blob/1d6c0a3ae81e26be67f65aaf2a561c6a89107937/lib/levels.js#L89
module.exports = {
    // Log4JS日志输出配置: https://log4js-node.github.io/log4js-node/appenders.html
    appenders: {
        // 按日期分割日志，进行持久化存储: https://log4js-node.github.io/log4js-node/dateFile.html
        all_log: {
            type: 'dateFile',
            filename: `${SystemConf.log4js.rootPath}/all.log`,
            pattern: "_yyyyMMdd",
            daysToKeep: 30,
            keepFileExt: true,
        },
        trace_log: {
            type: 'dateFile',
            filename: `${SystemConf.log4js.rootPath}/trace.log`,
            pattern: "_yyyyMM",
            daysToKeep: 30,
            keepFileExt: true,
        },
        debug_log: {
            type: 'dateFile',
            filename: `${SystemConf.log4js.rootPath}/debug.log`,
            pattern: "_yyyyMM",
            daysToKeep: 30,
            keepFileExt: true,
        },
        info_log: {
            type: 'dateFile',
            filename: `${SystemConf.log4js.rootPath}/info.log`,
            pattern: "_yyyyMM",
            daysToKeep: 30,
            keepFileExt: true,
        },
        warn_log: {
            type: 'dateFile',
            filename: `${SystemConf.log4js.rootPath}/warn.log`,
            pattern: "_yyyyMM",
            daysToKeep: 30,
            keepFileExt: true,
        },
        error_log: {
            type: 'dateFile',
            filename: `${SystemConf.log4js.rootPath}/error.log`,
            pattern: "_yyyyMM",
            daysToKeep: 30,
            keepFileExt: true,
        },
        fatal_log: {
            type: 'dateFile',
            filename: `${SystemConf.log4js.rootPath}/fatal.log`,
            pattern: "_yyyyMM",
            daysToKeep: 30,
            keepFileExt: true,
        },
        mark_log: {
            type: 'dateFile',
            filename: `${SystemConf.log4js.rootPath}/mark.log`,
            pattern: "_yyyyMM",
            daysToKeep: 30,
            keepFileExt: true,
        },

        // 日志等级过滤器: https://log4js-node.github.io/log4js-node/logLevelFilter.html
        trace_only: {
            type: 'logLevelFilter',
            appender: 'trace_log',
            level: 'trace',
            maxLevel: 'trace',
        },
        debug_only: {
            type: 'logLevelFilter',
            appender: 'debug_log',
            level: 'debug',
            maxLevel: 'debug',
        },
        info_only: {
            type: 'logLevelFilter',
            appender: 'info_log',
            level: 'info',
            maxLevel: 'info',
        },
        warn_only: {
            type: 'logLevelFilter',
            appender: 'warn_log',
            level: 'warn',
            maxLevel: 'warn',
        },
        error_only: {
            type: 'logLevelFilter',
            appender: 'error_log',
            level: 'error',
            maxLevel: 'error',
        },
        fatal_only: {
            type: 'logLevelFilter',
            appender: 'fatal_log',
            level: 'fatal',
            maxLevel: 'fatal',
        },
        mark_only: {
            type: 'logLevelFilter',
            appender: 'mark_log',
            level: 'mark',
            maxLevel: 'mark',
        },
    },
    // replaceConsole: true, // 替换 console.log
    // Log4JS日志的分类配置: https://log4js-node.github.io/log4js-node/api.html
    categories: {
        default: {
            appenders: [
                'all_log',
                'trace_only',
                'debug_only',
                'info_only',
                'warn_only',
                'error_only',
                'fatal_only',
                'mark_only',
            ],
            level: 'all',
        },
    }
}