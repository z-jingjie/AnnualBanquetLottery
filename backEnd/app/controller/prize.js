'use strict'

const fs = require('fs')
const iconvLite = require('iconv-lite')
const prizeModel = require('../models/prize')
const { JSONtoCSV, CSVtoJSON } = require('../asset/script/helpers')

// 导出查询数据为CSV文件(以供浏览器下载)
// https://stackoverflow.com/a/39896028/8406905
var exportCSV = async (ctx) => {
    let exportData = await prizeModel.exportCSV(ctx)

    try {
        var opts = [
            {
                label: '唯一ID',
                value: '_id',
            },{
                label: '奖项名称',
                value: 'prize_title',
            },{
                label: '奖项级别',
                value: 'prize_rank',
            },{
                label: '奖项价值',
                value: 'prize_value',
            },{
                label: '奖项简介',
                value: 'prize_desc',
            },{
                label: '奖项数量(转正员工)',
                value: 'regular_staff_prize_stock',
            },{
                label: '奖项余量(转正员工)',
                value: 'regular_staff_prize_remain',
            },{
                label: '奖项数量(嘉宾&非转正员工)',
                value: 'others_prize_stock',
            },{
                label: '奖项余量(嘉宾&非转正员工)',
                value: 'others_prize_remain',
            },{
                label: '创建时间',
                value: 'created_at',
            },
        ]
        exportData = JSONtoCSV(exportData, opts)
        exportData = iconvLite.encode(exportData, 'gbk')
        ctx.body = exportData
        // https://www.oschina.net/code/piece_full?code=58178
        var filename = encodeURIComponent((new Date().toISOString()).replace(/-|:|\..*$/ig, '').replace('T', '-') + '-奖项配置信息')
        ctx.set('content-type', 'text/csv; charset=utf-8')
        ctx.set('Content-disposition', 'attachment; filename='+filename+'.csv')
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

// 导入CSV文件为奖项配置信息(以供浏览器下载)
var importCSV = async (ctx) => {
    if (!ctx.request.files) {
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: '错误：CSV文件上传失败或CSV文件不存在',
            }
        }
        return
    }

    if (ctx.request.files.csv_file.type.indexOf('ms-excel') == -1) {
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了',
                msg: `错误：文件类型错误(${ctx.request.files.csv_file.type})，应为(application/vnd.ms-excel)即CSV文件`,
            }
        }
        return
    }

    var CSVFilePath = ctx.request.files.csv_file.path
    try {
        let fileData = fs.readFileSync(CSVFilePath)
        
        // 转换Windows系统中以GBK编码保存的CSV文件为JS字符串
        fileData = iconvLite.decode(fileData, 'gbk')

        // 对读取到的CSV文件内容，进行正则替换，消除多余双引号、空白符
        var CSVData = fileData.toString().replace(/(^\"|\"$|\r|\n$)/ig, '').replace(/\"?(\,|\n)\"?/ig, '$1')
        var importJSON = CSVtoJSON(CSVData)
        var importRes = await prizeModel.importCSV(importJSON)
        if (importRes.status) {
            ctx.body = {
                status: 1000,
                data: {
                    info: '上传成功',
                    detail: {
                        path: CSVFilePath,
                        content: importRes.content,
                        count: importRes.count
                    }
                }
            }
        } else {
            ctx.body = {
                status: 1001,
                data: {
                    info: '出错了',
                    msg: importRes.errMsg,
                }
            }
        }
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
    add: prizeModel.add,
    del: prizeModel.del,
    get: prizeModel.get,
    edit: prizeModel.edit,
    exportCSV: exportCSV,
    importCSV: importCSV,
}