'use strict'

const SystemConf = require('../../config/system')
const { booleanConvert, validateCandidateInfo } = require('../asset/script/helpers')
const mongoDB = require('monk')(`${SystemConf.database.host}:${SystemConf.database.port}/${SystemConf.database.dbname}`)
const candidate = mongoDB.get('candidate')
const xss = require('xss')

// 增加抽奖活动参与者记录
var add = async (ctx) => {
    let validateRes = validateCandidateInfo(ctx.request.body)
    if (!validateRes) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '字段不合法',
            }
        }
        return
    }

    // 根据最新手机号规则进行手机号正则校验
    if (/^1(3[0-9]|4[57]|5[0-35-9]|6[6]|8[0-9]|9[89]|7[0678])\d{8}$/.test(ctx.request.body.phone)) {
        ctx.request.body.phone = xss(ctx.request.body.phone)
    } else {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '手机号码不合法',
            }
        }
        return
    }
    
    // 补充参与者数据的录入时间信息
    let cur_timestamp = Math.floor(new Date().getTime() / 1000)
    ctx.request.body.created_at = cur_timestamp
    ctx.request.body.updated_at = cur_timestamp

    try {
        await candidate.insert(ctx.request.body)
        .then((newUserInfo) => {
            ctx.body = {
                status: 1000,
                info: newUserInfo,
            }
        })
        .then(() => mongoDB.close())
    } catch (error) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: error,
            }
        }
    }
}

// 删除/清空抽奖活动参与者记录
// todo: 批量选中并删除
var del = async (ctx) => {
    try {
        await candidate.remove(ctx.request.body)
        .then((delUserInfo) => {
            ctx.body = {
                status: 1000,
                info: delUserInfo,
            }
        })
        .then(() => mongoDB.close())
    } catch(error) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: error,
            }
        }
    }
}

// 获取抽奖活动参与者记录
var get = async (ctx) => {
    let paginate = Number(ctx.request.query.paginate) || 10,
        page = Number(ctx.request.query.page) || 1,
        selectedFields = {
            _id: 1,
            name: 1,
            phone: 1,
            is_guest: 1,
        }
        delete ctx.request.query.paginate
        delete ctx.request.query.page
    try {
        let total = await candidate.count(ctx.request.query)
        await candidate.find(ctx.request.query, {fields: selectedFields, sort: {updated_at: -1}, skip: paginate * (page - 1), limit: paginate})
        .then(candidateList => {
            ctx.body = {
                status: 1000,
                info: candidateList,
                total: total,
                page: page,
                paginate: paginate,
                // req_query: ctx.request.query,
                // req_querystring: ctx.request.querystring,
                // ctx_query: ctx.query,
                // ctx_querystring: ctx.querystring,
            }
        })
        .then(() => mongoDB.close())
    } catch (error) {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: error,
            }
        }
    }
}

// 编辑抽奖活动参与者记录
var edit = async (ctx) => {
    // koa-body处理POST请求中的form-data
    booleanConvert(ctx.request.body, 'is_guest')

    // 根据最新手机号规则进行手机号正则校验
    if (/^1(3[0-9]|4[57]|5[0-35-9]|6[6]|8[0-9]|9[89]|7[0678])\d{8}$/.test(ctx.request.body.phone)) {
        ctx.request.body.phone = xss(ctx.request.body.phone)
        let cur_timestamp = Math.floor(new Date().getTime() / 1000)
        ctx.request.body.updated_at = cur_timestamp

        try {
            await candidate.findOneAndUpdate({_id: ctx.request.body._id}, ctx.request.body)
            .then((editUserInfo) => {
                ctx.body = {
                    status: 1000,
                    info: editUserInfo,
                }
            })
            .then(() => mongoDB.close())
        } catch (error) {
            mongoDB.close()
            ctx.body = {
                status: 1001,
                data: {
                    info: '出错了',
                    msg: error,
                }
            }
        }
    } else {
        mongoDB.close()
        ctx.body = {
            status: 1001,
            data: {
                info: '手机号码不合法',
            }
        }
    }
}

module.exports = {
  add,
  del,
  get,
  edit,
}
