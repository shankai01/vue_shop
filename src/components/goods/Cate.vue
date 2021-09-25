<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图区域 -->
        <el-card>
            <!-- 添加商品 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
                <tree-table
                class="treetable"
                border
                :data="catelist"
                :columns="columns"
                :selection-type="false"
                :expand-type="false"
                show-index
                index-text="#"
                :show-row-hover="false">
                    <template slot="isok" slot-scope="scope">
                        <i class="el-icon-success"
                        v-if="scope.row.cat_deleted === false"
                        style="color: lightgreen;"></i>
                        <i class="el-icon-error" v-else style="color:red;"></i>
                    </template>
                    <template slot="order" slot-scope="scope">
                      <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                      <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                      <el-tag type="warning" size="mini" v-else>三级</el-tag>
                    </template>
                    <template slot="opt" slot-scope="scope">
                      <el-button type="primary" icon="el-icon-edit" size="mini" @click="openEditDialog(scope.row.cat_id)">编辑</el-button>
                      <el-button type="danger" icon="el-icon-delete" size="mini" @click="opendelDialog(scope.row.cat_id)">删除</el-button>
                    </template>
                </tree-table>
            <!-- 分页 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="querInfo.pagenum"
            :page-sizes="[3, 5, 10, 15]"
            :page-size="querInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-card>
        <!-- 添加分类的对话框 -->
        <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="adCateFormClosed">
        <!-- 添加分类的表单 -->
          <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px">
            <el-form-item label="分类名称：" prop="cat_name">
              <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类：">
              <!-- props 用来指定配置对象 -->
              <el-cascader
              clearable
              :props="cascaderprops"
              v-model="selectedKeys"
              :options="parentCateList"
              expand-trigger="hover"
              @change="parentCateChanged"
              change-on-select></el-cascader>
            </el-form-item>
            </el-form>
          <!-- 底部区 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 编辑分类的对话框 -->
        <el-dialog
          title="修改分类"
          :visible.sync="editDialogVisible"
          width="50%"
          @close="editCateClosed">
            <el-form
            :model="editForm"
            :rules="editFormRules"
            ref="editFormRef"
            label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                  <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
              </el-form>
          <!-- 底部分区 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCateInfo">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 删除分类 -->
    </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        type: 'template',
        // 指定插槽
        template: 'isok'
      },
      {
        label: '排序',
        type: 'template',
        // 指定插槽
        template: 'order'
      },
      {
        label: '操作',
        type: 'template',
        // 指定插槽
        template: 'opt'
      }],
      // 添加分类对话框的隐藏与显示
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父分类的id
        cat_pid: '0',
        // 分类等级，默认一级
        cat_level: '0'
      },
      // 添加分类的表单验证规则的对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderprops: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 编辑分类对话框的隐藏与显示
      editDialogVisible: false,
      // 编辑分类的表单数据
      editForm: {
        cat_name: '',
        cat_id: ''
      },
      // 编辑分类表单的验证规则对象
      editFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // 把获取的数据赋值
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示对话框
    showAddCateDialog () {
      // 获取父级分类的数据列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类的数据失败！')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化就触发这个函数
    parentCateChanged () {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 监听添加分类对话框的关闭事件
    adCateFormClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = ''
      this.addCateForm.cat_level = ''
      this.addCateForm.cat_name = ''
    },
    // 点击确定按钮 添加新的分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return 0
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          console.log('请求失败，状态码：', res.meta.status)
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      }
      )
    },
    // 点击编辑，打开编辑分类的对话框,用id查询此行的分类对象
    async openEditDialog (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类失败！')
      }
      this.editForm.cat_name = res.data.cat_name
      this.editForm.cat_id = id
      this.editDialogVisible = true
    },
    // 点击确定，修改分类并提交
    editCateInfo () {
      this.$refs.editFormRef.validate(
        async valid => {
          if (!valid) return 0
          const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, { cat_name: this.editForm.cat_name })
          if (res.meta.status !== 200) {
            console.log('状态码：', res.meta.status)
            this.$message.error('修改分类名称失败！')
          }
          // 关闭对话框
          this.editDialogVisible = false
          // 刷新数据列表
          this.getCateList()
          // 提示更改成功
          this.$message.success('修改分类名称成功！')
        }
      )
    },
    // 监听修改分类对话框的关闭事件
    editCateClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击删除，弹框删除分类
    async opendelDialog (id) {
      const confirmCate = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmCate !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }
      this.$message.success('删除分类成功')
      this.getCateList()
    }
  }
}
</script>
<style lang="less" scoped>
.treetable {
  margin-top: 20px;
}
.el-cascader {
  width: 100%;
}
</style>
