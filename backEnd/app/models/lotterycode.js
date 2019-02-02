'use strict'

const SystemConf = require('../../config/system')
const { timeStringConvert } = require('../asset/script/helpers')
const mongoDB = require('monk')(`${SystemConf.database.host}:${SystemConf.database.port}/${SystemConf.database.dbname}`)
const LotteryCode = mongoDB.get('lottery_code')

var validateRecordInfo = (context, type = 'add') => {
    if ((type === 'add' && context.hasOwnProperty('lottery_code'))
    || (type === 'edit' && context.hasOwnProperty('lottery_code') && context.hasOwnProperty('_id'))) {
        if (!/^ZUZUIT-[A-za-z0-9]{6}$/ig.test(context.lottery_code)) {
            return {
                status: false,
                errMsg: `字段不合法：嘉宾抽奖码${context.lottery_code}不正确`
            }
        } else {
            return {status: true}
        }
    } else {
        return {
            status: false,
            errMsg: `字段不合法：缺少lottery_code或_id字段信息`
        }
    }
}

// 增加嘉宾抽奖码信息记录
// TODO: 确保嘉宾抽奖码添加后的唯一性
var add = async (ctx) => {
    let validateRes = validateRecordInfo(ctx.request.body, 'add')
    if (!validateRes.status) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: validateRes.errMsg,
            }
        }
        return
    }

    // 补充录入时间信息
    let cur_timestamp = Math.floor(new Date().getTime() / 1000)
    ctx.request.body.created_at = cur_timestamp
    ctx.request.body.updated_at = cur_timestamp

    try {
        await LotteryCode.update({lottery_code: ctx.request.body.lottery_code}, ctx.request.body, {upsert: true})
        .then((newLotteryCodeInfo) => {
            ctx.body = {
                status: 1000,
                info: newLotteryCodeInfo,
            }
        })
        .then(() => mongoDB.close())
    } catch (error) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: error.toString(),
            }
        }
    }
}

// 删除/清空嘉宾抽奖码信息记录
// TODO: 批量选中并删除
var del = async (ctx) => {
    try {
        await LotteryCode.remove(ctx.request.body)
        .then((delLotteryCodeInfo) => {
            ctx.body = {
                status: 1000,
                info: delLotteryCodeInfo,
            }
        })
        .then(() => mongoDB.close())
    } catch (error) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: error.toString(),
            }
        }
    }
}

// 获取嘉宾抽奖码信息记录
var get = async (ctx) => {
    let paginate = Number(ctx.request.query.paginate) || 10,
        page = Number(ctx.request.query.page) || 1,
        sort = /asc/ig.test(ctx.request.query.sort) ? 1 : -1,
        selectedFields = {
            _id: 1,
            lottery_code: 1,
            created_at: 1,
        }
        delete ctx.request.query.paginate
        delete ctx.request.query.page
        delete ctx.request.query.sort
    try {
        let total = await LotteryCode.count(ctx.request.query)
        await LotteryCode.find(ctx.request.query, {fields: selectedFields, sort: {updated_at: sort}, skip: paginate * (page - 1), limit: paginate})
        .then(LotteryCodeList => {
            ctx.body = {
                status: 1000,
                info: LotteryCodeList,
                total: total,
                page: page,
                paginate: paginate,
            }
        })
        .then(() => mongoDB.close())
    } catch (error) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: error.toString(),
            }
        }
    }
}

// 导出嘉宾抽奖码记录为CSV格式
var exportCSV = async (ctx) => {
    let selectedFields = {
        _id: 1,
        lottery_code: 1,
        created_at: 1,
    }
    try {
        let exportData = await LotteryCode.find(ctx.request.query, {fields: selectedFields, sort: {updated_at: -1}})
        mongoDB.close()
        for (const key in exportData) {
            timeStringConvert(exportData[key], 'created_at')
        }
        return exportData
    } catch (error) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: error.toString(),
            }
        }
    }
}

// 导入CSV文件为嘉宾抽奖码记录
// TODO: 确保嘉宾抽奖码导入后的唯一性
var importCSV = async (ctx) => {
    for (let index = 0; index < ctx.length; index++) {
        const element = ctx[index]
        let validateRes = validateRecordInfo(element)
        if (!validateRes.status) {
            return {
                status: false,
                errMsg: validateRes.errMsg
            }
        }

        // 补充录入时间信息
        let cur_timestamp = Math.floor(new Date().getTime() / 1000)
        element.created_at = cur_timestamp
        element.updated_at = cur_timestamp

        delete element._id
    }

    try {
        let importRes = await LotteryCode.insert(ctx)
        mongoDB.close()
        if (importRes) {
            return {
                status: true,
                content: importRes,
                count: importRes.length,
            }
        } else {
            return {
                status: false,
                errMsg: importRes,
            }
        }
    } catch (error) {
        mongoDB.close()
        return {
            status: false,
            errMsg: error.toString(),
        }
    }
}

// 编辑嘉宾抽奖码信息记录
// TODO: 确保嘉宾抽奖码编辑后的唯一性
var edit = async (ctx) => {
    let validateRes = validateRecordInfo(ctx.request.body, 'edit')
    if (!validateRes.status) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: validateRes.errMsg,
            }
        }
        return
    }

    // 前端需将查询时获得的created_at字段传过来
    let cur_timestamp = Math.floor(new Date().getTime() / 1000)
    ctx.request.body.updated_at = cur_timestamp

    try {
        await LotteryCode.findOneAndUpdate({_id: ctx.request.body._id}, ctx.request.body)
        .then((editLotteryCodeInfo) => {
            ctx.body = {
                status: 1000,
                info: editLotteryCodeInfo,
            }
        })
        .then(() => mongoDB.close())
    } catch (error) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: error.toString(),
            }
        }
    }
}

// 检查传入数据是否存在于数据库中
var checkExistence = async (lottery_code) => {
    try {
        let checkRes = await LotteryCode.find({lottery_code: lottery_code})
        mongoDB.close()
        return checkRes
    } catch (error) {
        mongoDB.close()
        return false
    }
}

module.exports = {
    add,
    del,
    get,
    edit,
    exportCSV,
    importCSV,
    checkExistence,
}
