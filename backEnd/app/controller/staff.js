'use strict'

const fs = require('fs')
const iconvLite = require('iconv-lite')
const staffModel = require('../models/staff')
const { JSONtoCSV, CSVtoJSON } = require('../asset/script/helpers')

// 导出查询数据为CSV文件(以供浏览器下载)
// https://stackoverflow.com/a/39896028/8406905
var exportCSV = async (ctx) => {
    let exportData = await staffModel.exportCSV(ctx)

    try {
        var opts = [
            {
                label: '唯一ID',
                value: '_id',
            },{
                label: '姓名',
                value: 'name',
            },{
                label: '手机号码',
                value: 'phone',
            },{
                label: '是否嘉宾',
                value: 'is_guest',
            },{
                label: '是否转正',
                value: 'is_regular',
            },
        ]
        exportData = JSONtoCSV(exportData, opts)
        exportData = iconvLite.encode(exportData, 'gbk')
        ctx.body = exportData
        // https://www.oschina.net/code/piece_full?code=58178
        var filename = encodeURIComponent((new Date().toISOString()).replace(/-|:|\..*$/ig, '').replace('T', '-') + '-公司员工信息')
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

// 导入CSV文件为公司员工信息(以供浏览器下载)
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
                msg: `错误：文件类型错误(${ctx.request.files.csv_file.type})，应为(application/vnd.ms-excel)`,
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
        var importRes = await staffModel.importCSV(importJSON)
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
    add: staffModel.add,
    del: staffModel.del,
    get: staffModel.get,
    edit: staffModel.edit,
    exportCSV: exportCSV,
    importCSV: importCSV,
}