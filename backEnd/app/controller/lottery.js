'use strict'

const { validateRecordInfo } = require('../asset/script/helpers')
const lotteryModel = require('../models/lottery')
const Log = require('./log')
let lotteryResult,
    regularStaffQueue = [],
    othersQueue       = [],
    lotteryControl    = { status: true, statusCode: 1 },
    lotteryStatusData = [
        {
            name: '启动抽奖活动',
            code: '1',
            description: '启动抽奖活动',
            btnType: 'success',
        },{
            name: '暂停抽奖活动',
            code: '2',
            description: '暂停抽奖活动，参与者无法参加抽奖或查询中奖信息',
            btnType: 'warning',
        },{
            name: '结束抽奖活动',
            code: '3',
            description: '结束抽奖活动，参与者无法参加抽奖或查询中奖信息',
            btnType: 'danger',
        },{
            name: '重置抽奖活动',
            code: '4',
            description: '重置抽奖活动，重新生成抽奖队列',
            btnType: 'primary',
        }
    ]

// 初始化分组抽奖队列(x2)，等待抽奖
var init = async () => {
    let lotteryQueues = await lotteryModel.initLotteryQueue()
    if (lotteryQueues.status) {
        regularStaffQueue = lotteryQueues.regularStaffQueue
        othersQueue       = lotteryQueues.othersQueue
        Log.add(`初始化转正员工奖项队列长度: ${regularStaffQueue.length}`, 'debug', 'lotteryController')
        console.log('初始化转正员工奖项队列长度:', regularStaffQueue.length)
        Log.add(`初始化其他人员奖项队列长度: ${othersQueue.length}`, 'debug', 'lotteryController')
        console.log('初始化其他人员奖项队列长度:', othersQueue.length)
        Log.add(`等待抽奖请求传入...`, 'debug', 'lotteryController')
        console.log('等待抽奖请求传入...')
    } else {
        Log.add(JSON.stringify(lotteryQueues), 'error', 'lotteryController')
        console.error(lotteryQueues)
    }
}

init()

// 验证抽奖参与人表单提交信息
var validate = async (ctx) => {
    // 抽奖活动状态判定
    if (!lotteryControl.status) {
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: lotteryControl.resMsg,
            }
        }
        return ctx.body
    }

    // POST表单字段存在性验证
    let validateRecordInfoRes = validateRecordInfo(ctx.request.body)
    Log.add(`POST表单字段存在性验证: ${JSON.stringify(validateRecordInfoRes)}`, 'debug', 'lotteryController')
    console.log('POST表单字段存在性验证', validateRecordInfoRes)
    if (!validateRecordInfoRes.status) {
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: validateRecordInfoRes.errMsg,
            }
        }
        return ctx.body
    }

    // 表单信息的数据库白名单验证
    let whiteListCheckRes = await lotteryModel.whiteListCheck(ctx.request.body)
    Log.add(`表单信息的数据库白名单验证: ${JSON.stringify(whiteListCheckRes)}`, 'debug', 'lotteryController')
    console.log('表单信息的数据库白名单验证', whiteListCheckRes)
    if (!whiteListCheckRes.status) {
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: whiteListCheckRes.errMsg,
            }
        }
        return ctx.body
    }

    // 检查是否已参加抽奖
    let winnerCheckRes
    // 根据不同参与者身份，构造有效请求体
    if (ctx.request.body.is_guest) {
        delete ctx.request.body.name
        delete ctx.request.body.phone
        delete ctx.request.body.is_regular
        winnerCheckRes = await lotteryModel.winnerCheck({
            lottery_code: ctx.request.body.lottery_code,
        })
    } else {
        delete ctx.request.body.lottery_code
        winnerCheckRes = await lotteryModel.winnerCheck({
            name: ctx.request.body.name,
            phone: ctx.request.body.phone,
        })
    }
    Log.add(`是否已参加抽奖: { status: ${winnerCheckRes.status} }`, 'debug', 'lotteryController')
    console.log('是否已参加抽奖', { status: winnerCheckRes.status })
    if (winnerCheckRes.status) {
        ctx.body = {
            status: 1002,
            info: winnerCheckRes.resMsg,
            randomIndex: null,
            recorded: true,
        }
        return ctx.body
    } else {
        ctx.body = {
            status: 1000,
            info: '抽奖参与人信息校验通过'
        }
        return true
    }
}

// 参加抽奖
var join = async (ctx) => {
    let validateRes = await validate(ctx)
    if (!validateRes) {
        ctx.body = validateRes
        return false
    }

    // 是否为转正员工
    let regularStaffCheckRes = await lotteryModel.regularStaffCheck(ctx.request.body)
    Log.add(`是否为转正员工: ${JSON.stringify(regularStaffCheckRes)}`, 'debug', 'lotteryController')
    console.log('是否为转正员工', regularStaffCheckRes)

    // 进入抽奖流程
    if (regularStaffCheckRes.hasOwnProperty('status')) {
        lotteryResult = await groupedLottery(ctx.request.body, regularStaffCheckRes)
    } else {
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: regularStaffCheckRes,
            }
        }
    }

    // 返回中奖信息
    if (lotteryResult.status) {
        ctx.body = {
            status: 1000,
            info: lotteryResult.winnerInfo,
            randomIndex: lotteryResult.randomIndex,
            recorded: false,
        }
    } else {
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: lotteryResult.errMsg,
            }
        }
    }
}

// 根据用户身份，进行分组抽奖
var groupedLottery = async (context, isRegularStaff) => {
    let prizeOutput, currentPrize
    context = Object.assign(context, {is_regular: isRegularStaff.status})
    if (isRegularStaff.status) {
        // 转正员工，匹配全奖项抽奖队列
        prizeOutput = await lotteryModel.randomlyPickPrize(context, regularStaffQueue)
        // 根据返回的随机索引值，从全奖项抽奖队列中弹出该元素
        currentPrize = regularStaffQueue.splice(prizeOutput.randomIndex, 1)[0]
        Log.add(`分组抽奖中奖情况: ${JSON.stringify(currentPrize)}`, 'debug', 'lotteryController')
        console.log('分组抽奖中奖情况', currentPrize)
        Log.add(`转正员工奖项队列长度: ${regularStaffQueue.length}`, 'debug', 'lotteryController')
        console.log('转正员工奖项队列长度:', regularStaffQueue.length)
    } else {
        // 非转正员工，匹配本轮奖项抽奖队列
        prizeOutput = await lotteryModel.randomlyPickPrize(context, othersQueue)
        // 根据返回的随机索引值，从本轮奖项抽奖队列中弹出该元素
        currentPrize = othersQueue.splice(prizeOutput.randomIndex, 1)[0]
        Log.add(`分组抽奖中奖情况: ${JSON.stringify(currentPrize)}`, 'debug', 'lotteryController')
        console.log('分组抽奖中奖情况', currentPrize)
        Log.add(`转正员工奖项队列长度: ${othersQueue.length}`, 'debug', 'lotteryController')
        console.log('其他人员奖项队列长度:', othersQueue.length)
    }

    // 返回中奖信息
    return prizeOutput
}

// 抽奖活动状态控制
var control = async (ctx) => {
    if (!ctx.request.body.hasOwnProperty('status')) {
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: '字段不合法：缺少status字段信息',
            }
        }
        return
    }

    let resMsg

    switch (ctx.request.body.status) {
        case '1':   // 启动抽奖活动
            lotteryControl = { status: true, statusCode: 1 }
            resMsg = '抽奖活动状态更新: 已启动'
            break;
        case '2':   // 暂停抽奖活动
            lotteryControl = {
                status: false,
                statusCode: 2,
                resMsg: '抱歉，抽奖活动暂停中，请等待开始或联系工作人员'
            }
            resMsg = '抽奖活动状态更新: 暂停中'
            break;
        case '3':   // 结束抽奖活动
            lotteryControl = {
                status: false,
                statusCode: 3,
                resMsg: '抱歉，抽奖活动已经结束，未参加者请到兑奖处联系工作人员'
            }
            resMsg = '抽奖活动状态更新: 已结束'
            break;
        case '4':   // 重置抽奖活动
            regularStaffQueue = []
            othersQueue       = []
            init()
            lotteryControl = { status: true, statusCode: 4 }
            resMsg = '抽奖活动状态更新: 已重置'
            break;
        default:
            ctx.body = {
                status: 1001,
                data: {
                    info: '出错了',
                    msg: '字段不合法：抽奖活动状态值不正确',
                }
            }
            return
    }

    Log.add(JSON.stringify(resMsg), 'debug', 'lotteryController')
    console.log(resMsg)

    ctx.body = {
        status: 1000,
        info: resMsg,
    }
}

// 抽奖活动系统信息查询
var overview = async (ctx) => {
    let res = lotteryControl
    res = Object.assign(res, {statusData: lotteryStatusData})
    ctx.body = {
        status: 1000,
        info: res,
    }
}

module.exports = {
    init,
    validate,
    join,
    control,
    overview,
}