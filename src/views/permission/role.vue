<template>
  <BasePage>
    <template slot="searchBox">
      <el-button type="primary" icon="el-icon-plus" class="mr10" @click="addRoleBtn">添加角色</el-button>
      <el-input placeholder="请输入关键字" v-model="keyword" class="common-search-input">
        <el-button slot="append" icon="el-icon-search" @click="getRoleList"></el-button>
      </el-input>
    </template>

    <div class="common-table-wrap">
      <el-table v-loading="loading" class="common-table-wrap__table" :data="tableData" style="width: 100%" border>
        <el-table-column prop="role" label="角色" ></el-table-column>
        <el-table-column prop="role_code" label="编码" width="350"></el-table-column>
        <el-table-column prop="operate" label="操作" width="150">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="editRole(scope.row)">修改</el-button>
            <el-button type="text" size="mini" @click="deleteRole(scope.row)">删除</el-button>
            <el-button type="text" size="mini" @click="configPermission(scope.row)">配置权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加角色 -->
    <el-dialog
      title="新增角色"
      :visible.sync="showDialog"
      :before-close="dialogCancle"
      customClass="customWidth">
      <el-form ref="roleRef" label-width="80px" :model="form" :rules="rules">
        <el-form-item label="角色名称" prop="role">
          <el-input v-model="form.role"></el-input>
        </el-form-item>
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="form.roleCode"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCancle">取 消</el-button>
        <el-button type="primary" @click="dialogSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 配置权限 -->
    <el-dialog
      title="角色权限配置"
      v-if="configDialogVisible"
      visible
      :before-close="configDialogCancel"
      customClass="customWidth">
      <el-form label-width="100px">
        <el-form-item label="当前角色">
          <el-input v-model="configDialogRole.role" disabled></el-input>
        </el-form-item>
      </el-form>
      <ModuleTree ref='moduleTree' :showOperateBtn='false' :defaultCheckedKeys='configDialogRole.defaultChecked'></ModuleTree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="configDialogCancel">取 消</el-button>
        <el-button type="primary" @click="configDialogSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </BasePage>
</template>

<script>
import { queryRole, addRole, addRolePermission } from '@/api/user'
import ModuleTree from '@/components/ModuleTree'

export default {
  name: 'user',
  components: {
    ModuleTree
  },
  data () {
    return {
      loading: false,
      keyword: '',
      tableData: [],
      form: {
        role: '',
        roleCode: ''
      },
      rules: {
        role: [{ required: true, message: '请输入角色名称' }],
        roleCode: [{ required: true, message: '请输入角色编码' }]
      },
      showDialog: false,
      configDialogVisible: false,
      configDialogRole: {
        id: '',
        role: '',
        defaultChecked: []
      }
    }
  },
  methods: {
    async getRoleList () {
      try {
        this.loading = true
        const res = await queryRole()
        if (res.status === 200) {
          this.tableData = res.data
        }
      } finally {
        this.loading = false
      }
    },
    editRole (rowData) {
      this.showDialog = true
      this.form = {
        role: rowData.role,
        roleCode: rowData.role_code,
        type: 'edit'
      }
    },
    deleteRole (rowData) {

    },
    addRoleBtn () {
      this.showDialog = true
    },
    dialogCancle () {
      this.showDialog = false
      this.$refs.roleRef.resetFields()
      this.form = {
        role: '',
        roleCode: ''
      }
    },
    dialogSubmit () {
      this.$refs.roleRef.validate(async (valid) => {
        if (valid) {
          const res = await addRole({ ...this.form })
          if (res.status === 200) {
            this.getRoleList()
            this.$message.success('新增角色成功！')
            this.dialogCancle()
          } else {
            this.$message.success('新增角色失败！')
          }
        }
      })
    },
    configDialogCancel () {
      this.configDialogRole = {
        id: '',
        role: '',
        defaultChecked: []
      }
      this.configDialogVisible = false
    },
    async configDialogSubmit () {
      const permissionId = this.$refs.moduleTree.getCheckedKey() || []
      const params = {
        permissionId,
        roleId: this.configDialogRole.id
      }
      if (permissionId.length) {
        const res = await addRolePermission(params)
        if (res.status === 200) {
          this.getRoleList()
          this.$message.success('角色赋权成功！')
          this.configDialogCancel()
        } else {
          this.$message.success('角色赋权失败！')
        }
      }
    },
    configPermission (rowData) {
      this.configDialogRole = JSON.parse(JSON.stringify(rowData))
      this.configDialogRole.defaultChecked = rowData.menu_id.split(',').map(item => Number(item))
      this.configDialogVisible = true
    }
  },
  created () {
    this.getRoleList()
  }
}
</script>

<style lang="scss">
.customWidth {
  width: 500px;
  padding: 0 30px 0 15px;
}
</style>
