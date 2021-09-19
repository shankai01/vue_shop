<template>
    <div>
       <!-- 面包屑导航区 -->
       <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图区域 -->
        <el-card>
        <el-row :gutter="20">
            <el-col :span="8">
                <!-- 搜索区域 -->
                <el-input placeholder="请输入内容"  v-model="queryInfo.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
             <el-col :span="4">
                 <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
             </el-col>
        </el-row>
        <!-- 用户列表区 -->
        <el-table :data="userlist" border stripe>
            <el-table-column label='#' type="index"></el-table-column>
            <el-table-column label='姓名' prop="username"></el-table-column>
            <el-table-column label='邮箱' prop="email"></el-table-column>
            <el-table-column label='电话' prop="mobile"></el-table-column>
            <el-table-column label='角色' prop="role_name"></el-table-column>
            <el-table-column label='状态'>
              <template slot-scope="scope">
                <!-- slot-scope="scope" 来取得作用域插槽:data绑定的数据，scope可以随便替换其他名称，只是定义对象来代表取得的data数据，便于使用 -->
                <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label='操作' width="180px">
                <template slot-scope="scope">
                  <!-- 修改按钮 -->
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                  <!-- 删除按钮 -->
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
                  <!-- 分配按钮 -->
                  <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                    <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                  </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页区 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
        </el-card>
        <!-- 添加用户对话框 -->
        <el-dialog
          title="添加用户"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClosed">
          <!-- 内容主体区 -->
          <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部区 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改用户对话框 -->
        <el-dialog
          title="修改用户"
          :visible.sync="editDialogVisible"
          width="50%"
          @close="editDialogClose">
          <el-form
          ref="editFormRef"
          :model="editForm"
          label-width="80px"
          :rules="editFormRules">
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled=""></el-input>
            </el-form-item>
             <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
             <el-form-item label="手机" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
            </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    // 自定义验证用户邮箱的规则
    var checkEmil = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱'))
    }
    // 自定义验证用户手机号的规则
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^[1](([3][0-9])|([4][0,1,4-9])|([5][0-3,5-9])|([6][2,5,6,7])|([7][0-8])|([8][0-9])|([9][0-3,5-9]))[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
            // trigger: 'blur' 失去焦点触发
          },
          {
            min: 6,
            max: 15,
            message: '用户名长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机',
            trigger: 'blur'
          },
          {
            min: 11,
            max: 11,
            message: '用户名长度在11个字符',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入用户的邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmil,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入用户的手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('用户列表获取失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听pagesize 改变的事件
    handleSizeChange (newSize) {
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听 switch 开关的状态
    async userStateChange (userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败!')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return 0
        // 请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 200) {
          this.$message.error('添加失败!')
        }
        this.$message.success('添加成功!')
        // // 隐藏对话框
        this.addDialogVisible = false
        // // 重新获取用户列表
        this.getUserList()
      })
    },
    // 展示修改用户的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('用户查询失败!')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改用户对话框的关闭事件
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return 0
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败!')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.getUserList()
        // 提示更改成功
        this.$message.success('更新用户信息成功!')
      })
    },
    // 根据id删除对应的用户信息
    async removeUserById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }
      this.$message.success('删除用户成功!')
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>

</style>
