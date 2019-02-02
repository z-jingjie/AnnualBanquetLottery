'use strict'

const candidateModel = require('../models/candidate')

module.exports = {
    add: candidateModel.add,
    del: candidateModel.del,
    get: candidateModel.get,
    edit: candidateModel.edit,
}