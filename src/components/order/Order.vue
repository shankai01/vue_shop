<template>
    <div>
        <!-- 面包屑导航区 -->
       <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <!-- 搜索区域 -->
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单列表区 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column label='#' type="index"></el-table-column>
                <el-table-column label='订单编号' prop="order_number" width="350px"></el-table-column>
                <el-table-column label='订单价格' prop="order_price" width="80px"></el-table-column>
                <el-table-column label='是否付款' prop="pay_status" width="80px">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label='是否发货' prop="is_send" width="95px"></el-table-column>
                <el-table-column label='下单时间' prop="create_time" width="160px">
                     <template slot-scope="scope">
                         {{scope.row.create_time | dateFormat}}
                     </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox(scope.row.goods_id)"></el-button>
                        <!-- 定位按钮 -->
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[5, 10, 15, 20]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              background>
            </el-pagination>
        </el-card>
        <!-- 修改地址的对话框 -->
        <el-dialog
          title="修改地址"
          :visible.sync="addressVisible"
          width="50%"
          @close="addressDialogClosed">
            <el-form
            :model="addressForm"
            :rules="addressFormRules"
            ref="addressFormRef"
            label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader
                    v-model="addressForm.address1"
                    :options="cityData" expand-trigger="hover"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                  <el-input v-model="addressForm.address2" ></el-input>
                </el-form-item>
              </el-form>
          <!-- 底部分区 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addressVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCateInfo">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 展示物流进度的对话框 -->
          <el-dialog
          title="物流进度"
          :visible.sync="progressVisible"
          width="50%">
          <!-- 时间线 -->
          <el-timeline :reverse="reverse">
            <el-timeline-item
              v-for="(activity, index) in progreeInfo"
              :key="index"
              :timestamp="activity.time">
              {{activity.context}}
            </el-timeline-item>
          </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityData from './cityData.js'
export default {
  data () {
    return {
      // 获取商品列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 15
      },
      orderlist: [],
      total: 0,
      // -修改地址的对话框的隐藏与显示
      addressVisible: false,
      // 修改操作的表单
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          {
            required: true,
            message: '请选择省市区/县',
            trigger: 'blur'
          }
        ],
        address2: [
          {
            required: true,
            message: '请输入详细地址',
            trigger: 'blur'
          }
        ]
      },
      // -定义定位的数据
      cityData,
      // -控制物流对话框的隐藏与显示
      progressVisible: false,
      // -物流信息
      progreeInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('订单列表获取失败')
      }
      console.log('订单列表: ', res)
      this.orderlist = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize 改变的事件
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 点击修改地址按钮打开对话框
    showBox () {
      this.addressVisible = true
    },
    // -关闭对话框时触发事件，重置表单
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 展示物流对话框
    async showProgressBox () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progreeInfo = res.data
      console.log('获取物流信息成功：', this.progreeInfo)
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
@import url(../../plugins/timeline/timeline.css);
@import url(../../plugins/timeline-item/timeline-item.css);
.el-cascader {
  width: 100%;
}
</style>
