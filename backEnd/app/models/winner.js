'use strict'

const SystemConf = require('../../config/system')
const { timeStringConvert, validateRecordInfo } = require('../asset/script/helpers')
const mongoDB = require('monk')(`${SystemConf.database.host}:${SystemConf.database.port}/${SystemConf.database.dbname}`)
const winner = mongoDB.get('winner')

// 增加中奖人员信息记录
var add = async (ctx) => {
    let validateRes = validateRecordInfo(ctx.request.body)
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
        await winner.insert(ctx.request.body)
        .then((newWinnerInfo) => {
            ctx.body = {
                status: 1000,
                info: newWinnerInfo,
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

// 删除/清空中奖人员信息记录
// todo: 批量选中并删除
var del = async (ctx) => {
    try {
        await winner.remove(ctx.request.body)
        .then((delWinnerInfo) => {
            ctx.body = {
                status: 1000,
                info: delWinnerInfo,
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

// 获取中奖人员信息记录
var get = async (ctx) => {
    let paginate = Number(ctx.request.query.paginate) || 10,
        page = Number(ctx.request.query.page) || 1,
        sort = /asc/ig.test(ctx.request.query.sort) ? 1 : -1,
        selectedFields = {
            _id: 1,
            name: 1,
            phone: 1,
            is_regular: 1,
            is_guest: 1,
            is_default_prize: 1,
            lottery_code: 1,
            created_at: 1,
            prize_title: 1,
            prize_rank: 1,
            prize_value: 1,
        }
        delete ctx.request.query.paginate
        delete ctx.request.query.page
        delete ctx.request.query.sort
    try {
        let total = await winner.count(ctx.request.query)
        await winner.find(ctx.request.query, {fields: selectedFields, sort: {updated_at: sort}, skip: paginate * (page - 1), limit: paginate})
        .then(winnerList => {
            ctx.body = {
                status: 1000,
                info: winnerList,
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

// 导出中奖人员记录为CSV格式
var exportCSV = async (ctx) => {
    let selectedFields = {
        _id: 1,
        name: 1,
        phone: 1,
        is_regular: 1,
        is_guest: 1,
        lottery_code: 1,
        created_at: 1,
        prize_title: 1,
        prize_rank: 1,
        prize_value: 1,
    }
    try {
        let exportData = await winner.find(ctx.request.query, {fields: selectedFields, sort: {updated_at: -1}})
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

// 编辑中奖人员信息记录
var edit = async (ctx) => {
    let validateRes = validateRecordInfo(ctx.request.body)
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
        await winner.findOneAndUpdate({_id: ctx.request.body._id}, ctx.request.body)
        .then((editWinnerInfo) => {
            ctx.body = {
                status: 1000,
                info: editWinnerInfo,
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

// 检查参与人是否已经中奖
var check = async (context) => {
    try {
        let checkRes = await winner.find(context)
        mongoDB.close()
        return checkRes
    } catch (error) {
        mongoDB.close()
        return false
    }
}

// 中奖信息入库
var insertWinnerInfo = async (winnerInfo) => {
    let validateRes = validateRecordInfo(winnerInfo)
    if (!validateRes.status) {
        mongoDB.close()
        return {
            status: false,
            errMsg: validateRes.errMsg,
        }
    }

    // 补充录入时间信息
    let cur_timestamp = Math.floor(new Date().getTime() / 1000)
    winnerInfo.created_at = cur_timestamp
    winnerInfo.updated_at = cur_timestamp

    try {
        let newWinnerInfo = await winner.insert(winnerInfo)
        mongoDB.close()
        return {
            status: true,
            winnerInfo: newWinnerInfo,
        }
    } catch (error) {
        mongoDB.close()
        return {
            status: false,
            errMsg: error.toString(),
        }
    }
}

module.exports = {
    add,
    del,
    get,
    edit,
    check,
    exportCSV,
    insertWinnerInfo,
}
