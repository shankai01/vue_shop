<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图区域 -->
        <el-card>
            <!-- 头部警告区 -->
             <el-alert
                show-icon
                :closable="false"
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning">
            </el-alert>
            <!-- 选择商品分类区 -->
            <el-row class="cat-opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分的级联选择框 -->
                    <el-cascader
                      clearable
                      :props="cateProps"
                      v-model="selectedCateKeys"
                      :options="catelist"
                      expand-trigger="hover"
                      @change="handleChanged"
                      change-on-select></el-cascader>
                </el-col>
            </el-row>
            <!-- tab页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                           <template slot-scope="scope">
                             <!-- 循环渲染tag标签 -->
                             <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                             <!-- 增加标签 -->
                             <el-input
                              class="input-new-tag"
                              v-if="scope.row.inputVisible"
                              v-model="scope.row.inputValue"
                              ref="saveTagInput"
                              size="small"
                              @keyup.enter.native="handleInputConfirm(scope.row)"
                              @blur="handleInputConfirm(scope.row)"
                            >
                            </el-input>
                            <!-- 添加按钮 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                           </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                           <template slot-scope="scope">
                             <!-- 循环渲染tag标签 -->
                             <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                             <!-- 增加标签 -->
                             <el-input
                              class="input-new-tag"
                              v-if="scope.row.inputVisible"
                              v-model="scope.row.inputValue"
                              ref="saveTagInput"
                              size="small"
                              @keyup.enter.native="handleInputConfirm(scope.row)"
                              @blur="handleInputConfirm(scope.row)"
                            >
                            </el-input>
                            <!-- 添加按钮 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                           </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数/属性的对话框 -->
        <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClosed">
            <!-- 表单区 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑参数/属性的对话框 -->
        <el-dialog
            :title="'修改' + titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClosed">
            <!-- 表单区 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的数据列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 别激活的页签名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {},
      // 添加参数的表单验证规则对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {},
      // 修改参数的表单验证规则对象
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
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
    // 获取所有商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.catelist = res.data
    },
    // 级联选择框选项中选项变化，会触发这个函数
    handleChanged () {
      this.getParamsData()
    },
    // 获取参数属性的列表数据
    async getParamsData () {
      // 判断是否选中三级分类,不是则返回空数组
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return 0
      }
      // 如果是选中三级分类
      // 根据所选的ID,和当前所处的面板，获取对应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      // 把vals字符串改成数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
      console.log('获取参数的列表：', res.data)
    },
    // tab标签点击事件的处理函数
    handleTabClick () {
      this.getParamsData()
    },
    // 监听添加对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定按钮，添加参数、属性
    addParams () {
      this.$refs.addFormRef.validate(
        async valid => {
          if (!valid) return 0
          const { data: res } = await this.$http.post(`categories/ ${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败!')
          }
          this.$message.success('添加参数成功！')
          this.addDialogVisible = false
          this.getParamsData()
        }
      )
    },
    // 点击编辑按钮 展示编辑对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/ ${this.cateId}/attributes/ ${id}`,
        {
          params: { attr_sel: this.activeName }
        })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败!')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改对话框的关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定按钮，修改参数信息
    editParams () {
      this.$refs.editFormRef.validate(
        async valid => {
          if (!valid) return 0
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            })
          if (res.meta.status !== 200) {
            return this.$message.error('修改参数失败!')
          }
          this.editDialogVisible = false
          this.getParamsData()
        }
      )
    },
    // 弹框询问是否删除
    async removeParams (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 增加标签失去焦点或则按下回车都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return 0
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求，保存参数项
      this.saveAttrVals(row)
    },
    // 点击增加标签按钮触发
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 将对attr_vals的操作，保存到数据库
    async saveAttrVals (row) {
      // 发起请求，保存参数项
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    },
    // 删除对应的参数可选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 判断数组长度来控制按钮是否禁用
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级ID
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat-opt {
    margin: 15px 0 ;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 100px;
  margin: 10px;
}
</style>
