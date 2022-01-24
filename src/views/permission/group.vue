<template>
  <BasePage>
    <template slot="searchBox">
      <el-button type="primary" icon="el-icon-plus" class="mr10" @click="addRoleBtn">添加用户组</el-button>
      <el-input placeholder="请输入关键字" v-model="keyword" class="common-search-input">
        <el-button slot="append" icon="el-icon-search" @click="getGroup"></el-button>
      </el-input>
    </template>

    <div class="common-table-wrap">
      <el-table v-loading="loading" class="common-table-wrap__table" :data="tableData" style="width: 100%" border>
        <el-table-column prop="group_name" label="用户组名" width="150"></el-table-column>
        <el-table-column prop="user_name" label="组成员"></el-table-column>
        <el-table-column prop="role" label="组角色" width="250"></el-table-column>
        <el-table-column prop="operate" label="操作" width="250">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="editGroup(scope.row)">编辑</el-button>
            <el-button type="text" size="mini" @click="deleteGroup(scope.row)">删除</el-button>
            <el-button type="text" size="mini" @click="configDialogOpen(scope.row, 'configUser')">添加成员</el-button>
            <el-button type="text" size="mini" @click="configDialogOpen(scope.row, 'configRole')">绑定角色</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加用户组 -->
    <el-dialog
      title="新增用户组"
      :visible.sync="showDialog"
      :before-close="dialogCancle"
      customClass="customWidth">
      <el-form ref="roleRef" label-width="80px" :model="form" :rules="formRules">
        <el-form-item label="用户组名" prop="groupName">
          <el-input v-model="form.groupName"></el-input>
        </el-form-item>
        <el-form-item label="继承组名" prop="parenId">
          <el-select v-model="form.parenId" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in tableData"
              :key="item.id"
              :label="item.group_name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCancle">取 消</el-button>
        <el-button type="primary" @click="dialogSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加组员 -->
    <addGroupUserDialog
      v-if="groupInfo"
      :groupInfo="groupInfo"
      @submit="configDialogSubmit"
      @cancel="configDialogCancel"
    ></addGroupUserDialog>
  </BasePage>
</template>

<script>
import {
  queryUserGroupInfo,
  addUserGroup,
  addUserToGroup,
  addRoleToGroup
} from '@/api/user'
import addGroupUserDialog from './group/addGroupUserDialog.vue'

export default {
  name: 'group',
  components: {
    addGroupUserDialog
  },
  data () {
    return {
      loading: false,
      tableData: [],
      form: {
        groupName: '',
        parenId: ''
      },
      formRules: {
        groupName: [{ required: true, message: '请输入组名称' }]
      },
      showDialog: false,
      groupInfo: null
    }
  },
  methods: {
    async getGroup () {
      try {
        this.loading = true
        const res = await queryUserGroupInfo()
        if (res.status === 200) {
          this.tableData = res.data.data
        }
      } finally {
        this.loading = false
      }
    },
    editGroup (rowData) {
    },
    deleteGroup (rowData) {
    },
    configDialogOpen (rowData, type) {
      this.groupInfo = { ...rowData, type }
    },
    configDialogSubmit (params) {
      params.type === 'configUser'
        ? this.configUserSubmit({ groupId: params.groupId, userId: params.value })
        : this.configRoleSubmit({ groupId: params.groupId, roleId: params.value })
    },
    async configUserSubmit (params) {
      const res = await addUserToGroup(params)
      if (res.status === 200) {
        this.getGroup()
        this.configDialogCancel()
        this.$message.success('用户组配置成员成功！')
      } else {
        this.$message.success('用户组配置成员失败！')
      }
    },
    async configRoleSubmit (params) {
      const res = await addRoleToGroup(params)
      if (res.status === 200) {
        this.getGroup()
        this.configDialogCancel()
        this.$message.success('用户组绑定角色成功！')
      } else {
        this.$message.success('用户组绑定角色失败！')
      }
    },
    configDialogCancel () {
      this.groupInfo = null
    },
    addRoleBtn () {
      this.showDialog = true
    },
    dialogCancle () {
      this.showDialog = false
      this.$refs.roleRef.resetFields()
    },
    dialogSubmit () {
      this.$refs.roleRef.validate(async (valid) => {
        if (valid) {
          const res = await addUserGroup({ ...this.form })
          if (res.status === 200) {
            this.getGroup()
            this.$message.success('新增用户组成功！')
            this.dialogCancle()
          } else {
            this.$message.success('新增用户组失败！')
          }
        }
      })
    }
  },
  created () {
    this.getGroup()
  }
}
</script>

<style lang="scss">
.customWidth {
  width: 500px;
  padding: 0 30px 0 15px;
}
</style>
