'use strict'

const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
//自动解析参数
app.use(bodyParser());

require('../models/user')
require('../models/counter')

var xss = require('xss')
var mongoose = require('mongoose')
mongoose.connect('mongodb://root:root1234@localhost:27017/test?authSource=admin')

var User = mongoose.model('User')
var Counter = mongoose.model('Counter')

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

exports.delete = async (ctx) => {
    let postData = ctx.request.body;
    let id = postData.userid

    let flag
    await User.remove({
        userid: id
    }, function (err) {
        console.log(err)
        if (err) {
            flag = false
        } else {
            flag = true
        }

    });
    ctx.body = {
        success: flag
    }
}

exports.edit = async (ctx) => {
    let postData = ctx.request.body;
    let id = postData.userid
    let user = await User.update({
        userid: id
    }, {
        $set: {
            nickname: 1231
        }
    })
    ctx.body = {
        success: user
    }
}

exports.findAll = async (ctx) => {
    let user = await User.find()
    ctx.body = {
        success: user
    }
}

function getNextSequenceValue(sequenceName) {
    return new Promise((resolve, reject) => {
        var sequenceDocument = Counter.findOneAndUpdate(
            sequenceName, {
                $inc: {
                    sequence_value: 1
                }
            },
        ).exec(function (err, data) {
            resolve(data.sequence_value);
        });
    })
}