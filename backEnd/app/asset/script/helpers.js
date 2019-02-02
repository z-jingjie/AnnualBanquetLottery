'use strict'

const xss = require('xss')
const Json2csvParser = require('json2csv').Parser

// 表单字段存在性验证规则
let requiredFields = {
    field:  'is_guest',
    truthy: ['lottery_code'],
    // falsy:  ['name', 'phone', 'is_regular'],
    falsy:  ['name', 'phone'],
},
requiredPrizeFields = [
    'prize_title',
    'prize_rank',
    'prize_value',
    'prize_desc',
    'regular_staff_prize_stock',
    'regular_staff_prize_remain',
    'others_prize_stock',
    'others_prize_remain',
]

// 根据传入值，在指定上下文中设置布尔值
var booleanConvert = (context, value) => {
    if (context.hasOwnProperty(value)) {
        if (/false/i.test(context[value]) || context[value] == '0') {
            context[value] = false
        } else {
            context[value] = true
        }
    }
}

// 根据传入值，在指定上下文中设置时间字符串
var timeStringConvert = (context, value) => {
    if (context.hasOwnProperty(value)) {
        if (typeof context[value] == 'number') {
            let timeString = new Date((context[value]+8*60*60) * 1000).toISOString().substr(0, 19).replace('T', ' ')
            context[value] = timeString
        }
    }
}

// 将传入的JSON格式数据转换为CSV格式数据
var JSONtoCSV = (JSONData, options) => {
    const CSVParser = new Json2csvParser(options)
    var CSVStream = CSVParser.parse(JSONData)
    return CSVStream
}

// 将传入的CSV格式数据转换为JSON格式数据
// https://gist.github.com/iwek/7154578
var CSVtoJSON = (CSVData) => {
    const [firstLine, ...lines] = CSVData.split('\n')
    return lines.map(line =>
        firstLine.split(',').reduce((curr, next, index) => ({
                ...curr,
                [next]: line.split(',')[index],
            }),
            {}
        )
    )
}

// 从random.org获取真随机值
// https://api.random.org/json-rpc/1/request-builder
var realRandomInt = async (context, method) => {
    // console.log(context)
    let axios = require('axios'),
        postBody = {
            jsonrpc: "2.0",
            method: method,
            params: {
                apiKey: "0fcdca49-5626-4bbe-89dd-6612c1fb4f7f",
                n: context.count,
                min: context.min,
                max: context.max,
                replacement: true,
                base: 10
            },
            id: 4611
        },
        randomInt = await axios.post('https://api.random.org/json-rpc/1/invoke', postBody)
    if (randomInt.status === 200) {
        return {
            status: true,
            resMsg: randomInt.data,
            randomInt: randomInt.data.result.random.data[0],
            // 返回体randomInt.data
            // {
            //     "jsonrpc": "2.0",
            //     "result": {
            //         "random": {
            //             "data": [1, 0, 0, 0, 2],
            //             "completionTime": "2019-01-09 11:48:37Z"
            //         },
            //         "bitsUsed": 10,
            //         "bitsLeft": 249612,
            //         "requestsLeft": 989,
            //         "advisoryDelay": 1180
            //     },
            //     "id": 4611
            // }
        }
    } else {
        return {
            status: false
        }
    }
}

// 数组成员随机排列 (基于优化版Fisher–Yates随机算法)
var shffuleArray = (targetArr) => {
    let randomIndex, temp, index
    for (index = targetArr.length - 1; index > 0; index--) {
        randomIndex = Math.floor(Math.random() * (index + 1))
        // 交换成员顺序
        temp = targetArr[index]
        targetArr[index] = targetArr[randomIndex]
        targetArr[randomIndex] = temp
    }
    return targetArr
}

// 根据传入的公司员工/邀请嘉宾信息，进行合法性验证
var validateRecordInfo = (context) => {
    // 格式化POST请求中的form-data字段 (转为布尔值)
    booleanConvert(context, 'is_guest')
    booleanConvert(context, 'is_regular')

    if (context.hasOwnProperty(requiredFields.field)) {
        if (context[requiredFields.field]) {
            for (let index = 0; index < requiredFields['truthy'].length; index++) {
                if (!context.hasOwnProperty(requiredFields['truthy'][index])) return {
                    status: false,
                    errMsg: `字段不合法：缺少${requiredFields['truthy'][index]}字段信息`
                }
            }
        } else {
            for (let index = 0; index < requiredFields['falsy'].length; index++) {
                if (!context.hasOwnProperty(requiredFields['falsy'][index])) return {
                    status: false,
                    errMsg: `字段不合法：缺少${requiredFields['falsy'][index]}字段信息`
                }
            }
        }
    } else {
        return {
            status: false,
            errMsg: `字段不合法：缺少${requiredFields.field}字段信息`
        }
    }

    if (context.hasOwnProperty('lottery_code')) {
        // 对嘉宾邀请码进行正则校验
        if (!/^ZUZUIT-[A-za-z0-9]{6}$/ig.test(context.lottery_code)) {
            return {
                status: false,
                errMsg: `字段不合法：抽奖码${context.lottery_code}不正确 (印刷字符均为大写)`,
            }
        }
    }

    if (context.hasOwnProperty('phone')) {
        // 对手机号进行正则校验
        if (/^1(3[0-9]|4[579]|5[0-35-9]|6[6]|7[0135678]|8[0-9]|9[89])\d{8}$/.test(context.phone)) {
            context.phone = xss(context.phone)
        } else {
            return {
                status: false,
                errMsg: `字段不合法：手机号${context.phone}不正确`,

            }
        }
    }

    return {status: true}
}

// 根据传入的奖项配置信息，进行合法性验证
var validatePrizeInfo = (context) => {
    for (let index = 0; index < requiredPrizeFields.length; index++) {
        const element = requiredPrizeFields[index]
        if (!context.hasOwnProperty(element)) return {
            status: false,
            errMsg: `字段不合法：缺少${element}字段信息`
        }
        if (!/prize_(title|desc)/ig.test(element) && parseInt(context[element]) == NaN) return {
            status: false,
            errMsg: `字段不合法：${element}字段值应为数字或数字字符串`
        }
    }

    return {status: true}
}

module.exports = {
    booleanConvert,
    timeStringConvert,
    JSONtoCSV,
    CSVtoJSON,
    realRandomInt,
    shffuleArray,
    validateRecordInfo,
    validatePrizeInfo,
}