<template>
  <div class="draw-result-container">

    <div class="draw-logo">
      <!-- <img :src="Logo"> -->
      <div class="user-info-title">中奖名单</div>
    </div>

    <div id="user-info-rolling-ad-wrap" class="user-info-table-content-wrap" >
      <div id="user-info-rolling-ad" class="user-info-rolling-ad">
        <!-- <div class="user-info-title">中奖名单</div> -->
        <div class="user-content">
          <div v-for="info in winner_list" class="user-info-rolling-ad-item-wrap">
            <div v-if="!info.is_guest" class="user-info-rolling-ad-item">
              恭喜<span :class="{'suojin':info.name.length===2,'text-justify':info.name.length===3}" class="user-info-name">{{ info.name }}</span>获得<span class="user-info-prize">{{ info.prize_title }}</span>
            </div>
            <div v-else class="user-info-rolling-ad-item">
              恭喜<span class="user-info-name">{{ info.lottery_code.replace('ZUZUIT-','') }}</span>获得<span class="user-info-prize">{{ info.prize_title }}</span>
            </div>

          </div>
        </div>
      </div>
      <div v-show="secondBlock" id="user-info-rolling-ad2" class="user-info-rolling-ad">
        <!-- <div class="user-info-title">中奖名单</div> -->
        <div class="user-content">
          <div v-for="info in second_winner" class="user-info-rolling-ad-item-wrap">
            <div v-if="!info.is_guest" class="user-info-rolling-ad-item">
              恭喜<span :class="{'suojin':info.name.length===2,'text-justify':info.name.length===3}" class="user-info-name">{{ info.name }}</span>获得<span class="user-info-prize">{{ info.prize_title }}</span>
            </div>
            <div v-else class="user-info-rolling-ad-item">
              恭喜<span class="user-info-name">{{ info.lottery_code.replace('ZUZUIT-','') }}</span>获得<span class="user-info-prize">{{ info.prize_title }}</span>
            </div>

          </div>
        </div>

      </div>
    </div>

    <div class="draw-code">
      <div class="draw-code-content">
        <img :src="QrCode">
        <div>扫一扫，有惊喜</div>
      </div>

    </div>

  </div>

</template>

<script>
import Logo from '@/assets/lottery/img/logo.png'
import QrCode from '@/assets/lottery/img/qr_code.jpg'
import request from '@/utils/request'

export default {
  name: 'DrawResult',
  data() {
    return {
      Logo: Logo,
      QrCode: QrCode,
      prize_list: {
        1: '大奖入场券',
        2: '五谷丰登奖',
        3: '阳光普照奖'
      },
      winner_list: [],
      user_info_rolling_ad_wrap: null,
      user_info_rolling_ad: null,
      user_info_rolling_ad2: null,
      ad_timer: null,
      animate: false,
      total_num: 0,
      is_first: true,
      is_first_success: true, // 第一次获取数据成功
      page: 1,
      paginate: 200,
      // 上一次请求的页数
      pre_page: 0,
      total_page: 0,
      last_index: 0, // 最后一个元素的下标
      tmp_winner_list: [],
      api_time: 0,
      timer: null,
      secondBlock: false,
      second_winner: []

    }
  },
  watch: {
    'winner_list': {
      handler: function(newValue, oldValue) {
        clearInterval(this.ad_timer)
        this.second_winner = newValue
        this.user_info_rolling_ad_wrap = document.getElementById('user-info-rolling-ad-wrap')
        this.user_info_rolling_ad = document.getElementById('user-info-rolling-ad')
        this.user_info_rolling_ad2 = document.getElementById('user-info-rolling-ad2')
        this.rolling()
        if (newValue.length >= 16) {
          this.secondBlock = true
        }
      },
      deep: true
    }
  },
  mounted() {
    this.getWinnerList()
  },
  created() {
    document.title = '2019年会抽奖结果展示页'
  },
  methods: {
    getWinnerList() {
      const data = {}
      data.sort = 'asc'
      data.page = this.page
      data.paginate = this.paginate
      request({
        url: '/winner/get',
        method: 'get',
        params: data
      }).then(res => {
        if (res.data.status === 1000) {

          // this.winner_list = res.data.info
          const res_info = res.data.info
          // 此次要添加的人
          const add_num = res.data.total - this.winner_list.length
          const total_page = Math.ceil(res.data.total / this.paginate)
          this.total_page = total_page

          if (add_num > 0) {
             const add_arr = res_info.slice(res_info.length - add_num, res_info.length)
              this.tmp_winner_list = this.tmp_winner_list.concat(add_arr)
               this.winner_list = this.tmp_winner_list



            // if (res.data.page === this.total_page) {
            //   const add_arr = res_info.slice(res_info.length - add_num, res_info.length)
            //   this.tmp_winner_list = this.tmp_winner_list.concat(add_arr)
            // } else {
            //   // if (res_info.length % this.paginate === 0 && !this.is_first_success) {
            //   //   // let add_arr = res_info.slice(res_info.length-add_num,res_info.length);
            //   //   // this.tmp_winner_list = this.tmp_winner_list.concat(add_arr)
            //   // } else {
            //   this.tmp_winner_list = this.tmp_winner_list.concat(res_info)
            //   // }
            // }

            // this.winner_list = this.tmp_winner_list
          }
            // this.tmp_winner_list = res_info
            // this.winner_list = this.tmp_winner_list

          // if (this.is_first_success) {
          //   this.is_first_success = false
          // }

          // if (this.page < total_page) {
          //   this.pre_page = this.page
          //   this.page++
          // } else if (this.page === total_page && res_info.length === this.paginate) {
          //   this.page++
          // }
        } else {

        }
        // console.log(this.last_index)
        if (this.is_first) {
          this.is_first = false
        }

        setTimeout(() => {
          this.getWinnerList()
        }, 3000)
      })
    },

    rolling() {
      const self = this
      this.ad_timer = setInterval(function() {
        if (self.user_info_rolling_ad2.offsetHeight - self.user_info_rolling_ad_wrap.scrollTop <= 0) {
          self.user_info_rolling_ad_wrap.scrollTop -= (self.user_info_rolling_ad.offsetHeight)
        } else {
          self.user_info_rolling_ad_wrap.scrollTop++
        }
      }, 100)
    },

    stopRolling() {
      clearInterval(this.ad_timer)
    }

  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .marquee_top {
        transition: all 0.5s;
        margin-top: -47px
    }

    .text-justify{
        text-align: justify !important;
        text-align-last: justify !important;
        padding:0 12px !important;
    }
    .suojin{
      text-align: center !important;
    text-align-last: center !important;
    letter-spacing: 17px;
    padding-left: 22px !important;
    }
    .draw-result-container {
        position: relative;
        height: 100%;
        background: url("../../assets/lottery/img/pc_content_bg.jpg") no-repeat;
        background-size: cover;
        background-position: center;
        .draw-logo{

            position: absolute;
            top: 7%;
            /*margin: 0 auto;*/
            width: 100%;
            text-align: center;
        }
         .user-info-title{
                    text-align: center;

                    color: #FACD89;
                    height: 50px;
                    font-size: 32px;
                    font-weight: bolder;
                    padding-bottom: 8px;
                    padding-top: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    letter-spacing: 8px;

                }

        .draw-code{
            /*display: flex;*/
            position: absolute;
            right: 5%;
            bottom: 15%;
            .draw-code-content{
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                img{
                    width: 80%;
                }
                div{
                    text-align: center;
                    padding-top: 8px;
                    font-size: 22px;
                    font-weight: bolder;
                    color: #F9CD68;
                }
            }

        }
        .user-info-table-content-wrap {
            overflow: hidden;
            /*height: 345px;*/
            /*height: 392px;*/
            /*height: 512px;*/
            height: 462px;
            /*height: 600px;*/
            width: 920px;

            margin: 0 auto;
            position: relative;
            top: 20%;

            /*padding-bottom: 18px;*/
            .user-info-rolling-ad {

                .user-info-title{
                    text-align: center;

                    color: #FACD89;
                    height: 50px;
                    font-size: 28px;
                    font-weight: bolder;
                    padding-bottom: 8px;
                    padding-top: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left:-25px;
                }
                .user-content{
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    padding-bottom: 150px;
                    /*padding-top: 40px;*/

                }
            }
            /*.user-info-rolling-ad2 {*/
                /*display: flex;*/
                /*flex-wrap: wrap;*/
                /*justify-content: space-between;*/
            /*}*/

            .user-info-rolling-ad-item-wrap {
                width: 460px;
                /*padding-top: 9px;*/
                /*padding-bottom: 9px;*/
                display: flex;
                align-items: center;
                justify-content: center;
                height: 53px;
            }

            .user-info-rolling-ad-item {

                color:#F3A658;
                font-size: 26px;
                display: flex;
                align-items: center;
                .user-info-name{
                    padding: 0 7px;
                    color: #F9CD68;
                    font-size: 28px;
                    font-weight: bolder;
                    width:140px;
                    display: inline-block;
                    text-align: center;

                }
                .user-info-prize{
                    padding: 0 7px;
                    color: #F9CD68;
                    /*font-size: 26px;*/
                    /*font-weight: bolder;*/
                }
            }

        }

    }

    @media (max-width: 1440px){
      .draw-result-container {

           .draw-logo{

            top: 6%;

        }
         .user-info-title{
                    height: 50px;
                    font-size: 30px;
                    padding-bottom: 8px;
                    padding-top: 5px;
                    letter-spacing: 8px;
                }

        .draw-code{
            right: 3%;
            bottom: 15%;
            .draw-code-content{
                img{
                    width: 70%;
                }
                div{
                    padding-top: 8px;
                    font-size: 20px;
                }
            }
        }
        .user-info-table-content-wrap {
            height: 462px;
            width: 720px;
            top: 20%;
            .user-info-rolling-ad {
                .user-info-title{
                    height: 50px;
                    font-size: 28px;
                    padding-bottom: 8px;
                    margin-left:-25px;
                }
                .user-content{
                    padding-bottom: 150px;

                }
            }

            .user-info-rolling-ad-item-wrap {
                width: 360px;
                height: 47px;
            }

            .user-info-rolling-ad-item {

                font-size: 22px;
                .user-info-name{
                    padding: 0 11px;
                    font-size: 24px;
                    width:128px;

                }
                .user-info-prize{
                    padding: 0 5px;

                }
            }

        }

    }

}

 @media (min-width: 1920px){
   .text-justify{
        text-align: justify !important;
        text-align-last: justify !important;
        padding:0 16px !important;
    }
      .draw-result-container {

           .draw-logo{

            top: 8%;

        }
         .user-info-title{
                    height: 50px;
                    font-size: 34px;
                    padding-bottom: 8px;
                    padding-top: 5px;
                    letter-spacing: 8px;
                }

        .draw-code{
            right: 3%;
            bottom: 15%;
            .draw-code-content{
                img{
                    width: 90%;
                }
                div{
                    padding-top: 8px;
                    font-size: 24px;
                }
            }
        }
        .user-info-table-content-wrap {
            height: 470px;
            width: 1150px;
            top: 20%;
            .user-info-rolling-ad {
                .user-info-title{
                    height: 50px;
                    font-size: 28px;
                    padding-bottom: 8px;
                    margin-left:-25px;
                }
                .user-content{
                    padding-bottom: 150px;

                }
            }

            .user-info-rolling-ad-item-wrap {
                width: 555px;
                height: 60px;
            }

            .user-info-rolling-ad-item {

                font-size: 30px;
                .user-info-name{
                    padding: 0 14px;
                    font-size: 32px;
                    width:170px;

                }
                .user-info-prize{
                    padding: 0 5px;

                }
            }

        }

    }

}

</style>
