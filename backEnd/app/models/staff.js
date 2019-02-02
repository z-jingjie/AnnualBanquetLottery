'use strict'

const SystemConf = require('../../config/system')
const { timeStringConvert, validateRecordInfo } = require('../asset/script/helpers')
const mongoDB = require('monk')(`${SystemConf.database.host}:${SystemConf.database.port}/${SystemConf.database.dbname}`)
const staff = mongoDB.get('staff')

// 增加公司员工信息记录
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
        await staff.insert(ctx.request.body)
        .then((newStaffInfo) => {
            ctx.body = {
                status: 1000,
                info: newStaffInfo,
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

// 删除/清空公司员工信息记录
// todo: 批量选中并删除
var del = async (ctx) => {
    try {
        await staff.remove(ctx.request.body)
        .then((delStaffInfo) => {
            ctx.body = {
                status: 1000,
                info: delStaffInfo,
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

// 获取公司员工信息记录
var get = async (ctx) => {
    let paginate = Number(ctx.request.query.paginate) || 10,
        page = Number(ctx.request.query.page) || 1,
        sort = /asc/ig.test(ctx.request.query.sort) ? 1 : -1,
        selectedFields = {
            _id: 1,
            name: 1,
            phone: 1,
            is_guest: 1,
            is_regular: 1,
            created_at: 1,
        }
        delete ctx.request.query.paginate
        delete ctx.request.query.page
        delete ctx.request.query.sort
    try {
        let total = await staff.count(ctx.request.query)
        await staff.find(ctx.request.query, {fields: selectedFields, sort: {updated_at: sort}, skip: paginate * (page - 1), limit: paginate})
        .then(staffList => {
            ctx.body = {
                status: 1000,
                info: staffList,
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

// 导出公司员工记录为CSV格式
var exportCSV = async (ctx) => {
    let selectedFields = {
        _id: 1,
        name: 1,
        phone: 1,
        is_guest: 1,
        is_regular: 1,
        created_at: 1,
    }
    try {
        let exportData = await staff.find(ctx.request.query, {fields: selectedFields, sort: {updated_at: -1}})
        for (const key in exportData) {
            timeStringConvert(exportData[key], 'created_at')
        }
        mongoDB.close()
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

// 导入CSV文件为公司员工记录
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
        let importRes = await staff.insert(ctx)
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

// 编辑公司员工信息记录
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
        await staff.findOneAndUpdate({_id: ctx.request.body._id}, ctx.request.body)
        .then((editStaffInfo) => {
            ctx.body = {
                status: 1000,
                info: editStaffInfo,
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
var checkExistence = async (context) => {
    try {
        let checkRes = await staff.find({
            name: context.name,
            phone: context.phone,
        })
        mongoDB.close()
        return checkRes
    } catch (error) {
        mongoDB.close()
        return false
    }
}

// 检查传入数据是否存在于数据库中
var checkRegular = async (context) => {
    try {
        let checkRes = await staff.find({
            name: context.name,
            phone: context.phone,
            is_regular: true,
        })
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
    checkExistence,
    checkRegular,
    exportCSV,
    importCSV,
}
