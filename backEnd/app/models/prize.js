'use strict'

const SystemConf = require('../../config/system')
const { timeStringConvert, validatePrizeInfo } = require('../asset/script/helpers')
const mongoDB = require('monk')(`${SystemConf.database.host}:${SystemConf.database.port}/${SystemConf.database.dbname}`)
const prize = mongoDB.get('prize')

// 增加奖项配置信息记录
var add = async (ctx) => {
    let validateRes = validatePrizeInfo(ctx.request.body)
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

    // 格式化奖项库存信息
    ctx.request.body.prize_rank  = parseInt(ctx.request.body.prize_rank)
    ctx.request.body.prize_value = parseInt(ctx.request.body.prize_value)
    ctx.request.body.regular_staff_prize_stock  = parseInt(ctx.request.body.regular_staff_prize_stock)
    ctx.request.body.regular_staff_prize_remain = parseInt(ctx.request.body.regular_staff_prize_stock)
    ctx.request.body.others_prize_stock  = parseInt(ctx.request.body.others_prize_stock)
    ctx.request.body.others_prize_remain = parseInt(ctx.request.body.others_prize_stock)

    // 补充录入时间信息
    let cur_timestamp = Math.floor(new Date().getTime() / 1000)
    ctx.request.body.created_at = cur_timestamp
    ctx.request.body.updated_at = cur_timestamp

    try {
        await prize.insert(ctx.request.body)
        .then((newPrizeInfo) => {
            ctx.body = {
                status: 1000,
                info: newPrizeInfo,
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

// 删除/清空奖项配置信息记录
// todo: 批量选中并删除
var del = async (ctx) => {
    try {
        await prize.remove(ctx.request.body)
        .then((delprizeInfo) => {
            ctx.body = {
                status: 1000,
                info: delprizeInfo,
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

// 获取奖项配置信息记录
var get = async (ctx) => {
    let paginate = Number(ctx.request.query.paginate) || 10,
        page = Number(ctx.request.query.page) || 1,
        sort = /desc/ig.test(ctx.request.query.sort) ? -1 : 1,
        selectedFields = {
            _id: 1,
            prize_title: 1,
            prize_rank: 1,
            prize_value: 1,
            prize_desc: 1,
            regular_staff_prize_stock: 1,
            regular_staff_prize_remain: 1,
            others_prize_stock: 1,
            others_prize_remain: 1,
            created_at: 1,
        }
        delete ctx.request.query.paginate
        delete ctx.request.query.page
        delete ctx.request.query.sort
    try {
        let total = await prize.count(ctx.request.query)
        await prize.find(ctx.request.query, {fields: selectedFields, sort: {prize_rank: sort}, skip: paginate * (page - 1), limit: paginate})
        .then(prizeList => {
            ctx.body = {
                status: 1000,
                info: prizeList,
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

// 导出奖项配置记录为CSV格式
var exportCSV = async (ctx) => {
    let selectedFields = {
        _id: 1,
        prize_title: 1,
        prize_rank: 1,
        prize_value: 1,
        prize_desc: 1,
        regular_staff_prize_stock: 1,
        regular_staff_prize_remain: 1,
        others_prize_stock: 1,
        others_prize_remain: 1,
        created_at: 1,
    }
    try {
        let exportData = await prize.find(ctx.request.query, {fields: selectedFields, sort: {prize_rank: 1}})
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

// 导入CSV文件为奖项配置记录
var importCSV = async (ctx) => {
    for (let index = 0; index < ctx.length; index++) {
        const element = ctx[index]
        let validateRes = validatePrizeInfo(element)
        if (!validateRes.status) {
            return {
                status: false,
                errMsg: validateRes.errMsg
            }
        }

        // 格式化奖项库存信息
        element.prize_rank   = parseInt(element.prize_rank)
        element.prize_value  = parseInt(element.prize_value)
        element.regular_staff_prize_stock  = parseInt(element.regular_staff_prize_stock)
        element.regular_staff_prize_remain = parseInt(element.regular_staff_prize_remain)
        element.others_prize_stock  = parseInt(element.others_prize_stock)
        element.others_prize_remain = parseInt(element.others_prize_remain)

        // 补充录入时间信息
        let cur_timestamp = Math.floor(new Date().getTime() / 1000)
        element.created_at = cur_timestamp
        element.updated_at = cur_timestamp

        delete element._id
    }

    try {
        let importRes = await prize.insert(ctx)
        mongoDB.close()
        if (importRes) {
            // 重新导入奖项配置后，刷新抽奖队列
            const {init} = require('../controller/lottery')
            init()
            console.log('Note: 清空并重新导入奖项配置后，重置抽奖队列 (请记得及时清空中奖数据)...')

            return {
                status: 1000,
                content: importRes,
                count: importRes.length,
            }
        } else {
            return {
                status: 1001,
                errMsg: importRes
            }
        }
    } catch (error) {
        mongoDB.close()
        return {
            status: 1001,
            errMsg: error
        }
    }
}

// 编辑奖项配置信息记录
var edit = async (ctx) => {
    let validateRes = validatePrizeInfo(ctx.request.body)
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

    // 格式化奖项库存信息
    ctx.request.body.prize_rank   = parseInt(ctx.request.body.prize_rank)
    ctx.request.body.prize_value  = parseInt(ctx.request.body.prize_value)
    ctx.request.body.regular_staff_prize_stock  = parseInt(ctx.request.body.regular_staff_prize_stock)
    ctx.request.body.regular_staff_prize_remain = parseInt(ctx.request.body.regular_staff_prize_remain)
    ctx.request.body.others_prize_stock  = parseInt(ctx.request.body.others_prize_stock)
    ctx.request.body.others_prize_remain = parseInt(ctx.request.body.others_prize_remain)

    // 前端需将查询时获得的created_at字段传过来
    let cur_timestamp = Math.floor(new Date().getTime() / 1000)
    ctx.request.body.updated_at = cur_timestamp

    try {
        await prize.findOneAndUpdate({_id: ctx.request.body._id}, ctx.request.body)
        .then((editPrizeInfo) => {
            ctx.body = {
                status: 1000,
                info: editPrizeInfo,
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

// 根据传入的奖项信息，更新该奖项库存
var updatePrizeStock = async (currentPrizeID, participant, reduceAmount) => {
    if (typeof reduceAmount !== 'number') {
        return {
            status: false,
            errMsg: '奖项库存减少值数据类型错误，应为number',
        }
    }
    
    try {
        let newPrizeInfo = await prize.findOne({_id: currentPrizeID})
        if (participant.is_guest || !participant.is_regular) {
            newPrizeInfo.others_prize_remain -= reduceAmount
        } else {
            newPrizeInfo.regular_staff_prize_remain -= reduceAmount
        }

        let updateRes = await prize.findOneAndUpdate({_id: currentPrizeID}, newPrizeInfo)
        mongoDB.close()
        return {
            status: true,
            updateRes: updateRes,
        }
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

module.exports = {
    add,
    del,
    get,
    edit,
    exportCSV,
    importCSV,
    updatePrizeStock,
}
