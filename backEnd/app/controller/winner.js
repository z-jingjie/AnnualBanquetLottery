'use strict'

const fs = require('fs')
const iconvLite = require('iconv-lite')
const winnerModel = require('../models/winner')
const { JSONtoCSV, CSVtoJSON } = require('../asset/script/helpers')

// 导出查询数据为CSV文件(以供浏览器下载)
// https://stackoverflow.com/a/39896028/8406905
var exportCSV = async (ctx) => {
    let exportData = await winnerModel.exportCSV(ctx)

    try {
        var opts = [
            {
                label: '唯一ID',
                value: '_id',
            },{
                label: '员工姓名',
                value: 'name',
            },{
                label: '手机号码',
                value: 'phone',
            },{
                label: '是否转正',
                value: 'is_regular',
            },{
                label: '是否嘉宾',
                value: 'is_guest',
            },{
                label: '嘉宾抽奖码',
                value: 'lottery_code',
            },{
                label: '中奖时间',
                value: 'created_at',
            },{
                label: '奖项名称',
                value: 'prize_title',
            },{
                label: '奖项级别',
                value: 'prize_rank',
            },{
                label: '奖项价值',
                value: 'prize_value',
            },
        ]
        exportData = JSONtoCSV(exportData, opts)
        exportData = iconvLite.encode(exportData, 'gbk')
        ctx.body = exportData
        // https://www.oschina.net/code/piece_full?code=58178
        var filename = encodeURIComponent((new Date().toISOString()).replace(/-|:|\..*$/ig, '').replace('T', '-') + '-中奖人员信息')
        ctx.set('content-type', 'text/csv; charset=utf-8')
        ctx.set('content-disposition', 'attachment; filename='+filename+'.csv')
    } catch (error) {
        console.error(error)
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
    add: winnerModel.add,
    del: winnerModel.del,
    get: winnerModel.get,
    edit: winnerModel.edit,
    exportCSV: exportCSV,
}