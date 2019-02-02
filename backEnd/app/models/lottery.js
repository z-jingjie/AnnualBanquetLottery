'use strict'

const SystemConf = require('../../config/system')
const DefaultConf = require('../../config/default')
const { realRandomInt, shffuleArray } = require('../asset/script/helpers')
const mongoDB    = require('monk')(`${SystemConf.database.host}:${SystemConf.database.port}/${SystemConf.database.dbname}`)
const prize      = mongoDB.get('prize')
const winner     = mongoDB.get('winner')

// 嘉宾抽奖码/员工信息白名单鉴权
var whiteListCheck = async (context) => {
    let checkRes
    // 嘉宾
    if (context.is_guest) {
        // 验证租租IT嘉宾抽奖码合法性 (抽奖码白名单机制)
        const lotteryCodeModel = require('./lotterycode')
        checkRes = await lotteryCodeModel.checkExistence(context.lottery_code)
    } else {
        // 验证租租IT员工抽奖参与资格 (员工白名单机制)
        const staffModel = require('./staff')
        checkRes = await staffModel.checkExistence(context)
    }

    if (checkRes.length) {
        return {status: true}
    } else {
        return {
            status: false,
            errMsg: '抱歉，信息校验失败，您可能没有参加资格'
        }
    }
}

// 验证当前参与者是否已经中奖
var winnerCheck = async (context) => {
    const winnerModel = require('./winner')
    let checkRes = await winnerModel.check(context)

    // 若已中奖，直接返回中奖结果
    if (checkRes.length) {
        return {
            status: true,
            resMsg: checkRes[0],
        }
    } else {
        return {status: false}
    }
}

// 验证当前参与者是否为转正员工
var regularStaffCheck = async (context) => {
    const staffModel = require('./staff')
    let checkRes = await staffModel.checkRegular(context)

    if (checkRes.length) {
        return {status: true}
    } else {
        return {status: false}
    }
}

// 构建初始抽奖队列
var constructQueue = async (input, countParam) => {
    let output = []
    for (const key in input) {
        let tempQueue = Array(input[key][countParam]).fill({
            _id:         input[key]._id,
            prize_title: input[key].prize_title,
            prize_rank:  input[key].prize_rank,
            prize_value: input[key].prize_value,
            prize_desc:  input[key].prize_desc,
        })
        output = output.concat(tempQueue)
    }
    return output
}

// 初始化抽奖队列
var initLotteryQueue = async () => {
    try {
        let regularStaffPrize = await prize.find({ regular_staff_prize_stock: { $gt: 0 }, regular_staff_prize_remain: { $gt: 0 } }),
            othersPrize       = await prize.find({ others_prize_stock: { $gt: 0 }, others_prize_remain: { $gt: 0 } }),
            regularStaffQueue = await constructQueue(regularStaffPrize, 'regular_staff_prize_remain'),
            othersQueue       = await constructQueue(othersPrize, 'others_prize_remain')
        regularStaffQueue = shffuleArray(regularStaffQueue)
        othersQueue       = shffuleArray(othersQueue)
        return {
            status: true,
            regularStaffQueue,
            othersQueue,
        }
    } catch (error) {
        mongoDB.close()
        return {
            status: 1001,
            data: {
                info: '出错了',
                msg: error.toString(),
            }
        }
    }
}

// 随机抽取奖项，返回随机下标值，入库中奖表，修改奖项库存，返回奖项信息
var randomlyPickPrize = async (participant, targetQueue) => {
    // 指定范围中，生成随机下标值
    // let randomIndex = await realRandomInt({
    //     min: 0,
    //     max: (targetQueue.length - 1),
    //     count: 5
    // }, 'generateIntegers')
    // console.log('指定范围中，生成随机下标值', randomIndex)
    let queueLength = targetQueue.length,
        randomIndex = Math.floor(Math.random() * queueLength),
        currentPrize = targetQueue[randomIndex],
        newWinnerInfo = participant,
        newPrizeStatus = null
        // console.log('参加者信息:', participant)
        // console.log('中奖信息:', currentPrize)

    // 中奖记录入库winner表
    const winnerModel = require('./winner')
    // 构造中奖者信息 (若队列已空，则提供默认的最低奖项)
    newWinnerInfo = Object.assign(newWinnerInfo, {
        prize_title: currentPrize ? currentPrize.prize_title : DefaultConf.prize.prize_title,
        prize_rank:  currentPrize ? currentPrize.prize_rank  : DefaultConf.prize.prize_rank,
        prize_value: currentPrize ? currentPrize.prize_value : DefaultConf.prize.prize_value,
    })
    // 若队列已空，则加入标记声明该奖项为默认指定奖项
    if (!currentPrize) {
        newWinnerInfo = Object.assign(newWinnerInfo, {
            is_default_prize: true,
        })
    }
    let checkRes = await winnerModel.insertWinnerInfo(newWinnerInfo)
    if (!checkRes.status) {
        return {
            status: false,
            errMsg: checkRes.errMsg,
            currentPrize: currentPrize,
            randomIndex: randomIndex,
        }
    }

    // 若奖项队列存在，则修改奖项配置表对应库存
    if (currentPrize) {
        const prizeModel = require('./prize')
        newPrizeStatus = await prizeModel.updatePrizeStock(currentPrize._id, participant, 1)
        if (!newPrizeStatus.status) {
            return {
                status: false,
                errMsg: newPrizeStatus.errMsg,
                currentPrize: currentPrize,
                randomIndex: randomIndex,
            }
        }
    }
    
    return {
        status: true,
        currentPrize: currentPrize,
        randomIndex: randomIndex,
        winnerInfo: checkRes.winnerInfo,
        newPrizeStatus: newPrizeStatus ? newPrizeStatus.updateRes : null,
    }
}

module.exports = {
  whiteListCheck,
  winnerCheck,
  regularStaffCheck,
  initLotteryQueue,
  randomlyPickPrize,
}
