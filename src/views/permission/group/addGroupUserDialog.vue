<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    :before-close="cancle"
    customClass="addGroupUser-dialog"
  >
    <el-transfer
      v-model="value"
      :data="data"
      :titles="transferTitles"
    ></el-transfer>

    <span slot="footer" class="dialog-footer">
      <el-button @click="cancle">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { queryUser, queryRole } from '@/api/user'
export default {
  name: 'addGroupUserDialog',
  props: {
    groupInfo: {
      type: Object,
      required: true,
      default: null
    }
  },
  data () {
    return {
      visible: true,
      title: '',
      isConfigUser: true,
      transferTitles: [],
      data: [],
      value: []
    }
  },
  watch: {
    groupInfo: {
      handler (newVal) {
        this.isConfigUser = newVal?.type === 'configUser'
        this.title = this.isConfigUser ? '添加组员' : '绑定角色'
        this.transferTitles = this.isConfigUser ? ['备选用户', '已选用户'] : ['备选角色', '已选角色']
        this.getList()
      },
      deep: true,
      immediate: true
    },
    defaultSelect: {
      handler (newVal) {
        this.value = newVal
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async getList () {
      try {
        this.loading = true
        const res = await (this.isConfigUser ? queryUser() : queryRole())
        if (res.status === 200) {
          this.data = res.data.map(item => {
            return {
              key: item.id,
              label: this.isConfigUser ? item.user_name : item.role
            }
          })

          this.value = (this.isConfigUser ? this.groupInfo.user_id : this.groupInfo.role_id)
            .split(',')
            .map(item => Number(item))
        }
      } finally {
        this.loading = false
      }
    },
    submit () {
      if (this.groupInfo) {
        this.$emit('submit', {
          type: this.groupInfo.type,
          groupId: Number(this.groupInfo.id),
          value: this.value
        })
      }
    },
    cancle () {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss">
.addGroupUser-dialog {
  width: 685px;
  padding: 0 30px;
}
</style>
