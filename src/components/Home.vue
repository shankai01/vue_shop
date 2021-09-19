<template>
<el-container class="home-container">
  <!-- 头部区域 -->
  <el-header>
    <div>
      <img src="../assets/logo_3.png" alt="">
      <span>电商后台管理系统</span>
    </div>
    <el-button type="info" @click="logout">退出</el-button>
  </el-header>
  <!-- 页面主体区域 -->
  <el-container>
  <!-- 侧边栏 -->
  <el-aside :width="isCollapse ? '64px' : '200px'">
    <div class="toggle-button" @click="toggleCollapse">|||</div>
    <!-- 侧边栏菜单区 -->
     <el-menu
      background-color="rgb(25, 194, 223)"
      text-color="#fff"
      active-text-color="rgb(20,155,178)"
      unique-opened
      :collapse= "isCollapse"
      :collapse-transition= "false"
      router
      :default-active= "activePath">
      <!-- 一级菜单 -->
      <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
        <!-- 一级菜单模板区 -->
        <template slot="title">
          <!-- 图标 -->
          <i :class="iconsObj[item.id]"></i>
          <!-- 文本 -->
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
        <el-menu-item
        :index="'/' + subItem.path"
        v-for="subItem in item.children"
        :key="subItem.id"
        @click="saveNavState('/' + subItem.path)">
           <template slot="title">
          <!-- 图标 -->
          <i class="el-icon-menu"></i>
          <!-- 文本 -->
          <span>{{subItem.authName}}</span>
          </template>
        </el-menu-item>
      </el-submenu>
    </el-menu>
  </el-aside>
    <!-- 右边主体区域 -->
    <el-main>
      <!-- 路由占位符 -->
      <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>
<script>
export default {
  data () {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        125: 'el-icon-s-custom',
        103: 'el-icon-s-platform',
        101: 'el-icon-s-shop',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data'
      },
      isCollapse: false,
      // 被激活的连接
      activePath: ''
    }
  },
  created () {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      console.log(res)
    },
    // 点击按钮展开菜单
    toggleCollapse () {
      console.log('折叠')
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>
<style scoped lang="less">
.el-header{
  background-color: rgb(0, 97, 148);
  display: flex;
  justify-content: space-between;
  padding: 0;
  align-items: center;
  color: white;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside{
  background-color: rgb(25, 194, 223);
}
.el-main{
  background-color: rgb(132, 242, 239);
}
.home-container{
  height: 100%;
}
.el-menu{
  border-right: 0;
}
.subcolo:hover{
  background-color: rgb(84, 162, 175);
}
.toggle-button{
  background-color:rgb(46, 120, 133);
  font-size: 10px;
  line-height: 24px;
  color: white;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
