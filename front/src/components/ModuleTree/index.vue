<template>
  <BasePage>
    <el-tree
      :data='treeData'
      ref='tree'
      node-key='id'
      v-loading='loading'
      :show-checkbox='showCheckBox'
      :default-checked-keys.sync='defaultCheckedKeys'
      default-expand-all
      :expand-on-click-node='false'
    >
      <span class='custom-tree-node' slot-scope='{ node, data }'>
        <span>{{ data.menu_name }}</span>
        <span v-if="showOperateBtn">
          <el-button v-if="!data.noChild" type='text' size='mini' @click='() => config(data, "append")'>新增子模块</el-button>
          <el-button type='text' size='mini' @click='() => config(data, "edit")'>编辑</el-button>
          <el-button type='text' size='mini' @click='() => remove(node, data)'>删除</el-button>
        </span>
      </span>
    </el-tree>

    <!-- 添加子模块 -->
    <el-dialog
      :title="configType === 'append' ? '新增子模块' : '编辑节点'"
      :visible.sync="showDialog"
      :before-close="dialogCancle"
      customClass="customWidth">
      <el-form ref="dialogRef" label-width="100px" :model="form" :rules="rules">
        <el-form-item v-if="configType === 'append'" label="父模块名称" prop="parent_menu_name">
          <el-input v-model="form.parent_menu_name" disabled></el-input>
        </el-form-item>
        <el-form-item :label="configType === 'append' ? '子模块名称' : '节点名称'" prop="menu_name">
          <el-input v-model="form.menu_name"></el-input>
        </el-form-item>
        <!-- <el-form-item :label="configType === 'append' ? '子模块编码' : '节点编码'" prop="menu_code">
          <el-input v-model="form.menu_code"></el-input>
        </el-form-item> -->
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCancle">取 消</el-button>
        <el-button type="primary" @click="dialogSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </BasePage>
</template>

<script>
import {
  getPermissionInfo,
  addOrEditPermission,
  delPermission
} from '@/api/user'

export default {
  props: {
    showCheckBox: {
      type: Boolean,
      default: true
    },
    showOperateBtn: {
      type: Boolean,
      default: true
    },
    defaultCheckedKeys: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      loading: false,
      showDialog: false,
      treeData: [],
      form: {
        parent_menu_id: '',
        parent_menu_name: '',
        menu_name: '',
        menu_code: ''
      },
      rules: {
        menu_name: [{ required: true, message: '请输入子模块名称' }]
        // menu_code: [{ required: true, message: '请输入子模块编码' }]
      },
      configType: ''
    }
  },

  methods: {
    async getPermissionInfo () {
      try {
        this.loading = true
        const res = await getPermissionInfo()
        if (res.status === 200) {
          this.treeData = this.handleRes(res.data || [])
          // console.log(this.defaultCheckedKeys)
          // this.defaultCheckedKeys = [15, 14, 13, 12, 11, 10, 9, 8, 19]
        }
      } finally {
        this.loading = false
      }
    },
    handleRes (data) {
      return data.map((item) => {
        if (item.child?.length) {
          item.children = this.handleRes(item.child)
          // 子模块不支持新增子模块
          item.children.forEach(item => { item.noChild = true })
        } else {
          item.children = []
        }
        return item
      })
    },
    dialogCancle () {
      this.showDialog = false
      this.$refs.dialogRef.resetFields()
    },
    dialogSubmit () {
      this.$refs.dialogRef.validate(async (valid) => {
        if (valid) {
          const params = {
            id: this.form.id,
            menuName: this.form.menu_name,
            menuCode: this.form.menu_code,
            parentId: this.form.parent_menu_id
            // permissionType:
          }
          const res = await addOrEditPermission(params)
          if (res.status === 200) {
            this.getPermissionInfo()
            this.dialogCancle()
          }
        }
      })
    },
    config (data, type) {
      this.configType = type
      if (type === 'append') {
        this.form = {
          parent_menu_id: data.id,
          parent_menu_name: data.menu_name,
          menu_name: '',
          menu_code: ''
        }
      } else {
        this.form = {
          id: data.id,
          parent_menu_id: data.parent_id,
          parent_menu_name: '',
          menu_name: data.menu_name,
          menu_code: data.menu_code
        }
      }
      this.showDialog = true
    },
    remove (node, data) {
      this.$confirm('确认删除该模块节点？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delPermission({
          ids: [data.id]
        })
        if (res.status === 200) {
          node.remove()
          this.$message.success('删除菜单成功！')
        }
      })
    },
    getCheckedKey () {
      return this.$refs.tree.getCheckedKeys()
    }
  },
  created () {
    this.getPermissionInfo()
  }
}
</script>

<style lang="scss">
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.customWidth {
  width: 500px;
  padding-right: 30px;
}
</style>
