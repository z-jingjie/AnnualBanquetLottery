// http://pm2.keymetrics.io/docs/
// https://stackoverflow.com/questions/27690980/how-to-pass-node-v8-args-and-script-args-to-pm2
module.exports = {
    apps: [{
        name: 'annual_lottery_2018',
        script: 'index.js',
        // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
        args: '--inspect',
        // http://pm2.keymetrics.io/docs/usage/cluster-mode/
        // https://stackoverflow.com/questions/34682035/cluster-and-fork-mode-difference-in-pm2
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        watch: false,
        max_memory_restart: '512M',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }],

    // pm2 deploy ecosystem.config.js production setup 初始化项目
    // export NVM_DIR="$HOME/.nvm"
    // [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    // pm2 deploy ecosystem.config.js production revert 1回滚到上一个版本
    deploy: {
        production: {
            user: '用户名',
            host: '服务器IP',
            ref: 'origin/master', // 分支名
            repo: 'git@github.com:repo.git', // 仓库地址
            path: '/var/www/production',
            'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
        }
    }
};