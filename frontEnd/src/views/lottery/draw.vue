<template>
  <div class="draw-page">

    <div class="main-draw">
      <div class="main-draw-content">

        <div class="draw-base-info">
          <img :src="Logo" class="draw-logo">
          <h1 class="draw-title">2019年年会抽奖活动</h1>
        </div>
        <div class="draw-from-info">
          <div class="draw-user-type">
            <span :class="{'active':activeTab===1}" @click="activeTab=1">员工</span>
            <span :class="{'active':activeTab===2}" @click="activeTab=2">嘉宾</span>
          </div>
          <div v-show="activeTab===1" class="active-content">
            <div class="draw-from-item">

              <span class="input-label">姓名：</span>
              <input v-model="username" class="input-edit" type="text">

            </div>
            <div class="draw-from-item">

              <span class="input-label">手机：</span>
              <input v-model="mobile" class="input-edit" type="text" maxlength="11" @blur="blurInput">

            </div>
          </div>

          <div v-show="activeTab===2" class="active-content">
            <div class="draw-from-item">

              <span class="input-label">抽奖码：</span>
              <input v-model="lottery_code" class="input-edit draw-code" type="text" @blur="blurInput">

            </div>

          </div>

          <div>
            <button class="draw-btn" @click="draw">提交</button>
          </div>
          <p class="draw-tips" >
            <span v-if="activeTab===1"> 温馨提示：需准确填写个人信息</span>
            <span v-else>填写示例：ZUZUIT-MY2019</span>

          </p>
        </div>

      </div>
    </div>

    <div v-show="maskShow" class="mask-box">
      <div :class="{'shake-chunk':isShake}" class="draw-box">
        <div v-show="beforeGift" class="draw-img">
          <img :src="GiftBefore">
          <!--<i class="iconfont icon-guanbi gift-close-btn" @touchend.stop="closeGift"></i>-->
          <button :disabled="is_disabled" class="gift-draw-btn" @touchend.stop="takeOut">拆开它</button>
        </div>

        <div v-show="afterGift" class="draw-img draw-big-img">
          <img :src="Gift">
          <i class="iconfont icon-guanbi gift-close-btn" @touchend.stop="closeGift"/>
          <div class="gift-prize">{{ curr_prize_title }}</div>
          <!--<div class="gift-prize">{{ prize_list[curr_prize] }}</div>-->
          <button class="gift-draw-btn">请到兑奖处领奖</button>
          <!--<button class="gift-draw-btn">拆开它</button>-->
        </div>

      </div>
    </div>
    <div v-show="petalShow" id="petalbox" class="petalbox">

      <div class="ser_home">

        <ul id="red_packet" class="red_packet">

          <template v-for="(item, index) in liParams">

            <li :style="{ left: item.left, animationDuration: item.durTime, webkitAnimationDuration: item.durTime}" :data-index="index" :class="item.cls" @webkitAnimationEnd="removeDom" @click="takeOutBefore">
              <a href="javascript:;"><i :style="{ transform: item.transforms, webkitTransform: item.transforms}" class="hb-luck"/>
              </a>

            </li>

          </template>

        </ul>

      </div>

    </div>
  </div>

</template>
<script>
import Logo from '@/assets/lottery/img/logo.png'
import GiftBefore from '@/assets/lottery/img/gift_before.png'
import Gift from '@/assets/lottery/img/gift.png'
import '@/assets/lottery/css/csshake.min.css'
// import '@/assets/lottery/css/hb.css'
import { Alert, Toast } from 'vue-ydui/dist/lib.rem/dialog'
import 'vue-ydui/dist/ydui.flexible.js'
import 'vue-ydui/dist/ydui.rem.css'
import Velocity from 'velocity-animate'
import request from '@/utils/request'
import '@/assets/common/css/iconfont.css'
import { Debounce, Throttle } from '@/assets/lottery/js/untils.js'

export default {
  name: 'Draw',
  // components: { hb },
  data() {
    return {
      // hb:hb,
      Logo: Logo,
      GiftBefore: GiftBefore,
      Gift: Gift,
      maskShow: false,
      petalShow: false,
      activeTab: 1,
      beforeGift: false,
      afterGift: false,
      isShake: false,
      username: '',
      mobile: '',
      lottery_code: '',
      curr_prize_title: '请重新抽取',
      liParams: [],
      timer: null,
      duration: 30000, // 定义红包雨总时间
      next_interval: 200, // 定义下一个红包出现的间隔
      is_disabled: false

    }
  },
  mounted() {

  },
  created() {
    document.title = '2019年会抽奖活动'
  },
  methods: {
    blurInput() {
      window.scroll(0, 0)
    },

    join_api: Throttle(function() {
      const obj = {}

      if (this.activeTab === 2) {
        obj.is_guest = 1
        obj.lottery_code = this.lottery_code.trim()
      } else {
        obj.is_guest = 0
        obj.name = this.username.trim()
        obj.phone = this.mobile.trim()
        // obj.is_regular = 1
      }
      request({
        url: '/lottery/join',
        method: 'post',
        data: obj
      }).then((res) => {
        this.isShake = false
        if (res.data.status === 1000) {
          if (res.data.recorded) {
            Alert({
              mes: `您已抽中"${res.data.info.prize_title}"，感谢参与`
            })
          } else {
            // this.curr_prize = (Math.floor(Math.random() * 3)) + 1
            this.curr_prize_title = res.data.info.prize_title
            this.beforeGift = false
            this.afterGift = true
          }
        } else {
          Alert({
            mes: res.data.data.msg
          })
        }
      })
    }, 10000),

    startRedPacket() {
      const win = document.documentElement.clientWidth || document.body.clientWidth
      const left = parseInt(Math.random() * (win - 50) + 0)

      const rotate = (parseInt(Math.random() * (45 - (-45)) - 45)) + 'deg'  // 旋转角度
      const scales = 1// 图片尺寸
      // const scales = (Math.random() * (12 - 8 + 1) + 8) * 0.1  // 图片尺寸
      const durTime = (Math.random() * (2.5 - 1.2 + 1) + 1.2) + 's' // 时间  1.2和1.2这个数值保持一样

      this.liParams.push({
        left: left + 'px',
        cls: 'move_1',
        transforms: 'rotate(' + rotate + ') scale(' + scales + ')',
        durTime: durTime
      })

      setTimeout(() => {   // 多少时间结束
        this.stopRedPacket()
        return
      }, this.duration)

      this.timer = setTimeout(() => {
        this.startRedPacket()
      }, this.next_interval)
    },
    // 自动关闭红包雨
    AutoCloseRedPacket() {
      setTimeout(() => {   // 多少时间结束
        if (!this.beforeGift && !this.afterGift) {
          // this.closeGift()
          this.takeOutBefore()
        }
      }, this.duration + 3500)
    },
    stopRedPacket() {
      if (this.timer) {
        clearTimeout(this.timer)
      }
    },
    /**
                      * 回收dom节点
                      */
    removeDom(e) {
      const target = e.currentTarget
      document.querySelector('#red_packet').removeChild(target)
    },

    closeGift() {
      this.maskShow = false
      this.beforeGift = false
      this.afterGift = false
      this.petalShow = false
      this.stopRedPacket()
      this.liParams = []

      window.location.reload()
    },
    takeOut() {
      if (this.is_disabled) {
        return
      }
      this.is_disabled = true

      this.isShake = true

      setTimeout(() => {
        this.join_api()
      }, 1500)
    },

    takeOutBefore() {
      this.petalShow = false
      clearTimeout(this.timer)
      setTimeout(() => {
        this.beforeGift = true
      }, 500)
      const draw_img = document.querySelector('.draw-img')
      Velocity(draw_img, {
        // translateY: ['0px', '-200px'],
        // translateX: ['200px', '-100px'],
        scale: [1, 0]
        // backgroundColor: ['#222', '#043d99']
      }, {
        easing: 'swing',
        duration: '1000'
      })
    },

    draw() {
      if (this.activeTab === 1) {
        if (!this.username) {
          Toast({
            mes: '姓名不能为空',
            timeout: 1500,
            icon: 'error'
          })
          // Alert({
          //     mes: '姓名不能为空'
          // })
          return false
        }
        if (!this.mobile) {
          Toast({
            mes: '手机不能为空',
            timeout: 1500,
            icon: 'error'
          })
          return false
        }
        const reg = /^1[34578]\d{9}$/

        if (!reg.test(this.mobile)) {
          Toast({
            mes: '请输入有效的手机号码',
            timeout: 1500,
            icon: 'error'
          })
          return false
        }
      }
      if (this.activeTab === 2) {
        if (!this.lottery_code) {
          Toast({
            mes: '抽奖码不能为空',
            timeout: 1500,
            icon: 'error'
          })
          return false
        }
      }

      const obj = {}
      if (this.activeTab === 2) {
        obj.is_guest = 1
        obj.lottery_code = this.lottery_code.trim()
      } else {
        obj.is_guest = 0
        obj.name = this.username.trim()
        obj.phone = this.mobile.trim()
        obj.is_regular = 1
      }

      request({
        url: '/lottery/validate',
        method: 'post',
        data: obj
      }).then((res) => {
        switch (res.data.status) {
          case 1002:
            // if (res.data.recorded) { }
            Alert({ mes: `您已抽中"${res.data.info.prize_title}"，感谢参与` })
            break
          case 1001:
            Alert({ mes: res.data.data.msg })
            break
          case 1000:
          default:
            this.maskShow = true
            this.petalShow = true
            this.startRedPacket()
            this.AutoCloseRedPacket()
            break
        }
      })
    },

    rolling() {
    },

    stopRolling() {
      // clearInterval(this.ad_timer)
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    html, body {
        background: #fff;
    }

    html {
        font-size: 14px;
    }

    /*body {font-size: 1.4rem;}*/

    .main-draw {

        position: absolute;
        height: 100%;
        width: 100%;
        background: url("../../assets/lottery/img/wap_content_bg.jpg") no-repeat;
        background-size: 100% 100%;

        .main-draw-content {
            width: 80%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);

            .draw-base-info {
                text-align: center;
                img {
                    max-height: 1rem;
                }
                .draw-title {

                    font-size: .38rem;
                    color: #f6ca80;
                }
            }
            .draw-from-info {
                text-align: center;
                width: 90%;
                margin: 0 auto;
                .active-content {
                    height: 2.8rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    .draw-from-item {
                        background-color: #facd89;
                        margin: .2rem auto;
                        padding: .2rem 0 .2rem .15rem;
                        text-align: left;
                        border-radius: 4px;
                        display: flex;
                        flex-wrap: nowrap;
                        align-items: center;
                        .input-label {
                            color: #e20000;
                            font-weight: bolder;
                            word-break: keep-all;
                            white-space: nowrap;
                            font-size: 0.32rem;

                        }
                        input {
                            outline: none;
                        }

                        input::-webkit-input-placeholder {

                                      color: #dcdcdc;
                        }

                        .input-edit {
                            background-color: transparent;
                            color: #000;
                            font-size: .32rem;
                            border-width: 0;
                            border-top-style: none;
                            border-right-style: none;
                            border-left-style: none;
                            border-bottom-style: none;
                            overflow: hidden;
                            margin-top: .025rem;
                            vertical-align: center;
                        }
                        .draw-code {
                            width: 3.2rem;
                        }

                    }
                }
                .draw-user-type {
                    font-size: 0;
                    display: flex;
                    justify-content: center;
                    margin-bottom: .2rem;
                    span {
                        color: #facd89;
                        font-weight: bolder;
                        padding: .1rem .4rem;
                        font-size: .3rem;
                        border: 2px solid #facd89;
                        cursor: pointer;
                    }
                    .active {
                        color: #da0000;
                        background-color: #facd89;
                    }
                }

                .draw-btn {
                    width: 1.8rem;
                    height: .8rem;
                    background-color: #9b0404;
                    font-size: .36rem;
                    color: #facd89;
                    border: solid 1px #f2c768;
                    border-radius: 4px;
                }

                .draw-tips {
                    margin-top: .1875rem;
                    text-align: center;
                    color: #f6ca80;
                    font-size: .28rem;
                }

            }

        }

    }

    .mask-box {
        position: fixed;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        /*display: none;*/
        display: flex;
        justify-content: center;
        align-items: center;

        .draw-box {
            width: 100%;
            .draw-img {
                text-align: center;
                position: relative;
                img {
                    width: 80%;
                }
                .gift-close-btn{
                    position: absolute;
                    top: 15%;
                    right: 20%;
                    color: #ffffff;
                    font-size: .5rem;

                }
                .gift-draw-btn {
                    position: absolute;
                    bottom: 20%;
                    left: 50%;
                    background-color: #ffffff;
                    border-radius: 20px;
                    padding: .3rem 0;
                    border: none;
                    color: #de1c1d;
                    font-weight: bolder;
                    font-size: .32rem;
                    width: 3.75rem;
                    margin-left: -1.875rem;
                    outline: none;
                    text-align: center;
                }
                .gift-prize {
                    position: absolute;
                    top: 42%;
                    left: 51%;
                    font-size: .45rem;
                    padding: 0.1875rem 0;
                    border: none;
                    color: #E1B571;
                    font-weight: bolder;
                    width: 3.75rem;
                    margin-left: -1.875rem;
                    outline: none;
                    text-align: center;
                }
            }
            .draw-big-img {
                img {
                    width: 85%;

                }
            }

        }
    }

</style>
<style lang="scss" scoped>
    .petalbox {
        position: fixed;
        width: 100%;
        height: 100%;
    }
    .ser_home {
        width: 100%;
        height: 100%;
    }
    .red_packet {
        display: block;
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
    i {
        width: 54px;
        height: 72px;
        display: block;
        background: url('../../assets/lottery/img/red-packet.png') no-repeat;
    }
    li {
        position: absolute;
        animation: all 3s linear;
        top:-100px;
        z-index: 10;
        list-style-type :none;
    &.move_1 {
         -webkit-animation: aim_move 5s linear 1 forwards;
         animation: aim_move 5s linear 1 forwards;
     }
    }
    a {
        display: block;
    }
    }

    @keyframes aim_move {
        0% {
            -webkit-transform: translateY(0);
            transform: translateY(0);
        }
        100% {
            -webkit-transform: translateY(120vh);
            transform: translateY(120vh);
        }
    }

</style>
