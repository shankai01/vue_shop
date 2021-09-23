<template>
    <div>
      <!-- 面包屑导航区 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片试图区域 -->
      <el-card>
          <!-- 添加角色列按钮区 -->
          <el-row>
              <el-col>
                  <el-button type="primary" @click="addRolesVisible = true">添加角色</el-button>
              </el-col>
          </el-row>
          <!-- 角色列表区域 -->
        <el-table :data="rolelist" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
               <template slot-scope="scope">
                 <!-- 一行 row -->
                 <el-row
                 v-for="(item1, i1) in scope.row.children"
                 :key="item1.id"
                 :class="['el-row2','bdbottom','vcenter', i1 === 0 ? 'bdtop' : '']">
                   <!-- 渲染一级权限 -->
                   <!-- 一行row左边列col -->
                   <el-col :span="5">
                      <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                   </el-col>
                   <!-- 渲染二级和三级权限 -->
                   <!-- 一行row右边列col -->
                   <el-col :span="19">
                     <!-- 用for循环嵌套渲染二级权限 -->
                     <!-- 一行row右边列col 又分 一行row -->
                     <el-row
                     v-for="(item2, i2) in item1.children" :key="item2.id"
                     :class="['vcenter',i2 === 0 ?  '': 'bdtop']">
                     <!-- 一行row右边列col 又分 一行row左边列col -->
                       <el-col :span="6">
                         <el-tag
                         closable
                         @close="removeRightById(scope.row, item2.id)"
                         type="success">{{item2.authName}}</el-tag>
                         <i class="el-icon-caret-right"></i>
                       </el-col>
                       <!-- 一行row右边列col 又分 一行row又边列col -->
                       <el-col :span="18">
                         <!-- 用for循环嵌套渲染三级权限 -->
                         <el-tag
                         type="warning"
                         v-for="(item3) in item2.children"
                         :key="item3.id"
                         closable
                         @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                       </el-col>
                     </el-row>
                   </el-col>
                 </el-row>
               </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    @click="showEditRole(scope.row.id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete"
                    size="mini" @click="deleteRole(scope.row.id)">删除</el-button>
                    <el-button type="warning" icon="el-icon-setting"
                    size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
      </el-card>
      <!-- 添加角色的对话框 -->
      <el-dialog
       title="添加角色"
       :visible.sync="addRolesVisible"
       width="50%"
       @close="addRolesClosed">
          <!-- 内容主体区 -->
          <el-form
           :model="addRolesForm"
           :rules="addRolesFormRules"
           ref="addRolesFormRef"
           label-width="80px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="addRolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="addRolesForm.roleDesc"></el-input>
             </el-form-item>
          </el-form>
         <!-- 底部区 -->
         <span slot="footer" class="dialog-footer">
             <el-button @click="addRolesVisible = false">取消</el-button>
             <el-button type="primary" @click="addRole">确定</el-button>
         </span>
      </el-dialog>
      <!-- 修改角色的对话框 -->
      <el-dialog
        title="修改角色"
        :visible.sync="editRolesVisible"
        width="50%"
        @close="editRolesClosed">
          <!-- 内容主体区 -->
          <el-form
           :model="editRolesForm"
           :rules="addRolesFormRules"
           ref="editRolesFormRef"
           label-width="80px">
            <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="editRolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="editRolesForm.roleDesc"></el-input>
             </el-form-item>
          </el-form>
         <!-- 底部区 -->
         <span slot="footer" class="dialog-footer">
             <el-button @click="editRolesVisible = false">取消</el-button>
             <el-button type="primary" @click="editRoleInfo">确定</el-button>
         </span>
      </el-dialog>
      <!-- 分配权限的对话框 -->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed">
          <!-- 内容主体区 -->
          <el-tree
          :data="rightslist"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"></el-tree>
         <!-- 底部区 -->
         <span slot="footer" class="dialog-footer">
             <el-button @click="setRightDialogVisible = false">取消</el-button>
             <el-button type="primary" @click="allotRights">确定</el-button>
         </span>
      </el-dialog>
    </div>
</template>
<script>
// var setRightDialogVisible = true
export default {
  data () {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制添加角色对话框的隐藏与显示
      addRolesVisible: false,
      // 添加角色的表单数据
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加，修改角色的验证规则对象
      addRolesFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改角色对话框的隐藏与显示
      editRolesVisible: false,
      // 查询到的角色信息对象
      editRolesForm: {},
      // 控制分配权限的对话框的隐藏与显示
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中数组Id
      defKeys: [],
      // 获取要被分配的权限的id
      roleId: []
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = res.data
      console.log(this.rolelist)
    },
    // 监听添加角色对话框的关闭事件
    addRolesClosed () {
      this.$refs.addRolesFormRef.resetFields()
    },
    // 点击按钮 添加角色
    addRole () {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) return 0
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        this.addRolesVisible = false
        this.getRolesList()
      })
    },
    // 展示修改角色的对话框
    async showEditRole (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.message.error('查询角色信息失败')
      }
      this.editRolesForm = res.data
      this.editRolesVisible = true
    },
    // 监听修改角色对话框的关闭事件
    editRolesClosed () {
      this.$refs.editRolesFormRef.resetFields()
    },
    // 修改角色信息并提交
    editRoleInfo () {
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) return 0
        const { data: res } = await this.$http.put('roles/' + this.editRolesForm.roleId, {
          roleName: this.editRolesForm.roleName,
          roleDesc: this.editRolesForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败！')
        }
        // 关闭对话框
        this.editRolesVisible = false
        // 刷新数据列表
        this.getRolesList()
        // 提示更改成功
        this.$message.success('更新角色信息成功！')
      })
    },
    // 删除角色
    async deleteRole (id) {
      // 弹窗询问用户是否删除数据
      const confirmSole = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 取消则返回字符串 cancel
      // 确定则返回字符串 confirm
      if (confirmSole !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      console.log(res.meta.status)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    // 根据ID点击删除标签(权限)
    async removeRightById (role, rightId) {
      // 弹框提问是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！！')
      // this.getRolesList()
      // 下面赋值使页面不会因为删除操作而刷新
      // 留个疑问：此函数里没有调用渲染，在删除操作后，
      // 数据层做了改变，为何渲染层也做了改变，难道此
      // 函数或者说此事件会自动更新渲染层？
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$http.error('获取权限数据失败！')
      }
      this.rightslist = res.data
      console.log('打印获取权限列表:', this.rightslist)
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色所有三级权限的id，并保存到defkeys数组中
    getLeafKeys (node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(
        item => this.getLeafKeys(item, arr)
      )
    },
    // 监听分配权限的对话框关闭事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      // 获取选中和半选中的id放到数组中
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      // 数组转字符串
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-row2 {
  margin: 15px 25px;
}

.el-tag {
  margin: 10px;
}

.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}

</style>
