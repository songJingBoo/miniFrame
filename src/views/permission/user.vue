<template>
  <BasePage>
    <template slot="searchBox">
      <el-button type="primary" class="mr10" icon="el-icon-plus" @click="addUserBtn">添加用户</el-button>
      <el-input placeholder="请输入关键字" v-model="keyword" class="common-search-input">
        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
      </el-input>
    </template>

    <div class="common-table-wrap">
      <el-table v-loading="loading" class="common-table-wrap__table" :data="tableData" style="width: 100%" border>
        <el-table-column prop="user_name" label="用户名" width="250"></el-table-column>
        <el-table-column prop="role" label="角色"></el-table-column>
        <el-table-column prop="date" label="创建时间" width="160">--</el-table-column>
        <el-table-column prop="operate" label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="editUser(scope.row)">修改</el-button>
            <el-button type="text" size="mini" @click="deleteUser(scope.row)">删除</el-button>
            <el-button type="text" size="mini" @click="configRole(scope.row)">配置权限</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @current-change="getUserList(false)"
        @size-change="sizeChange"
        layout="total, sizes, prev, pager, next, jumper" background
        :current-page.sync="page.pageNum"
        :page-sizes="page.pageOptions"
        :page-size.sync="page.pageSize"
        :total="page.total">
      </el-pagination>
    </div>

    <!-- 添加用户 -->
    <el-dialog
      title="新增用户"
      :visible.sync="showDialog"
      :before-close="dialogCancle"
      customClass="customWidth">
      <el-form ref="userRef" label-width="80px" :model="form" :rules="rules">
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pwd">
          <el-input v-model="form.pwd" type="password"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCancle">取 消</el-button>
        <el-button type="primary" @click="dialogSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 配置角色 -->
    <addUserDialog
      v-if="userInfo"
      :userInfo="userInfo"
      @submit="configDialogSubmit"
      @cancel="configDialogCancel"
    ></addUserDialog>
  </BasePage>
</template>

<script>
import { queryUser, addUser, addUserRole } from '@/api/user'
import addUserDialog from './user/addUserDialog.vue'

export default {
  name: 'user',
  components: {
    addUserDialog
  },
  data () {
    return {
      keyword: '',
      tableData: [],
      loading: false,
      showDialog: false,
      page: {
        pageNum: 1,
        pageSize: 10,
        pageOptions: [10, 20, 50, 100],
        total: 0
      },
      form: {
        account: '',
        pwd: '',
        nickname: ''
      },
      rules: {
        account: [
          { required: true, message: '请设置账号' },
          { validator: this.$valid.validatorAccount }
        ],
        pwd: [
          { required: true, message: '请设置密码' }
        ],
        nickname: [
          { required: true, message: '请设置昵称' }
        ]
      },
      userInfo: null
    }
  },
  methods: {
    async getUserList (isInit = true) {
      if (isInit) {
        this.page.pageNum = 1
        this.page.total = 0
        this.tableData = []
      }
      try {
        this.loading = true
        const res = await queryUser()
        if (res.status === 200) {
          this.tableData = res.data
          this.page.total = this.tableData.length
        }
      } finally {
        this.loading = false
      }
    },
    editUser (rowData) {

    },
    deleteUser (rowData) {

    },
    addUserBtn () {
      this.showDialog = true
    },
    dialogCancle () {
      this.showDialog = false
      this.$refs.userRef.resetFields()
    },
    dialogSubmit () {
      this.$refs.userRef.validate(async (valid) => {
        if (valid) {
          const res = await addUser({ ...this.form })
          if (res.status === 200) {
            this.getUserList()
            this.$message.success('新增用户成功！')
            this.dialogCancle()
          } else {
            this.$message.success('新增用户失败！')
          }
        }
      })
    },
    sizeChange (newSize) {
      this.page.pageSize = newSize
      this.getUserList()
    },
    configDialogCancel () {
      this.userInfo = null
    },
    async configDialogSubmit (params) {
      const res = await addUserRole(params)
      if (res.status === 200) {
        this.getUserList()
        this.configDialogCancel()
        this.$message.success('用户设置角色成功！')
      } else {
        this.$message.error('用户设置角色失败！')
      }
    },
    configRole (rowData) {
      this.userInfo = JSON.parse(JSON.stringify(rowData))
    }
  },
  created () {
    this.getUserList()
  }
}
</script>

<style lang="scss">
.customWidth {
  width: 500px;
  padding-right: 30px;
}
</style>
