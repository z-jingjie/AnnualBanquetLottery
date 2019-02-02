const order_status_list = {
    0:'全部',
    1:'待付款',
    5:'支付待审核',
    10:'待发货',
    // 15:'已出仓',
    // 20:'配送中',
    20:'待收货',
    25:'已收货',
    // 30:'取消中',
    // 35:'已取消',
    40:'售后中',
    // 45:'售后完成',
    45:'已关闭',
}

exports.order_status_list = order_status_list

const rent_order_status_list = {
    0: '全部',
    5: '待付款',
    15: '已关闭',
    20: '支付待审核',
    25: '已支付',
    40: '待发货',
    50: '待收货',
    60: '已收货',
    70: '租赁中',
    80: '租赁分期已逾期',
    90: '租赁总租期已逾期',
    100: '商品未退还',
    110: '商品已退还',
    115: '订单已完成',
    120: '售后中'
}

exports.rent_order_status_list = rent_order_status_list

const idc_order_status_list = {
    1:'待付款',
    5:'支付待审核',
    10:'待部署',
    25:'租赁中',
    30:'已到期',
    40:'售后中',
    45:'已取消',
    50:'已退款',
};
exports.idc_order_status_list = idc_order_status_list;

const coupon_status_list = {
    0:'全部',
    1:'已使用',
    2:'未使用',
}
exports.coupon_status_list = coupon_status_list

const pay_type_list = {
    0:'暂无',
    1: '线下电汇',
    2: 'Paypal',
    3: 'Credit card',
    4: 'Offline by Paypal',
    6: '支付宝PC支付',
    7: '支付宝条码支付',
    8: '微信H5支付',
    9: '银联PC支付',
    10: '网银支付',
    11: '微信扫码支付',
    12: '支付宝扫码支付',
    13: '支付宝手机网站支付'
}

exports.pay_type_list = pay_type_list

const transport_type_list = {
    1: '航空',
    2: '轨道(铁路)',
    3: '海洋',
    4: '公路',
    5: '管道',
    6: '内河水运',
    7: '多式联运'
}

exports.transport_type_list = transport_type_list

const distribution_type_list = {
    0:'还未分配送方式',
    1:'仓库配送',
    2:'配送中心配送',
    3:'生产企业配送',
    4:'商店配送'
}

exports.distribution_type_list = distribution_type_list

const express_status_list={
    1:'已出库',
    2:'配送中',
    3:'已签收'
}

exports.express_status_list = express_status_list

const warehouse_list={
    0:'还未分配仓库',
    1:'香港仓库',
    2:'美国仓库',
    3:'广州仓库'
}

exports.warehouse_list = warehouse_list

const packing_mode_list={
    0:'还未包装',
    1:'单件包装',
    2:'中包装',
    3:'外包装'
}

exports.packing_mode_list = packing_mode_list

const ref_list = {
    'home_nav':'首页-侧边栏导航',
    'home_banner':'首页-banner图',
    'home_marketing':'首页-产品营销模块',
    'home_side_ad':'首页-侧边栏广告图',
    'home_cpu':'首页-分类模块-cpu',
    'home_ssd':'首页-分类模块-ssd',
    'home_ram':'首页-分类模块-ram',
    'home_hdd':'首页-分类模块-hdd',
    'home_gpu':'首页-分类模块-gpu',
    'home_card/controller':'首页-分类模块-card/controller',
    'goods_similar':'商品详情页-相似推荐',
    'goods_same_type':'商品详情页-聚合商品',
    'goods_search':'分类筛选页-搜索结果',
    'goods_search_similar':'分类筛选页-相似推荐',
    'search_guess_like':'搜索页-猜你喜欢',
    'cart_guess_like':'购物车-猜你喜欢（添加成功提示页）',
    'cart_recently_view':'购物车-最近浏览',
    'order_goods_name':'订单列表-订单名称（个人中心）'
}


exports.ref_list = ref_list


const user_type_list = {
    1: '其他',
    2: '贸易代理商',
    3: '系统集成商',
    // 4: '本地贸易代理商',
    // 5: '本地系统集成商',
    6: '企业',
    7: '政府/非盈利组织'
}

exports.user_type_list = user_type_list

const artificial_looking_list = {
    1: '跟进中',
    2: '已跟进',
    3: '已完成',
    4: '已拒绝',
}

exports.artificial_looking_list = artificial_looking_list

const quality_list = {
    'A 级': 'A 级',
    'B 级': 'B 级',
    '全新': '全新'
}

exports.quality_list = quality_list

const server_quality_list = {
    '全新': '全新',
    '非全新': '非全新',
}

exports.server_quality_list = server_quality_list

const department_list = {
    '采购部': '采购部',
    '销售部': '销售部',
    '市场运营部': '市场运营部',
    '营销推广部': '营销推广部',
    '产品运营部': '产品运营部',
    '研发部': '研发部',
    '其他': '其他'
}

exports.department_list = department_list

const user_tag_list = {
    1: '默认',
    2: '有效',
    3: '无效'
}

exports.user_tag_list = user_tag_list

const logistic_name_list = {
    "shunfeng_cn_jiri": "顺丰即日",
    "shunfeng_cn_cichen": "顺丰次晨",
    "shunfeng_cn_biaokuai": "顺丰标快",
    "shunfeng_cn_tehui": "顺丰特惠",
    "shunfeng_cn_wuliupuyun": "物流普运",
    "shunfeng_cn_zhonghuokuaiyun": "重货快运",
    "shunfeng_cn_zhonghuobaoguo": "重货包裹",
    "shunfeng_cn_xiaopiaolingdan": "小票零担",
    "shunfeng_cn_zhonghuozhuanyun": "重货专运",
    "shunfeng_cn_unknown": "顺丰其他产品",
    "deppon_cn_dajiankuaidi360_tehuijian": "大件快递3.60(3.60特惠件)",
    "deppon_cn_dajiankuaidi360_tezhongjian": "大件快递3.60(3.60特重件)",
    "deppon_cn_biaozhunkuaidi": "标准快递",
    "deppon_cn_tezhunkuaijian": "特准快件",
    "deppon_cn_dianshangzunxiang": "电商尊享",
    "deppon_cn_zhongbaoruhu": "重包入户",
    "deppon_cn_jingzhunkahang_chengyun": "精准卡航 / 精准城运",
    "deppon_cn_jingzhunqiyun": "精准汽运",
    "deppon_cn_jingzhunkongyun": "精准空运",
    "deppon_cn_jingzhunbaoguo": "精准包裹",
    "deppon_cn_zhengcheyunshu": "整车运输",
    "deppon_cn_dajiancangchu": "德邦大件仓储",
    "deppon_cn_guojixiaobao": "国际小包",
    "deppon_cn_guojikuaijian": "国际快件",
    "deppon_cn_guojikahang": "国际卡航",
    "deppon_cn_unknown": "德邦其他产品",
    "SelfTake": "自提"
}

exports.logistic_name_list = logistic_name_list


const express_code_list = {
    'shunfeng_cn' : '顺丰物流',
    'deppon_cn' : '德邦物流'
}
exports.express_code_list = express_code_list

const is_pay_complete_list = {
    1:'是',
    2:'否'
}
exports.is_pay_complete_list = is_pay_complete_list

const user_client_list = {
    'all':'全部',
    'pc':'pc端',
    'h5':'移动端',
}
exports.user_client_list = user_client_list

const company_status_list = {
    1:'待处理',
    2:'审核不通过',
    3:'待用户验证',
    4:'验证通过'
}
exports.company_status_list = company_status_list

const certificate_type_list = {
    1:'多证合一营业执照',
    2:'普通营业执照',
}
exports.certificate_type_list = certificate_type_list


// 租赁设备售后类型
const rent_service_type_list = {
    1: '退货退款',
    2: '退款',
    3: '换货',
    4: '维修',
    5: '退租'
}

exports.rent_service_type_list = rent_service_type_list

// 账期支付状态
const account_period_status_list = {
    0:'全部',
    1:'待支付',
    2:'已支付',
    3:'逾期',
}