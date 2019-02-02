<template>
  <div>
    <!-- <el-card class="box-card" style="margin:20px 32px;">
      <div slot="header" class="clearfix">
        <svg-icon icon-class="international" />
        <span style="margin-left:10px;">抽奖系统状态设置</span>
      </div>
      <div>
        <el-radio-group v-model="lang" size="small">
          <el-radio label="init" border>启动抽奖活动</el-radio>
          <el-radio label="pause" border>暂停抽奖活动</el-radio>
          <el-radio label="terminate" border>结束抽奖活动</el-radio>
          <el-radio label="reset" border>重置抽奖活动</el-radio>
        </el-radio-group>
        <el-tag style="margin-top:15px;display:block;" type="info">{{ $t('i18nView.note') }}</el-tag>
      </div>
    </el-card> -->

    <el-row :gutter="20" style="margin:50px;">
      <el-col :span="16" :xs="24">
        <h2>系统状态设置</h2>
        <div class="block">
          当前系统状态：{{ curSysStatus }}
          <el-button class="item-btn" size="small" type="default" @click="getSysInfo()">
            获取/更新抽奖系统状态信息
          </el-button>
        </div>

        <div class="block">
          <el-button
            v-for="statusDesc in statusData"
            :type="statusDesc.btnType"
            :key="statusDesc.code"
            class="item-btn"
            size="small"
            @click="setStatus(statusDesc.code)"
          >
            {{ statusDesc.name }}
          </el-button>
        </div>

        <!-- <div class="block">
          <el-date-picker v-model="date" placeholder="时间选择" type="date"/>
          <el-select v-model="value" placeholder="shenmegui">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"/>
          </el-select>
        </div> -->
      </el-col>

      <el-col :span="8" :xs="24">
        <h2>系统状态注释</h2>
        <el-table
          :data="statusData"
          fit
          highlight-current-row
          border
          style="width: 100%"
        >
          <el-table-column label="状态名称" prop="name" width="110" align="center"/>
          <el-table-column label="状态标识码" prop="code" width="100" align="center"/>
          <el-table-column label="状态简述" prop="description"/>
        </el-table>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin:50px;">
      <el-col :span="16" :xs="24">
        <h2 style="display: inline-block; margin-right: 10px;">当前系统日志查看 ({{curDate}})</h2>
        <el-button type="primary" plain @click="toggleLogTab" v-show="showGetLogBtn">获取</el-button>

        <el-tabs v-model="activeLogTab" type="border-card" @tab-click="toggleLogTab">
          <el-tab-pane
            lazy
            :label="key+'日志'"
            :name="key"
            v-for="(log, key, index) in sysLog"
            :key="index"
          >
            <el-input type="textarea" v-model="sysLog[key]" rows="25"></el-input>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <el-col :span="8" :xs="24">
        <h2>日志等级注释</h2>
        <el-table
          :data="logLevelNote"
          fit
          highlight-current-row
          border
        >
          <el-table-column label="日志级别" prop="level" width="110" align="center"/>
          <el-table-column label="简述" prop="description"/>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'SystemManage',
  data() {
    return {
      curDate: 'N/A',
      showGetLogBtn: true,
      curSysStatus: undefined,
      curSysInfo: null,
      statusData: null,
      activeLogTab: 'all',
      sysLog: {
        all: '所有日志',
        trace: 'Trace日志',
        debug: 'Debug日志',
        info: 'Info日志',
        warn: 'Warn日志',
        error: 'Error日志',
        fatal: 'Fatal日志',
        mark: 'Mark日志',
      },
      logLevelNote: [
        {
        level: 'ALL',
        description: '所有级别，包括定制级别。',
        }, {
        level: 'TRACE',
        description: '比DEBUG级别的粒度更细。',
        }, {
        level: 'DEBUG',
        description: '指明细致的事件信息，对调试应用最有用。',
        }, {
        level: 'INFO',
        description: '指明描述信息，从粗粒度上描述了应用运行过程。',
        }, {
        level: 'WARN',
        description: '指明潜在的有害状况。',
        }, {
        level: 'ERROR',
        description: '指明错误事件，但应用可能还能继续运行。',
        }, {
        level: 'FATAL',
        description: '指明非常严重的错误事件，可能会导致应用终止执行。',
        }, {
        level: 'MARK',
        description: '不要问我，我也不知道，反正级别挺高的。',
        }, {
        level: 'OFF',
        description: '最高级别，用于关闭日志。',
        }, 
      ]
      // date: '',
      // value: '',
      // options: [],
    }
  },
  // computed: {
  //   lang: {
  //     get() {
  //       return this.$store.state.app.language
  //     },
  //     set(lang) {
  //       this.$i18n.locale = lang
  //       this.$store.dispatch('setLanguage', lang)
  //     }
  //   }
  // },
  watch: {
    curSysInfo() {
      this.statusData.forEach((ele) => {
        if (ele.code == this.curSysInfo.statusCode) {
          this.curSysStatus = ele.name
        }
      })
    }
  },
  mounted() {
    this.getSysInfo()
    this.getCurDateString()
  },
  methods: {
    // 获取当前时间的数字时间字符串
    getCurDateString(length = 8) {
      let datetime = new Date(),
          curFullYear = datetime.getFullYear(),
          curMonth = (datetime.getMonth() + 1 < 10) ? ('0' + (datetime.getMonth() + 1)) : (datetime.getMonth() + 1),
          curDate = datetime.getDate()
      length = (length > 8 || length <= 0) ? 8 : length
      this.curDate = (curFullYear + curMonth + curDate + '').substr(0, length)
    },

    // 获取系统信息
    getSysInfo(statusCode) {
      request({
        url: '/lottery/overview',
        method: 'get'
      }).then((res) => {
        if (res.data.status === 1000) {
          this.curSysInfo = res.data.info
          this.statusData = this.curSysInfo.statusData
          this.statusData.forEach((ele) => {
            if (ele.code == this.curSysInfo.statusCode) {
              this.curSysStatus = ele.name
            }
          })
          this.$message({
            type: 'success',
            message: '获取/更新系统信息成功'
          })
        } else {
          this.$message.error(res.data.data.msg)
        }
      }).catch((error) => {
        this.$message.error(error)
      })
    },

    // 更改系统状态
    setStatus(statusCode) {
      const msg = `确定要更改抽奖系统状态吗？`
      this.$confirm(msg, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/lottery/control',
          method: 'post',
          data: { status: statusCode }
        }).then((res) => {
          if (res.data.status === 1000) {
            this.$message({
              type: 'success',
              message: res.data.info
            })
            this.getSysInfo()
          } else {
            this.$message.error(res.data.data.msg)
          }
          // this.show = false
        }).catch((error) => {
          this.$message.error(error)
        })
      }).catch((error) => {})
    },

    // 获取系统日志
    toggleLogTab(tab, event) {
      request({
        url: '/system/log',
        method: 'get',
        params: { logType: this.activeLogTab }  // logDate: '20190116'
      }).then((res) => {
        if (res.data.status === 1000) {
          this.$message({
            type: 'success',
            message: `查询${this.activeLogTab}日志成功`
          })
          // let EOL = process.platform === 'win32' ? '\r\n' : '\n'
          this.showGetLogBtn = false
          this.sysLog[this.activeLogTab] = res.data.info.replace(/\r\n/g,'\n')
        } else {
          this.$message.error(res.data.data.msg)
        }
      }).catch((error) => {
        this.$message.error(error)
      })
    },
  }
}
</script>

<style scoped>
.box-card {
  width: 600px;
  max-width: 100%;
  margin: 20px auto;
}

.item-btn {
  margin: 10px px;
}

.block {
  padding: 15px;
}
</style>
<style>
.el-textarea__inner {
  background-color: #000 !important;
  color: #fff !important;
}
</style>
