<template>
  <BasePage>
    <div class='module-tree-wrap'>
      <h3>菜单配置</h3>
      <el-tree
        :data='treeData'
        ref='tree'
        node-key='id'
        v-loading='loading'
        :show-checkbox='false'
        :default-checked-keys='defaultCheckedKeys'
        default-expand-all
        :expand-on-click-node='false'
        >
        <span class='custom-tree-node' slot-scope='{ data }'>
            <span>{{ data.menu_name }}</span>
            <span >
            <el-button type='text' size='mini' @click='config(data)'>配置</el-button>
            </span>
        </span>
        </el-tree>

        <!-- 配置菜单 -->
        <el-dialog
            title="配置菜单"
            :visible.sync="showDialog"
            :before-close="dialogCancle"
            customClass="customWidth">
            <el-form ref="dialogRef" label-width="100px" :model="form" :rules="rules">
                <el-form-item label="模块名称" prop="menu_name">
                    <el-input v-model="form.menu_name" disabled></el-input>
                </el-form-item>
                <el-form-item label="模块编码" prop="menu_code">
                    <el-input v-model="form.menu_code"></el-input>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogCancle">取 消</el-button>
                <el-button type="primary" @click="dialogSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
  </BasePage>
</template>

<script>
import {
  getPermissionInfo,
  addOrEditPermission
} from '@/api/user'

export default {
  props: {
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
        id: '',
        menu_code: '',
        menu_name: '',
        parent_id: ''
      },
      rules: {
        menu_code: [{ required: true, message: '请输入模块编码' }]
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
            menuCode: this.form.menu_code,
            menuName: this.form.menu_name,
            parentId: this.form.parent_id
          }
          const res = await addOrEditPermission(params)
          if (res.status === 200) {
            this.getPermissionInfo()
            this.dialogCancle()
            this.$store.dispatch('updateMenu')
            this.$message.success('菜单配置成功！')
          }
        }
      })
    },
    config (data) {
      this.form = {
        id: data.id,
        menu_code: data.menu_code,
        menu_name: data.menu_name,
        parent_id: data.parent_id
      }
      this.showDialog = true
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

.module-tree-wrap {
  width: 540px;
  box-shadow: #ccc 0px 2px 8px;
  padding: 20px;

  h3 {
    padding: 0 25px;
  }
}
</style>
