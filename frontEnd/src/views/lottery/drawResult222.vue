<template>
  <div class="draw-result-container">

      <div class="draw-logo">
          <img :src="Logo"/>
      </div>


    <div id="user-info-rolling-ad-wrap" class="user-info-table-content-wrap">
      <div id="user-info-rolling-ad" :class="{marquee_top:animate}" class="user-info-rolling-ad">
        <div v-for="info in winner_list" class="user-info-rolling-ad-item-wrap">
          <div class="user-info-rolling-ad-item">
            恭喜{{ info.name }}获得了{{ info.prize_title }}

          </div>
        </div>
      </div>
      <div id="user-info-rolling-ad2" class="user-info-rolling-ad"/>
    </div>

  </div>

</template>

<script>
   import Logo from '@/assets/lottery/img/logo.png'
   import request from '@/utils/request'

export default {
  name: 'DrawResult',
  data() {
    return {
      Logo: Logo,
      prize_list: {
        1: '大奖入场券',
        2: '五谷丰登奖',
        3: '阳光普照奖'
      },
        winner_list:[],
      winner_list2: [
        {
          name: '林增晖',
          prize: 1
        },
        {
          name: '方海明',
          prize: 2
        },
        {
          name: '苏斯灿',
          prize: 1
        },
        {
          name: '周公谨',
          prize: 2
        },
        {
          name: '张亮',
          prize: 1
        },
        {
          name: '勇哥',
          prize: 1
        },
        {
          name: '生哥',
          prize: 1
        },
        {
          name: '李梦仪',
          prize: 2
        },
        {
          name: '测试1',
          prize: 1
        },
        {
          name: '测试2',
          prize: 3
        },
        {
          name: '测试3',
          prize: 3
        },
        {
          name: '测试4',
          prize: 3
        },
        {
          name: '测试5',
          prize: 2
        },
        {
          name: '测试6',
          prize: 3
        },
        {
          name: '测试7',
          prize: 2
        },
        {
          name: '测试8',
          prize: 1
        },
        {
          name: '测试9',
          prize: 2
        },
        {
          name: '测试10',
          prize: 3
        },
        {
          name: '测试11',
          prize: 2
        },
        {
          name: '测试12',
          prize: 1
        },
        {
          name: '测试13',
          prize: 2
        },
        {
          name: '测试14',
          prize: 3
        },
        {
          name: '测试15',
          prize: 2
        },
        {
          name: '测试16',
          prize: 1
        },
        {
          name: '测试17',
          prize: 3
        },
        {
          name: '测试18',
          prize: 2
        },
        {
          name: '测试19',
          prize: 1
        },
        {
          name: '测试20',
          prize: 1
        }
      ],
      user_info_rolling_ad_wrap: null,
      user_info_rolling_ad: null,
      user_info_rolling_ad2: null,
      ad_timer: null,
      animate: false,
      total_num:0,
        is_first:true,
        is_first_success:true, //第一次获取数据成功
        page:1,
        paginate:10,
        //上一次请求的页数
        pre_page:0,
        last_index:0, //最后一个元素的下标
        tmp_winner_list:[],
        api_time:0,
        timer:null,

    }
  },
  mounted() {


      // clearInterval(this.ad_timer)
    // this.user_info_rolling_ad_wrap = document.getElementById('user-info-rolling-ad-wrap')
    // this.user_info_rolling_ad = document.getElementById('user-info-rolling-ad')
    // this.user_info_rolling_ad2 = document.getElementById('user-info-rolling-ad2')
    // this.user_info_rolling_ad2.innerHTML = this.user_info_rolling_ad.innerHTML

      this.getWinnerList()

  },
  created() {
    document.title = '2019年会抽奖结果展示页'


  },
  methods: {
    getWinnerList() {

        let data = {}
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
                let res_info = res.data.info
                //此次要添加的人
                let add_num = res.data.total-this.winner_list.length
                let total_page = Math.ceil(res.data.total/this.paginate);
                //如果刚好是当前页
                if(this.is_first_success){
                    this.last_index = res_info.length-1
                    // console.log(this.last_index)

                }

                if(add_num>0){
                    // clearInterval(this.timer)
                    if(res.data.page===this.pre_page){
                        this.tmp_winner_list = this.tmp_winner_list.concat(res_info.slice(res_info.length-add_num,res_info.length-1))

//                         let add_arr = res_info.slice(res_info.length-add_num,res_info.length-1);
// // 把arr2 变成一个适合splice的数组（包含splice前2个参数的数组）
//                         add_arr.unshift(this.last_index+1, 0);
//                         Array.prototype.splice.apply(this.tmp_winner_list, add_arr);
                        // console.log(arr1)

                        // console.log(222);
                        if(!this.is_first_success){
                            this.last_index += add_num
                        }
                    }else{
//                         let add_arr = res_info;
// // 把arr2 变成一个适合splice的数组（包含splice前2个参数的数组）
//                         add_arr.unshift(this.last_index+1, 0);
//                         Array.prototype.splice.apply(this.tmp_winner_list, add_arr);
                        this.tmp_winner_list = this.tmp_winner_list.concat(res_info)
                        // console.log(111);
                        // if(!this.is_first_success){
                        //     this.last_index += add_arr.length
                        // }



                    }

                    this.winner_list = this.tmp_winner_list
                    // this.timer =  setInterval(this.rolling, 1500)

                }

                if(this.is_first_success){
                    this.is_first_success = false;

                }

                // console.log(this.winner_list)
                if(this.page<total_page){
                    this.pre_page = this.page;
                    this.page++;

                }



            } else {

            }
            // console.log(this.last_index)
            if(this.is_first){
               this.timer =  setInterval(this.rolling, 1500)
                this.is_first = false
            }
            setTimeout(() => {
                this.getWinnerList()
            }, 4000)

        })
    },

    rolling() {
        console.log( this.last_index);
      this.animate = true

      setTimeout(() => {
        this.winner_list.push(this.winner_list[0])

        this.winner_list.push(this.winner_list[1])
          this.last_index+=2
          if(this.last_index>=this.winner_list.length){
              this.last_index-=this.winner_list.length
          }
          this.winner_list.shift()
          this.winner_list.shift()
        this.animate = false
      }, 500)
      // const self = this
      // this.ad_timer = setInterval(function() {
      //   if (self.user_info_rolling_ad2.offsetHeight - self.user_info_rolling_ad_wrap.scrollTop <= 0) {
      //     self.user_info_rolling_ad_wrap.scrollTop -= self.user_info_rolling_ad.offsetHeight ;
      //   } else {
      //     self.user_info_rolling_ad_wrap.scrollTop++
      //   }
      // }, 1200)
    },

    stopRolling() {
      // clearInterval(this.ad_timer)
    }

  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
    .marquee_top {
        transition: all 0.5s;
        margin-top: -47px
    }

    .draw-result-container {
        position: relative;
        height: 100%;
        background: url("../../assets/lottery/img/pc_content_bg.jpg") no-repeat;
        background-size: cover;
        background-position: center;
        .draw-logo{

            position: absolute;
            top: 8%;
            /*margin: 0 auto;*/
            width: 100%;
            text-align: center;
        }
        .user-info-table-content-wrap {
            overflow: hidden;
            height: 423px;
            width: 60%;
            margin: 0 auto;
            position: relative;
            top: 20%;

            .user-info-rolling-ad {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
            }

            .user-info-rolling-ad-item-wrap {
                width: 350px;
                padding-top: 9px;
                padding-bottom: 9px;
            }

            .user-info-rolling-ad-item {
                color: #F9CD68;
                font-size: 26px;

            }

            .user-info-rolling-item-name {
                color: #999;
                width: 110px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-right: 1px;
                padding-left: 4px;
            }

            .user-info-rolling-item-money {
                width: 60px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 18px;
                color: #f47901;
                padding-left: 1px;
            }
        }
    }

</style>
