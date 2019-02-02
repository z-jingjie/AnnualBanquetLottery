'use strict'

const CurrentPlatform = process.platform
let uploadDirPath = 'uploads',
    logDirPath = 'logs'
switch (CurrentPlatform) {
    case 'darwin':  // MacOS
    case 'linux':   // Linux
        uploadDirPath = '/home/webdev/annual_lottery_data/uploads'
        logDirPath = '/home/webdev/annual_lottery_data/log'
        break;
    case 'win32':   // Win32
    case 'win64':   // Win64
    default:        // Unknown
        uploadDirPath = 'uploads'
        logDirPath = 'logs'
        break;
}

module.exports = {
    // host: '127.0.0.1',
    host: 'localhost',
    port: 8888,
    database: {
        type: 'nosql',
        solution: 'mongodb',
        dbname: 'annual_lottery',
        host: '127.0.0.1',
        port: 27017,
        username: '',
        password: '',
    },
    storage: {
        rootPath: uploadDirPath,
        keepExtensions: true,
        maxFieldsSize: 2 * 1024 * 1024,
    },
    log4js: {
        rootPath: logDirPath,
    },
}