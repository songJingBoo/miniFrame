<template>
  <el-dialog
    title="绑定角色"
    :visible.sync="visible"
    :before-close="cancle"
    customClass="addGroupUser-dialog"
  >
    <el-transfer
      v-model="value"
      :data="data"
      :titles="['备选角色', '已选角色']"
    ></el-transfer>

    <span slot="footer" class="dialog-footer">
      <el-button @click="cancle">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { queryRole } from '@/api/user'
export default {
  name: 'addGroupUserDialog',
  props: {
    userInfo: {
      type: Object,
      required: true,
      default: null
    }
  },
  data () {
    return {
      visible: true,
      data: [],
      value: []
    }
  },
  created () {
    this.getList()
  },
  methods: {
    async getList () {
      try {
        this.loading = true
        const res = await queryRole()
        if (res.status === 200) {
          this.data = res.data.map(item => {
            return {
              key: item.id,
              label: item.role
            }
          })

          this.value = this.userInfo.role_id
            .split(',')
            .map(item => Number(item))
        }
      } finally {
        this.loading = false
      }
    },
    submit () {
      if (this.userInfo) {
        this.$emit('submit', {
          userIds: [this.userInfo.id],
          roleIds: this.value
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
