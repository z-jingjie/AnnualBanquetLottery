<template>
  <div class="goods-stock-manage">
    <div class="goods-filter-panel">
      <el-form :inline="true" class="clearfix">

        <el-form-item label="姓名">
          <el-input v-model="searchForm.name"/>
        </el-form-item>

        <el-form-item label="手机">
          <el-input v-model="searchForm.phone"/>
        </el-form-item>

        <el-form-item label="抽奖码">
          <el-input v-model="searchForm.lottery_code"/>
        </el-form-item>

        <el-form-item label="奖项">
          <el-select v-model="searchForm.prize_title" placeholder="请选择奖项">
            <el-option
              v-for="item in prizes"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        

        <el-form-item>
          <el-button style="margin-left: 10px;" type="primary" @click="search">筛选
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="goods-type-row pos-r mg-b-10">

      <div class="goods-controll-panel pos-a">
        <!--<el-button style="margin-left: 10px;" type="primary" @click="showAddPanel">新增抽奖码</el-button>-->
        <el-button style="margin-left: 10px;" type="primary" @click="exportAllGoodsExcel">导出全部</el-button>
        <!--<el-button style="margin-left: 10px;" type="primary" @click="exportGoodsExcel">导出选择项</el-button>-->
        <!--<el-button style="margin-left: 10px;" type="primary" title="请导入.xlsx格式的表格" @click="importGoodsExcel">导入名单</el-button>-->
        <el-button style="margin-left: 10px;" type="primary" @click="deleteAll">一键清空</el-button>
      </div>

      <div class="bottom-controll-line mg-t-20">
        <div class="controll-line">
          <!--<button class="blue-btn btn-common-size" @click="setSaleStatus(1)">上架</button>-->
          <!--<button class="blue-btn btn-common-size" @click="setSaleStatus(0)">下架</button>-->
          <!--<button class="blue-btn btn-common-size" @click="setRentStatus(1)">可租</button>-->
          <!--<button class="blue-btn btn-common-size" @click="setRentStatus(2)">不可租</button>-->
        </div>
        <el-pagination
          :page-sizes="[10, 20, 50, 100]"
          :page-size="searchForm.paginate"
          :current-page="searchForm.page"
          :total="total_num"
          class="fr"
          background
          layout="total, sizes, prev, pager, next"
          @size-change="changeSize"
          @current-change="changePage"/>
      </div>
    </div>

    <div v-loading="goods_loading" class="goods-display-table">
      <el-row class="goods-table-head">
        <el-col :span="1">
          <el-checkbox v-model="sel_goods_all" @change="selAllGoods"/>
        </el-col>
        <el-col :span="3">
          <span class="table-head-txt">姓名</span>
        </el-col>
        <el-col :span="3">
          <span class="table-head-txt">手机</span>
        </el-col>
        <el-col :span="2">
          <span class="table-head-txt">是否正式员工</span>
        </el-col>
        <el-col :span="2">
          <span class="table-head-txt">是否嘉宾</span>
        </el-col>
        <el-col :span="3">
          <span class="table-head-txt">抽奖码</span>
        </el-col>
        <el-col :span="3">
          <span class="table-head-txt">奖项</span>
        </el-col>
        <el-col :span="3">
          <span class="table-head-txt">中奖时间</span>
        </el-col>
        <el-col :span="4">
          <span class="table-head-txt">操作</span>
        </el-col>
      </el-row>

      <el-row v-for="(goods, index) in goods_list" v-if="goods_list" :class="{active: goods.is_checked,edited:edit_list[goods.goods_id]}" :key="goods.goods_id" class="goods-table-item" type="flex">
        <el-col :span="1">
          <el-checkbox v-model="goods.is_checked" @change="selGoods($event, goods.goods_id)"/>
        </el-col>
        <el-col :span="3">
          <p class="table-item-txt goods-cat">{{ goods.name }}</p>
        </el-col>
        <el-col :span="3">
          <p class="table-item-txt goods-brand">{{ goods.phone }}</p>
        </el-col>
        <el-col :span="2">
          <p class="table-item-txt goods-brand">{{ goods.is_regular?'是':'否' }}</p>
        </el-col>
        <el-col :span="2">
          <p class="table-item-txt goods-brand">{{ goods.is_guest?'是':'否' }}</p>
        </el-col>
        <el-col :span="3">
          <p class="table-item-txt goods-brand">{{ goods.lottery_code }}</p>
        </el-col>
        <el-col :span="3">
          <p class="table-item-txt goods-brand">{{ goods.prize_title }}</p>
        </el-col>
        <el-col :span="3">
          <p class="table-item-txt goods-brand">{{ new Date(goods.created_at * 1000).toLocaleString() }}</p>
        </el-col>
        <el-col :span="4">
          <el-button size="mini" type="danger" @click="deleteCate(goods._id, index)">删除
          </el-button>
          <!--<span @click="edit(index)" class="goods-controll-btn">
                        <i class="eicon-xiugai"></i>编辑
                    </span>-->
        </el-col>
      </el-row>

      <p v-if="no_goods_find" class="no-table-content-warn">没有中奖人员记录</p>
    </div>

    <el-dialog
      :visible.sync="show"
      :title="show_title"
      width="660px"
      top="25vh">
      <!--<div slot="title" class="dialog-header">-->
      <!--<p class="dialog-title">{{ is_add ? '添加商品分类' : '编辑商品分类' }}</p>-->

      <!--<i class="eicon-guanbi dialog-close-btn" @click="hidePanel"/>-->
      <!--</div>-->

      <div class="edit-stock">
        <el-form ref="cate_info" :model="cate_info" :rules="cate_rules" class="cate-add-form" label-width="110px">
          <el-form-item label="抽奖码:" prop="user_name">
            <el-input v-model="cate_info.lottery_code"/>
          </el-form-item>

        </el-form>

        <div class="controll-row txt-center">
          <el-button style="margin-left: 10px;" type="primary" @click="submit">保存</el-button>
          <el-button style="margin-left: 10px;" type="primary" @click="hidePanel">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <input ref="upload" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv" style="display: none" @change="handleUpload">
  </div>
</template>

<script>
// import '@/assets/lottery/css/normalize.css'
import { quality_list } from '@/assets/lottery/js/data'
import request from '@/utils/request'
export default {
  data() {
    return {
      show: false,

      cate_info: {
        lottery_code: ''
      },

      cate_rules: {
        lottery_code: [
          { required: true, message: '请输入抽奖码', trigger: 'blur' }
        ]
      },

      is_add: true,
      selected_index: -1,
      quality_list,
      searchForm: {
        name: '',
        phone: '',
        lottery_code: '',
        prize_title: '',
        page: 1,
        paginate: 10
      },
      user_type_list: {
        0: '抽奖码',
        1: '嘉宾'
      },
      total_num: 0,

      prizes: [
        {
          value: '大奖入场券',
          label: '大奖入场券',
        }, {
          value: '五谷丰登奖',
          label: '五谷丰登奖',
        }, {
          value: '阳光普照奖',
          label: '阳光普照奖',
        }
      ],

      sel_goods_arr: [],
      sel_goods_all: false,

      goods_list: null,
      no_goods_find: true,
      goods_loading: false,

      showImportTips: false,
      showEditStock: false,
      edit_index: null,
      edit_loading: false,
      isdisabled: false,

      import_tips: {
        success_num: 0,
        fail_num: 0,
        goods_key: ''
      },

      brands: [],
      cats: [],
      edit_list: [],
      show_title: ''

    }
  },

  watch: {
    // edit_index(index) {
    //   const goods = this.goods_list[index]
    //
    //   if (!goods.price_info) {
    //     this.edit_loading = true
    //
    //     this.$http.get('/goods/get_goods_stock', {
    //       goods_id: goods.goods_id
    //     }).then((res) => {
    //       if (res.code === 0) {
    //         this.$set(this.goods_list[index], 'price_info', this.deepCopyObj(res.data))
    //         this.$set(this.goods_list[index], 'edit_price_info', this.deepCopyObj(res.data))
    //       } else {
    //         this.$message.error('参数出错，无法编辑库存')
    //         this.showEditStock = false
    //       }
    //
    //       this.edit_loading = false
    //     })
    //   }
    // },
    //
    // showEditStock(res) {
    //   if (!res) {
    //     const cur_index = this.edit_index
    //     this.goods_list[cur_index].edit_price_info = this.deepCopyObj(this.goods_list[cur_index].price_info)
    //   }
    // },
    //
    // sel_goods_arr(goods_list) {
    //   this.sel_goods_all = this.checkIfSelAll()
    // }
  },

  mounted() {
    this.getGoodsList()
    // this.getCatTree()
    // this.getBrandByCat()
  },

  methods: {
    // 显示添加商品分类的弹窗
    showAddPanel() {
      this.is_add = true
      this.show = true
      this.show_title = this.is_add ? '添加抽奖码' : '修改抽奖码'
      this.cate_info.lottery_code = ''
    },

    editCate(cate, index) {
      request({
        url: '/winner/get',
        method: 'get',
        param: { _id: cate._id }
      }).then((res) => {
        if (res.data.status === 1000) {
          this.cate_info.lottery_code = cate.lottery_code
          this.cate_info.created_at = res.data.info[0].created_at
          this.cate_info._id = cate._id
          // this.cate_info._id = cate._id;
          this.is_add = false
          this.show = true
          this.selected_index = index
        } else {
          this.$message.error(res.message)
        }
      })
    },

    deleteAll() {
      this.$confirm('确定要清空全部中奖名单吗', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/winner/del',
          method: 'post'
        }).then((res) => {
          if (res.data.status === 1000) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })

            this.getGoodsList()
          } else {
            this.$message.error(res.message)
          }
        })
      })
    },

    deleteCate(id, index) {
      const msg = `确定要删除此中奖纪录吗？`

      this.$confirm(msg, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request({
          url: '/winner/del',
          method: 'post',
          data: { _id: id }
        }).then((res) => {
          if (res.data.status === 1000) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })

            this.goods_list.splice(index, 1)
          } else {
            this.$message.error(res.message)
          }
        })
      })
    },

    submit() {
      this.$refs['cate_info'].validate((valid) => {
        if (valid) {
          const url = this.is_add ? '/winner/add' : '/winner/edit'

          const obj = {
            lottery_code: this.cate_info.lottery_code

          }

          if (!this.is_add) {
            obj._id = this.cate_info._id
            obj.created_at = this.cate_info.created_at
          }

          request({
            url: url,
            method: 'post',
            data: obj
          }).then((res) => {
            if (res.data.status === 1000) {
              this.$message({
                type: 'success',
                message: '操作成功'
              })
              if (this.is_add) {
                this.getGoodsList()
              } else {
                this.goods_list[this.selected_index].lottery_code = this.cate_info.lottery_code
              }

              this.show = false
              this.hidePanel()
            } else {
              this.$message.error(res.data.data.info)
            }
          })
        }
      })
    },

    // 隐藏弹窗
    hidePanel() {
      this.$refs['cate_info'].resetFields()
      this.show = false
    },
    search() {
      this.searchForm.page = 1
      this.getGoodsList()
    },

    edit(index) {
      this.edit_index = index
      this.showEditStock = true
    },

    switchGoods(flag) {
      const cur_index = this.edit_index
      const length = this.goods_list.length

      if (flag === 'prev' && cur_index <= 0) {
        this.$message.error('当前页已无上一条')
        return false
      }
      if (flag === 'next' && cur_index >= length - 1) {
        this.$message.error('当前页已无下一条')
        return false
      }

      flag === 'prev' ? this.edit_index-- : this.edit_index++
      this.goods_list[cur_index].edit_price_info = this.deepCopyObj(this.goods_list[cur_index].price_info)
    },

    arrangeGoods(goods_list) {
      if (!goods_list || goods_list.length === 0) return []

      goods_list.forEach((goods, index) => {
        goods_list[index].is_checked = this.sel_goods_arr.indexOf(goods._id) !== -1
      })

      return goods_list
    },

    getGoodsList() {
      this.no_goods_find = false
      this.goods_loading = true
      const data = {}
      if (this.searchForm.name) {
        data.name = this.searchForm.name
      }
      if (this.searchForm.phone) {
        data.phone = this.searchForm.phone
      }
      if (this.searchForm.lottery_code) {
        data.lottery_code = this.searchForm.lottery_code
      }
      if (this.searchForm.prize_title) {
        data.prize_title = this.searchForm.prize_title
      }

      if (this.searchForm.page) {
        data.page = this.searchForm.page
      }
      if (this.searchForm.paginate) {
        data.paginate = this.searchForm.paginate
      }
      request({
        url: '/winner/get',
        method: 'get',
        params: data
      }).then(res => {
        if (res.data.status === 1000) {
          this.goods_list = this.arrangeGoods(res.data.info)

          this.total_num = res.data.total

          /* 检查当前是否全选*/
          this.sel_goods_all = this.checkIfSelAll()
        } else {
          this.goods_list = null
          this.no_goods_find = true
          this.total_num = 0
        }

        this.goods_loading = false
      })
      // this.$http.get('/goods/goods_list', this.searchForm)
      //     .then((res) => {
      //         if(res.code===0&&!Array.isArray(res.data)) {
      //             this.goods_list = this.arrangeGoods(res.data.data)
      //             this.total_num = res.data.total
      //
      //             /*检查当前是否全选*/
      //             this.sel_goods_all = this.checkIfSelAll()
      //         } else if(res.code===0&&Array.isArray(res.data)) {
      //             this.no_goods_find = true
      //             this.goods_list = []
      //             this.total_num = 0
      //         } else {
      //             this.goods_list = null
      //             this.$message.error(res.message)
      //         }
      //
      //         this.goods_loading = false
      //     })
    },

    submitEdit() {
      const cur_index = this.edit_index
      const goods = this.goods_list[cur_index]
      const edit_price_info = this.goods_list[cur_index].edit_price_info
      const ajaxData = {
        goods_id: goods.goods_id,
        goods_name: goods.goods_name,
        goods_num: goods.edit_price_info.goods_num,
        shop_price: goods.edit_price_info.shop_price,
        shop_price_usd: goods.edit_price_info.shop_price_usd,
        cost_price: goods.edit_price_info.cost_price,
        market_price: goods.edit_price_info.market_price
      }

      this.edit_loading = true
      this.$http.post('/goods/edit_goods_stock', ajaxData)
        .then((res) => {
          if (res.code === 0) {
            // 将对应当前的状态设置为修改后的状态
            this.goods_list[cur_index].price_info = this.deepCopyObj(edit_price_info)
            this.goods_list[cur_index].goods_num = edit_price_info.goods_num
            this.goods_list[cur_index].shop_price = edit_price_info.shop_price
            this.goods_list[cur_index].shop_price_usd = edit_price_info.shop_price_usd
            if (this.goods_list[cur_index].activity_info) {
              this.goods_list[cur_index].activity_info.before_price = res.data.activity_info.before_price
              this.goods_list[cur_index].activity_info.price = res.data.activity_info.price
            }
            this.$message({
              type: 'success',
              message: res.message
            })
          } else {
            this.$message.error(res.message)
          }

          this.edit_loading = false
        })
      this.$set(this.edit_list, goods.goods_id, 1)
    },

    // 设置商品库存状态
    setStockStatus(status) {
      this.searchForm.is_sale = status
      this.searchForm.page = 1
      this.getGoodsList()
    },

    changeSize(size) {
      this.searchForm.paginate = size
      this.getGoodsList()
    },

    changePage(page) {
      this.searchForm.page = page
      this.getGoodsList()
    },

    selGoods(val, id) {
      const index = this.sel_goods_arr.indexOf(id)

      if (val) {
        if (index === -1) {
          this.sel_goods_arr.push(id)
        } else {
          return
        }
      } else {
        if (index === -1) {
          return
        } else {
          this.sel_goods_arr.splice(index, 1)
        }
      }
    },

    selAllGoods(val) {
      if (val) {
        this.goods_list.forEach((goods, index) => {
          this.goods_list[index].is_checked = true
          this.sel_goods_arr.push(goods.goods_id)
        })
      } else {
        this.goods_list.forEach((goods, index) => {
          let sel_index = 0
          sel_index = this.sel_goods_arr.indexOf(goods.goods_id)
          this.goods_list[index].is_checked = false
          this.sel_goods_arr.splice(sel_index, 1)
        })
      }
    },

    checkIfSelAll() {
      let res = true

      this.goods_list.forEach((goods) => {
        if (!goods.is_checked) {
          res = false
          return false
        }
      })

      return res
    },

    sendArrivalNotice() {
      this.$http.post('/goods_notice/send')
        .then((res) => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: res.message
            })
          } else {
            this.$message.error(res.message)
          }
        })
    },

    // 设置单个商品的商品状态
    setSingleSaleStatus(goods, status) {
      this.$http.post('/goods/goods_sale_status', {
        goods_id: [goods.goods_id],
        status: status
      }).then((res) => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '更改商品状态成功'
          })

          goods.is_sale = status
          if (!this.edit_list[goods.goods_id]) {
            this.$set(this.edit_list, goods.goods_id, 1)
          }
        } else {
          this.$message.error(res.message)
        }
      })
    },

    setSingleRentStatus(goods, status) {
      this.$http.post('/goods/goods_rent_status', {
        goods_id: [goods.goods_id],
        status: status
      }).then((res) => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '更改租赁资格成功'
          })

          goods.is_rentable = status
          if (!this.edit_list[goods.goods_id]) {
            this.$set(this.edit_list, goods.goods_id, 1)
          }
        } else {
          this.$message.error(res.message)
        }
      })
    },

    setSaleStatus(status) {
      if (this.sel_goods_arr.length === 0) {
        this.$message.error('请选中要操作的商品')
        return false
      }

      this.$http.post('/goods/goods_sale_status', {
        goods_id: this.sel_goods_arr,
        status: status
      }).then((res) => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '批量操作成功'
          })

          this.goods_list.forEach((goods, index) => {
            if (this.sel_goods_arr.indexOf(goods.goods_id) !== -1) {
              this.goods_list[index].is_sale = status
            }
          })
        } else {
          this.$message.error(res.message)
        }
      })
    },

    setRentStatus(status) {
      if (this.sel_goods_arr.length === 0) {
        this.$message.error('请选中要操作的商品')
        return false
      }

      this.$http.post('/goods/goods_rent_status', {
        goods_id: this.sel_goods_arr,
        status: status
      }).then((res) => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '批量操作成功'
          })

          this.goods_list.forEach((goods, index) => {
            if (this.sel_goods_arr.indexOf(goods.goods_id) !== -1) {
              this.goods_list[index].is_rentable = status
            }
          })
        } else {
          this.$message.error(res.message)
        }
      })
    },

    exportAllGoodsExcel() {
      location.href = '/2018annualparty/api/winner/export_csv'

      return
      request({
        url: '/winner/export_csv',
        method: 'get'
      }).then((res) => {
        if (res.data.status === 1000) {
          this.$message({
            type: 'success',
            message: '导出成功'
          })

          // this.goods_list.splice(index, 1)
        } else {
          // this.$message.error(res.message)
        }
      })
    },

    importGoodsExcel() {
      this.$refs.upload.click()
    },

    handleUpload(e) {
      const file = e.target.files[0]
      const formdata = new FormData()

      formdata.append('csv_file', file)
      // 启动loading
      // this.$store.commit('setPageLoading', true)
      request({
        url: '/winner/import_csv',
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then((res) => {
        if (res.data.status === 1000) {
          this.$message({
            type: 'success',
            message: '上传成功'
          })
          this.getGoodsList()
        } else {
          this.$message.error(res.message)
        }
        // 上传完清空文件，避免影响下次上传
        this.$refs.upload.value = ''
      })
    }

  }
}
</script>

<style rel="stylesheet/scss" lang="scss"  scoped>

    .dialog-header {
        position: relative;
        margin: -15px -15px -10px;
        background: #eeeeee;
        height: 58px;
        line-height: 58px;

        .dialog-title {
            color: #717171;
            font-size: 16px;
            padding-left: 20px;
            padding-right: 50px;
        }

        .dialog-close-btn {
            position: absolute;
            color: #707070;
            font-size: 24px;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
        }
    }

    .goods-display-table{
        .goods-table-item{
            .el-col{
                height: 80px;
            }
            .up-down-edit-price{
                height: 100%;
                width: 100%;
                .side-block{
                    float:left;
                    height: 50%;
                    margin: 0 auto;
                    width: 100%;
                    p{
                        line-height: 55px;
                    }

                }
                .bottom-line{
                    border-bottom: 1px solid #dcdcdc;
                }

            }
        }

        .act-goods-pic{
            position: relative;
            .act-img{
                position: absolute;
                top: 8px;
                left: 0;
            }
        }
        .shop-price-info{
            height: 100%;
            width: 100%;
            margin: 0px auto;
            p{
                line-height: 55px;
                &:first-of-type{
                    word-break: break-all;
                }
                &.bottom-line{
                    border-bottom: 1px solid #dcdcdc;
                }
            }

        }
    }

    .goods-filter-panel {
        padding: 20px 0 0 10px;
    }

    .dialog-header {
        position: relative;
        margin: -15px -15px -10px;
        background: #eeeeee;
        height: 58px;
        line-height: 58px;

        .dialog-title {
            color: #717171;
            font-size: 16px;
            padding-left: 20px;
            padding-right: 50px;
        }

        .dialog-close-btn {
            position: absolute;
            color: #707070;
            font-size: 24px;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
        }
    }

    .edit-stock {
        position: relative;
        min-height: 300px;

        .switch-btn {
            position: absolute;
            font-size: 46px;
            color: #107bcb;
            top: 40%;

            &.prev {
                left: 10px;
            }
            &.next {
                transform: rotate(180deg);
                right: 10px;
            }

            &.disabled {
                cursor: not-allowed;
                color: #cccccc;
            }
        }
    }

    .edit-stock-form {
        width: 55%;
        margin-left: 23%;

        .goods-name {
            line-height: 20px;
        }

        .info-line {
            display: flex;
            min-height: 30px;
            align-items: center;
            margin-bottom: 15px;
        }

        .info-label {
            width: 80px;
            padding-right: 10px;
            text-align: right;
            box-sizing: border-box;
        }

        .info-content {
            flex: 1;
            line-height: 20px;
        }

        .submit-line {
            margin-top: 40px;

            button:not(:last-of-type) {
                margin-right: 15px;
            }
        }
    }

    .edit-table-item {
        width: 100%;
        text-align: center;

        .edit-input {
            display: block;
            width: 100px;
            margin: 0 auto;

            &.num {
                width: 80px;
            }

            &.name {
                width: 100%;
            }
        }

        .edit-btn {
            margin-right: 0;
            padding: 0;

            &:first-of-type {
                margin-right: 5px;
            }
        }
    }

    .edited {
        color: #f47901 !important;
    }

    .pointer:hover {
        .table-item-txt {
            color: #107bcb;
        }
    }

    .goods-stock-manage .goods-display-table .table-item-txt.goods-name:not(.del) {
        color: #333333;

        &:hover {
            color: #107bcb;
        }
    }
</style>

<style rel="stylesheet/scss" lang="scss">
    @import "./assets/common";
</style>
