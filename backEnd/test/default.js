'use strict';

// https://automattic.github.io/monk/

const SystemConf = require('../config/system');
const Koa = require('koa');
// const bodyParser = require('koa-bodyparser');
const mongoDB = require('monk')(`${SystemConf.database.host}:${SystemConf.database.port}/${SystemConf.database.dbname}`)
// const mongoDB = require('monk')('user:pass@localhost:port/mydb')

const app = new Koa();

//自动解析参数
// app.use(bodyParser());

exports.listTest = async function (ctx) {
    const collection = mongoDB.get('candidate');
    await collection.find({}).then(candidateInfo => {
        mongoDB.close();
        ctx.body = {
            status: 1000,
            lists: candidateInfo
        };
    }).catch(() => {
        mongoDB.close();
        ctx.body = {
            status: 1001,
            data: {
                info: '出错了'
            }
        };
    });
}

exports.addUser = async (ctx) => {

    var userid = await getNextSequenceValue("userid").then(async (data) => {
        let postData = ctx.request.body;

        var user = new User({
            userid: data,
            nickname: postData.nickname,
            avatar: postData.avatar,
            phoneNumber: xss(postData.phoneNumber)
        })

        user = user.save()
    }).then(function () {
        ctx.body = {
            success: true
        }
    })

}