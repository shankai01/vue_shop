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
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddpag">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="95px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.goods_id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            ></el-button>
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
        background
      >
      </el-pagination>
    </el-card>
    <!-- 修改商品信息对话框 -->
    <el-dialog
      title="修改信息"
      :visible.sync="editgoodsDialogVisible"
      width="80%"
      @close="editgoodsClosed"
    >
      <el-form
        :model="editgoodsForm"
        :rules="editgoodsFormRules"
        ref="editgoodsFormRef"
        label-width="150px"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editgoodsForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editgoodsForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editgoodsForm.goods_weight"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editgoodsForm.goods_number"></el-input>
        </el-form-item>
        <!-- <el-form-item label="商品介绍" prop="goods_introduce">
                  <el-input v-model="editgoodsForm.goods_introduce"></el-input>
                </el-form-item> -->
        <el-form-item label="商品分类" prop='goods_cat' >
          <el-cascader
            clearable
            :props="goodsCatprops"
            v-model="editgoodsForm.goods_cat"
            :options="catelist"
            expand-trigger="hover"
            @change="goodsCateChanged"
            show-all-levels
          >
           <!-- change-on-select 属性：只能选择最后一个节点 -->
          </el-cascader>
          <!-- 动态参数 -->
            <!-- 渲染表单的Item项 -->
            <el-form-item class="formitemmany" :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border @change="changeBox"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          <!-- 静态属性 -->
            <el-form-item class="formitemonly" :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals" @change="changeOnly"></el-input>
            </el-form-item>
        </el-form-item>
        <!-- 上传照片 -->
        <!-- action 表示图片上传的后台API地址 -->
        <el-upload
          :action="uploadURL"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          list-type="picture"
          :headers="headerObj"
          :on-success="handleSuccess"
        >
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </el-form>
      <!-- 底部分区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editgoodsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 预览图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data() {
    return {
      // 获取商品列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 15,
      },
      // 商品列表
      goodslist: [],
      total: 0,
      // -控制修改商品对话框的显示和隐藏
      editgoodsDialogVisible: false,
      // 查商品的ID
      goodsId: '',
      // 修改商品信息的表单数据
      editgoodsForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品分类
        goods_cat: [],
        goods_introduce: '',
        pics: {},
        attrs: [],
      },
      editgoodsFormRules: {
        goods_name: [ { required: true, message: '请输入商品名称', trigger: 'blur' } ],
        goods_price: [ { required: true, message: '请输入商品价格', trigger: 'blur' } ],
        goods_weight: [ { required: true, message: '请输入商品重量', trigger: 'blur' } ],
        goods_number: [ { required: true, message: '请输入商品数量', trigger: 'blur' } ],
        goods_cat: [ { required: true, message: '请选择商品分类',trigger: 'blur', } ],
      },
      // 商品分类数据列表
      catelist: [],
      // -配置级联选择器对象
      goodsCatprops: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      // -动态参数列表
      manyTableData: [],
      // -静态属性列表
      onlyTableData: [],
      // -上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // -图片上传组件的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // -预览图片
      previewPath: '',
      // 控制预览图片的对话框的隐藏与显示
      previewVisible: false,
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品列表获取失败')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 监听pagesize 改变的事件
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 点击删除按钮 删除商品
    async removeById(id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
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
    // 点击修改按钮 查商品id
    async showEditDialog(id) {
      this.goodsId = id
      const { data: res } = await this.$http.get('goods/' + this.goodsId)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品信息失败！')
      }
      // 获取商品分类
      this.getCateList()
      this.editgoodsForm = res.data
      console.log('查询商品的data: ', res.data)
      // 转换goods_cat为数组，用于渲染
      const newAyy = []
      this.editgoodsForm.goods_cat.split(',').forEach(item => newAyy.push(item - 0))
      this.editgoodsForm.goods_cat = newAyy
      // 获取静态属性
      this.getAttrOnlyList()
      // 获取动态参数
      this.getAttrManyList()
      // 打开对话框
      this.editgoodsDialogVisible = true
    },
    // 获取商品分类列表，用于修改商品信息
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.catelist = res.data
      console.log('获取到的商品分类：this.catelist: ', this.catelist)
    },
    // 获取静态属性
    async getAttrOnlyList() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: 'only' }, }
      )
      if (res.meta.status !== 200) {
        console.log('状态码：', res.meta.status)
        return this.$message.error('获取静态属性列表失败！')
      }
      this.onlyTableData = res.data
      console.log("静态属性this.onlyTableData ", this.onlyTableData)
    },
    // 获取动态参数
    async getAttrManyList() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: 'many' }, }
      )
      if (res.meta.status !== 200) {
        console.log('状态码：', res.meta.status)
        return this.$message.error('获取动态参数列表失败！')
      }
      console.log('1动态参数列表字符串res.data', res.data)
      // 把字符串变成数组，用于渲染
      res.data.forEach((item) => {
        item.attr_vals =
          item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
      })
      this.manyTableData = res.data
      console.log("2动态参数数组this.manyTableData： ", this.manyTableData)
    },
    // 级联选择器修改项触发函数
    goodsCateChanged() {
      // 只能选择三级分类
      if (this.editgoodsForm.goods_cat.length !== 3) {
        this.editgoodsForm.goods_cat = []
        console.log('请选择三级分类')
        return 0
      }
      console.log('你选择了三级分类')
      // 获取商品分类是一个数组
      console.log('editgoodsForm.goods_cat；', this.editgoodsForm.goods_cat)
    },
    // 监听表单动态参数标签被点击事件
    changeBox() {
      console.log('点击了标签')
      console.log('manyTableData: ', this.manyTableData)
    },
    // 监听表单静态属性被修改事件
    changeOnly() {
      console.log('静态参数input表单被改变！！')
      // 获取被修改后的表单值
      console.log('onlyTableData: ', this.onlyTableData)
    },
    // -处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // -移除图片的操作
    handleRemove(file) {
      const filepath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex((x) => x.pic === filepath)
      this.addForm.pics.splice(i, 1)
    },
    // -监听图片上传成功事件
    handleSuccess(response) {
      console.log('response:', response)
      const picInfo = {
        pic: response.data.tmp_path,
      }
      this.editgoodsForm.pics.push(picInfo)
      console.log('图片上传成功后this.editgoodsForm', this.editgoodsForm)
    },
    // 点击确定，提交修改商品信息
    editFormInfo() {
      this.$refs.editgoodsFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        const form = _.cloneDeep(this.editgoodsForm)
        form.goods_cat = form.goods_cat.join(',')
        console.log('已转字符串的goods_cat: ', form.goods_cat)
        // 清空上一次修改的参数属性数组数据，防止多次添加数据在数组
        form.attrs = []
        console.log('已清空attrs: ', form.attrs)
        this.editgoodsForm.attrs = []
        console.log('清空editgoodsForm.attrs: ', this.editgoodsForm.attrs)
        // 处理动态参数,要求attr_value是数组
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.editgoodsForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.editgoodsForm.attrs.push(newInfo)
        })
        form.attrs = this.editgoodsForm.attrs
        // 发起请求，修改商品
        console.log('发请求前的editgoodsForm表单(参数)和路径Id：', form, this.goodsId)
        const { data: res } = await this.$http.put('goods/' + this.goodsId,  form)
        if (res.meta.status !== 200) {
          console.log('状态码： ' + res.meta.status)
          return this.$message.error('修改商品信息失败！')
        }
        console.log('状态码： ' + res.meta.status)
        this.editgoodsDialogVisible = false
        this.$message.success('修改商品信息成功！')
        this.getGoodsList()
      })
    },
    // -点击添加商品，跳转到新的路由页面上
    goAddpag() {
      this.$router.push('/goods/add')
    },
    // 关闭修改商品对话框触发事件，重置表单
    editgoodsClosed() {
      this.onlyTableData = []
      this.manyTableData = []
      this.$refs.editgoodsFormRef.resetFields()
    },
  },
  computed: {
    cateId() {
      if (this.editgoodsForm.goods_cat.length === 3) {
        return this.editgoodsForm.goods_cat[2]
      }
      return null
    },
  },
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.formitemonly {
  margin: 10px;
}
.formitemmany {
  margin: 10px;
}
</style>
