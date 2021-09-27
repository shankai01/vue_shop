<template>
    <div>
               <!-- 面包屑导航区 -->
       <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
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
                <el-col :span="4">
                    <el-button type="primary" @click="goAddpag">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 商品列表区 -->
            <el-table :data="goodslist" border stripe>
                <el-table-column label='#' type="index"></el-table-column>
                <el-table-column label='商品名称' prop="goods_name"></el-table-column>
                <el-table-column label='商品价格(元)' prop="goods_price" width="95px"></el-table-column>
                <el-table-column label='商品重量' prop="goods_weight" width="95px"></el-table-column>
                <el-table-column label='创建时间' prop="add_time" width="140px">
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 10, 15, 20]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
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
      goodslist: [],
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品列表获取失败')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize 改变的事件
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 点击删除按钮 删除商品
    async removeById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmResult)
      // 取消则返回字符串 cancel
      // 确定则返回字符串 confirm
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除!')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.$message.success('删除用户成功!')
      this.getGoodsList()
    },
    // 点击修改按钮 删除商品
    showEditDialog () {},
    // -点击添加商品，跳转到新的路由页面上
    goAddpag () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>

</style>
