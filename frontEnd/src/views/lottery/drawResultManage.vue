<template>
  <div class="goods-stock-manage">
    <div class="goods-filter-panel">
      <el-form :inline="true" class="clearfix">

        <el-form-item label="商品名称">
          <el-input v-model="searchForm.goods_name"/>
        </el-form-item>

        <el-form-item label="分类" class="small-width">
          <el-select v-model="searchForm.cat_id" placeholder="不限" clearable>
            <el-option
              v-for="cat in cats"
              :key="cat.id"
              :label="cat.cat_name"
              :value="cat.id"
              :disabled="cat.id===15"/>
          </el-select>
        </el-form-item>

        <el-form-item label="品牌" class="small-width">
          <el-select v-model="searchForm.brand_id" placeholder="不限" clearable>
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.brand_name"
              :value="brand.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="品质" class="small-width">
          <el-select v-model="searchForm.quality" placeholder="不限" clearable>
            <el-option v-for="(quality, type) in quality_list" :label="type" :value="type" :key="type"/>
          </el-select>
        </el-form-item>

        <el-form-item>
          <!--<button type="button" class="blue-btn btn-common-size" @click="search">筛选</button>-->
          <el-button style="margin-left: 10px;" type="primary" @click="search">筛选
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="goods-type-row pos-r mg-b-10">
      <!--<ul class="common-type-tab">-->
      <!--<li class="common-type-item" :class="{select:searchForm.is_sale===''}" @click="setStockStatus('')">全部</li>-->
      <!--<li class="common-type-item" :class="{select:searchForm.is_sale===1}" @click="setStockStatus(1)">上架</li>-->
      <!--<li class="common-type-item" :class="{select:searchForm.is_sale===0}" @click="setStockStatus(0)">下架</li>-->
      <!--<li class="common-type-item" :class="{select:searchForm.is_sale===2}" @click="setStockStatus(2)">缺货</li>-->
      <!--</ul>-->

      <div class="goods-controll-panel pos-a">
        <!--<button class="blue-btn btn-common-size mg-r-5" title="将发送到货通知邮件给用户" @click="sendArrivalNotice">到货通知</button>-->
        <!--<el-button style="margin-left: 10px;" type="primary" title="将发送到货通知邮件给用户" @click="sendArrivalNotice">到货通知</el-button>-->
        <!--<el-dropdown class="mg-r-5">-->
        <!--<button class="blue-btn btn-common-size">导出<i class="el-icon-arrow-down mg-l-5"></i></button>-->
        <!--&lt;!&ndash;<el-button style="margin-left: 10px;" type="primary"  @click="importGoodsExcel">导出</el-button>&ndash;&gt;-->
        <!--<el-dropdown-menu slot="dropdown">-->
        <!--<el-dropdown-item @click.native="exportAllGoodsExcel">导出全部</el-dropdown-item>-->
        <!--<el-dropdown-item @click.native="exportGoodsExcel">导出选择项</el-dropdown-item>-->
        <!--</el-dropdown-menu>-->
        <!--</el-dropdown>-->
        <!--<button class="blue-btn btn-common-size" @click="importGoodsExcel" title="请导入.xlsx格式的表格">导入</button>-->
        <el-button style="margin-left: 10px;" type="primary" @click="exportAllGoodsExcel">导出全部</el-button>
        <el-button style="margin-left: 10px;" type="primary" @click="exportGoodsExcel">导出选择项</el-button>
        <el-button style="margin-left: 10px;" type="primary" title="请导入.xlsx格式的表格" @click="importGoodsExcel">导入</el-button>
      </div>
    </div>

    <div v-loading="goods_loading" class="goods-display-table">
      <el-row class="goods-table-head">
        <el-col :span="1">
          <el-checkbox v-model="sel_goods_all" @change="selAllGoods"/>
        </el-col>
        <el-col :span="2">
          <span class="table-head-txt">图片</span>
        </el-col>
        <el-col :span="5">
          <span class="table-head-txt">商品名称</span>
        </el-col>
        <el-col :span="2">
          <span class="table-head-txt">分类/品牌</span>
        </el-col>
        <el-col :span="2">
          <span class="table-head-txt">品质</span>
        </el-col>
        <el-col :span="2">
          <p class="table-head-txt">人民币售价/美元销售价</p>
        </el-col>
        <el-col :span="2">
          <p class="table-head-txt">折后价/折前价</p>
        </el-col>

        <el-col :span="2">
          <span class="table-head-txt">库存</span>
        </el-col>
        <el-col :span="1">
          <span class="table-head-txt">商品状态</span>
        </el-col>
        <el-col :span="1">
          <span class="table-head-txt">租赁资格</span>
        </el-col>
        <el-col :span="2">
          <span class="table-head-txt">操作</span>
        </el-col>
      </el-row>

      <el-row v-for="(goods, index) in goods_list" v-if="goods_list" :class="{active: goods.is_checked,edited:edit_list[goods.goods_id]}" :key="goods.goods_id" class="goods-table-item" type="flex">
        <el-col :span="1">
          <el-checkbox v-model="goods.is_checked" @change="selGoods($event, goods.goods_id)"/>
        </el-col>
        <el-col :span="2">
          <div class="act-goods-pic">
            <!--<img src="~assets/img/act_tag.jpg" v-if="goods.activity_info" class="act-img">-->
            <div class="goods-pic">
              <img :src="goods.goods_img" style="width: 100%">
            </div>
          </div>
        </el-col>
        <el-col :span="5" @click.native="setEditField(goods, 'goods_name')">
          <p v-if="!goods.goods_name_edit" :class="{edited:edit_list[goods.goods_id]}" class="table-item-txt goods-name">{{ goods.goods_name }}</p>

          <div v-else class="edit-table-item">
            <el-input v-model="goods.goods_name_temp" class="edit-input name" type="textarea"/>
            <button class="edit-btn font-btn ic-btn-s" @click.stop="confirmEditField(goods, 'goods_name')">确定</button>
            <button class="edit-btn font-btn ic-btn-s" @click.stop="cancelEditField(goods, 'goods_name')">取消</button>
          </div>
        </el-col>
        <el-col :span="2">
          <p class="table-item-txt goods-cat">{{ goods.cat_name }}/{{ goods.brand_name }}</p>
        </el-col>

        <el-col :span="2">
          <p class="table-item-txt goods-brand">{{ goods.quality }}</p>
        </el-col>

        <el-col :span="2" >
          <div class="up-down-edit-price">
            <div class="pointer side-block bottom-line" @click="setEditField(goods, 'shop_price')">
              <!--显示状态下-->
              <p v-if="!goods.shop_price_edit" class="table-item-txt goods-price">￥{{ goods.shop_price }}</p>

              <!--编辑状态下-->
              <div v-else class="edit-table-item">
                <el-input v-model="goods.shop_price_temp" class="edit-input price"/>
                <button class="edit-btn font-btn ic-btn-s" @click.stop="confirmEditField(goods, 'shop_price',index)">确定</button>
                <button class="edit-btn font-btn ic-btn-s" @click.stop="cancelEditField(goods, 'shop_price')">取消</button>
              </div>

            </div>

            <div class="pointer side-block" @click="setEditField(goods, 'shop_price_usd')">
              <!--显示状态下-->
              <p v-if="!goods.shop_price_usd_edit" class="table-item-txt goods-price">${{ goods.shop_price_usd }}</p>
              <!--编辑状态下-->
              <div v-else class="edit-table-item">
                <el-input v-model="goods.shop_price_usd_temp" class="edit-input price"/>
                <button class="edit-btn font-btn ic-btn-s" @click.stop="confirmEditField(goods, 'shop_price_usd',index)">确定</button>
                <button class="edit-btn font-btn ic-btn-s" @click.stop="cancelEditField(goods, 'shop_price_usd')">取消</button>

              </div>
            </div>
          </div>

        </el-col>
        <el-col :span="2">
          <div class="shop-price-info">
            <p v-if="goods.activity_info" class="table-item-txt bottom-line">￥{{ goods.activity_info.price }}</p>
            <p v-if="goods.activity_info" class="table-item-txt">￥{{ goods.activity_info.before_price }}</p>
          </div>
        </el-col>
        <el-col :span="2" class="pointer" @click.native="setEditField(goods, 'goods_num')">
          <p v-if="!goods.goods_num_edit" class="table-item-txt goods-stock">{{ goods.goods_num }}</p>

          <div v-else class="edit-table-item">
            <el-input v-model="goods.goods_num_temp" class="edit-input num"/>
            <button class="edit-btn font-btn ic-btn-s" @click.stop="confirmEditField(goods, 'goods_num')">确定</button>
            <button class="edit-btn font-btn ic-btn-s" @click.stop="cancelEditField(goods, 'goods_num')">取消</button>
          </div>
        </el-col>
        <el-col :span="1">
          <el-dropdown trigger="click" placement="bottom-start">
            <p v-if="goods.is_sale===0" :class="{edited:edit_list[goods.goods_id]}" class="table-item-txt is-sale common-font-effect pointer">下架</p>
            <p v-else-if="goods.is_sale===1" :class="{edited:edit_list[goods.goods_id]}" class="table-item-txt is-sale common-font-effect pointer">上架</p>
            <p v-else-if="goods.is_sale===2" :class="{edited:edit_list[goods.goods_id]}" class="table-item-txt is-sale common-font-effect pointer">缺货</p>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="goods.is_sale!==1" @click.native="setSingleSaleStatus(goods, 1)">上架</el-dropdown-item>
              <el-dropdown-item v-if="goods.is_sale!==0" @click.native="setSingleSaleStatus(goods, 0)">下架</el-dropdown-item>
              <el-dropdown-item v-if="goods.is_sale!==2" @click.native="setSingleSaleStatus(goods, 2)">缺货</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        <el-col :span="1">
          <el-dropdown trigger="click" placement="bottom-start">
            <p v-if="goods.is_rentable===1" :class="{edited:edit_list[goods.goods_id]}" class="table-item-txt is-sale common-font-effect pointer">可租</p>
            <p v-else-if="goods.is_rentable===2" :class="{edited:edit_list[goods.goods_id]}" class="table-item-txt is-sale common-font-effect pointer">不可租</p>

            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="goods.is_rentable!==1" @click.native="setSingleRentStatus(goods, 1)">可租</el-dropdown-item>
              <el-dropdown-item v-if="goods.is_rentable!==2" @click.native="setSingleRentStatus(goods, 2)">不可租</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
        <el-col :span="2">
          <span class="goods-controll-btn" @click="edit(index)">
            <i class="eicon-xiugai"/>编辑
          </span>
          <!--<span @click="edit(index)" class="goods-controll-btn">
                        <i class="eicon-xiugai"></i>编辑
                    </span>-->
        </el-col>
      </el-row>

      <p v-if="no_goods_find" class="no-table-content-warn">没有找到相应的商品</p>
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

    <el-dialog
      :visible.sync="showEditStock"
      :show-close="false"
      :close-on-click-modal="false"
      width="660px"
      top="25vh">
      <div slot="title" class="dialog-header">
        <p class="dialog-title">修改商品库存及价格</p>

        <i class="eicon-guanbi dialog-close-btn" @click="showEditStock=false"/>
      </div>

      <div v-loading="edit_loading" class="edit-stock">
        <el-form
          v-if="goods_list&&goods_list[edit_index]&&goods_list[edit_index].edit_price_info"
          class="edit-stock-form"
          label-width="100px">
          <div class="info-line">
            <span class="info-label">商品名称:</span>
            <p class="info-content">{{ goods_list[edit_index].goods_name }}</p>
          </div>
          <el-form-item label="库存:">
            <el-input v-model="goods_list[edit_index].edit_price_info.goods_num"/>
          </el-form-item>
          <el-form-item label="人民币销售价:">
            <el-input v-model="goods_list[edit_index].edit_price_info.shop_price" @blur="blurEditField(edit_index, 'shop_price')" @focus="focusEditField"/>
          </el-form-item>
          <el-form-item label="美元销售价:">
            <el-input v-model="goods_list[edit_index].edit_price_info.shop_price_usd" @blur="blurEditField(edit_index, 'shop_price_usd')" @focus="focusEditField"/>
          </el-form-item>
          <el-form-item label="成本价:">
            <el-input v-model="goods_list[edit_index].edit_price_info.cost_price"/>
          </el-form-item>

          <div class="submit-line txt-center">
            <button :disabled="isdisabled" type="button" class="blue-btn btn-common-size" @click="submitEdit">保存</button>
            <button type="button" class="plain-btn btn-common-size" @click="showEditStock=false">取消</button>
          </div>
        </el-form>

        <i
          :class="{disabled: edit_index===0}"
          class="eicon-arrow-left switch-btn prev"
          @click="switchGoods('prev')"
        />
        <i
          :class="{disabled: !goods_list||edit_index===goods_list.length-1}"
          class="eicon-arrow-left switch-btn next"
          @click="switchGoods('next')"
        />
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="showImportTips"
      :show-close="false"
      :close-on-click-modal="false"
      width="400px"
      top="25vh">
      <div slot="title" class="dialog-header">
        <p class="dialog-title">商品上传提示</p>
        <i class="eicon-guanbi dialog-close-btn" @click="showImportTips=false"/>
      </div>

      <div>
        <p>成功上传数: {{ import_tips.success_num }}</p>
        <p>失败上传数:  <span :class="{'cl-r':import_tips.fail_num>0}">{{ import_tips.fail_num }}</span></p>
      </div>

      <div slot="footer" class="txt-center">
        <button v-if="import_tips.fail_num<=0" class="plain-btn btn-common-size" @click="showImportTips=false">关闭</button>
        <a v-else :href="`/admin/api/excel/download_fail?goods_key=${import_tips.goods_key}`" class="blue-btn btn-common-size">查看失败列表</a>
      </div>
    </el-dialog>

    <input ref="upload" type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" style="display: none" @change="handleUpload">
  </div>
</template>

<script>
// import '@/assets/lottery/css/normalize.css'
import { quality_list } from '@/assets/lottery/js/data'
import request from '@/utils/request'
export default {
  data() {
    return {
      quality_list,
      searchForm: {
        goods_name: '',
        cat_id: '',
        brand_id: '',
        is_sale: '',
        page: 1,
        paginate: 10
      },
      total_num: 0,

      sel_goods_arr: [],
      sel_goods_all: false,

      goods_list: null,
      no_goods_find: false,
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
      edit_list: []
    }
  },

  watch: {
    edit_index(index) {
      const goods = this.goods_list[index]

      if (!goods.price_info) {
        this.edit_loading = true

        this.$http.get('/goods/get_goods_stock', {
          goods_id: goods.goods_id
        }).then((res) => {
          if (res.code === 0) {
            this.$set(this.goods_list[index], 'price_info', this.deepCopyObj(res.data))
            this.$set(this.goods_list[index], 'edit_price_info', this.deepCopyObj(res.data))
          } else {
            this.$message.error('参数出错，无法编辑库存')
            this.showEditStock = false
          }

          this.edit_loading = false
        })
      }
    },

    showEditStock(res) {
      if (!res) {
        const cur_index = this.edit_index
        this.goods_list[cur_index].edit_price_info = this.deepCopyObj(this.goods_list[cur_index].price_info)
      }
    },

    sel_goods_arr(goods_list) {
      this.sel_goods_all = this.checkIfSelAll()
    }
  },

  mounted() {
    this.getGoodsList()
    this.getCatTree()
    this.getBrandByCat()
  },

  methods: {
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
        goods_list[index].is_checked = this.sel_goods_arr.indexOf(goods.goods_id) !== -1
      })

      return goods_list
    },

    getGoodsList() {
      this.no_goods_find = false
      this.goods_loading = true
      request({
        url: '/candidate/get',
        method: 'get'
        // params: this.searchForm
      }).then(res => {
        if (res.code === 0 && !Array.isArray(res.data)) {
          this.goods_list = this.arrangeGoods(res.data.data)
          this.total_num = res.data.total

          /* 检查当前是否全选*/
          this.sel_goods_all = this.checkIfSelAll()
        } else if (res.code === 0 && Array.isArray(res.data)) {
          this.no_goods_find = true
          this.goods_list = []
          this.total_num = 0
        } else {
          this.goods_list = null
          this.$message.error(res.message)
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

    getCatTree() {
      this.$http.get('/cate/get_cat_tree')
        .then((res) => {
          if (res.code === 0) {
            this.cats = res.data
          } else {
            console.log(res.message)
          }
        })
    },

    getBrandByCat() {
      this.$http.get('/brand/get_brand_by_cat')
        .then((res) => {
          if (res.code === 0) {
            this.brands = res.data
          } else {
            console.log(res.message)
          }
        })
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
      const ajaxData = this.deepCopyObj(this.searchForm)
      // 去除搜索条件中的分页及页码
      delete ajaxData.page
      delete ajaxData.paginate

      this.$http.post('/excel/search_goods_export', ajaxData)
        .then((res) => {
          if (res.code === 0) {
            location.href = `/admin/api/excel/goods_export?goods_key=${res.data.goods_key}`
          } else {
            this.$message.error(res.message)
          }
        })
    },

    exportGoodsExcel() {
      if (this.sel_goods_arr.length <= 0) {
        this.$message.error('请选中需要导出的商品')
        return false
      }

      this.$http.post('/excel/goods_export', {
        goods_ids: this.sel_goods_arr,
        goods_key: 0
      }).then((res) => {
        if (res.code === 0) {
          location.href = `/admin/api/excel/goods_export?goods_key=${res.data.goods_key}`
        } else {
          this.$message.error(res.message)
        }
      })
    },

    importGoodsExcel() {
      this.$refs.upload.click()
    },

    handleUpload(e) {
      const file = e.target.files[0]
      const formdata = new FormData()

      formdata.append('file', file)
      // 启动loading
      this.$store.commit('setPageLoading', true)
      this.$http.postForm('/excel/goods_import', formdata)
        .then((res) => {
          if (res.code === 0) {
            this.import_tips = res.data

            this.showImportTips = true
          } else {
            this.$message.error(res.message)
          }

          // 上传完清空文件，避免影响下次上传
          this.$refs.upload.value = ''
          // 关闭loading
          this.$store.commit('setPageLoading', false)
        })
    },

    setEditField(goods, flag) {
      const edit = `${flag}_edit`
      const temp = `${flag}_temp`

      // 修复了bug
      if (goods[edit]) return

      this.$set(goods, edit, true)
      this.$set(goods, temp, goods[flag])
    },

    cancelEditField(goods, flag) {
      const edit = `${flag}_edit`

      this.$delete(goods, edit)
    },

    confirmEditField(goods, flag, index = null) {
      const temp = `${flag}_temp`
      const edit = `${flag}_edit`

      const ajaxData = {
        goods_id: goods.goods_id,
        goods_name: goods.goods_name,
        goods_num: goods.goods_num,
        shop_price: goods.shop_price,
        shop_price_usd: goods.shop_price_usd
      }

      const getData = {
        price: goods[temp]
      }

      ajaxData[flag] = goods[temp]

      if (flag == 'shop_price' || flag == 'shop_price_usd') {
        const currency = flag == 'shop_price' ? 'USD' : 'CNY'
        const currency_low = flag == 'shop_price' ? 'usd' : 'cny'
        const update_price = flag == 'shop_price' ? 'shop_price_usd' : 'shop_price'
        this.$http.get('exchange_rate/get_' + currency, getData)
          .then((res) => {
            if (res.code === 0) {
              ajaxData[update_price] = res.data[currency_low]

              this.$http.post('/goods/edit_goods_stock', ajaxData)
                .then((res) => {
                  if (res.code === 0) {
                    goods[flag] = goods[temp]
                    this.$delete(goods, edit)
                    if (index + 1) {
                      this.goods_list[index].shop_price = res.data.shop_price
                      this.goods_list[index].shop_price_usd = res.data.shop_price_usd
                      if (this.goods_list[index].activity_info) {
                        this.goods_list[index].activity_info.before_price = res.data.activity_info.before_price
                        this.goods_list[index].activity_info.price = res.data.activity_info.price
                      }
                    }
                    this.$message({
                      type: 'success',
                      message: res.message
                    })
                  } else {
                    this.$message.error(res.message)
                  }
                })
            } else {
              this.$message.error(res.message)
            }
          })
      } else {
        this.$http.post('/goods/edit_goods_stock', ajaxData)
          .then((res) => {
            if (res.code === 0) {
              goods[flag] = goods[temp]
              this.$delete(goods, edit)
              if (index + 1) {
                this.goods_list[index].shop_price = res.data.shop_price
                this.goods_list[index].shop_price_usd = res.data.shop_price_usd
                if (this.goods_list[index].activity_info) {
                  this.goods_list[index].activity_info.before_price = res.data.activity_info.before_price
                  this.goods_list[index].activity_info.price = res.data.activity_info.price
                }
              }
              this.$message({
                type: 'success',
                message: res.message
              })
            } else {
              this.$message.error(res.message)
            }
          })
      }
      this.$set(this.edit_list, goods.goods_id, 1)
    },

    blurEditField(edit_index, flag) {
      this.isdisabled = false
      const getData = {
        price: this.goods_list[edit_index].edit_price_info[flag]
      }

      const currency = flag == 'shop_price' ? 'USD' : 'CNY'
      const currency_low = flag == 'shop_price' ? 'usd' : 'cny'
      const update_price = flag == 'shop_price' ? 'shop_price_usd' : 'shop_price'
      this.$http.get('exchange_rate/get_' + currency, getData)
        .then((res) => {
          if (res.code === 0) {
            this.goods_list[edit_index].edit_price_info[update_price] = Math.round(res.data[currency_low]).toFixed(2)
          } else {
            this.$message.error(res.message)
          }
        })
    },
    focusEditField() {
      this.isdisabled = true
    }

  }
}
</script>

<style rel="stylesheet/scss" lang="scss"  scoped>

    .goods-display-table{
        .goods-table-item{
            .el-col{
                height: 120px;
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
        margin-bottom: 20px;
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
