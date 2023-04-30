<template>
  <div class="chat-page">
    <div class="chat-box">
      <div class="chat-box__record">
        <div
          class="record"
          v-for="(record, $index) in records"
          :key="$index"
          :class="[{ main: record.isSelf }]"
        >
          <div class="avatar"></div>
          <div class="message">{{ record.message }}</div>
        </div>
      </div>
      <div class="chat-box__send">
        <el-input
          ref="input"
          class="input"
          v-model="inputText"
          @keydown.enter.native="sendMessage"
        />
        <el-button class="button" @click="sendMessage">发 送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputText: "",
      ws: null,
      records: [],
    };
  },
  mounted() {
    this.connectToServer();
    this.$refs.input.focus();
  },
  methods: {
    sendMessage() {
      if (!this.inputText.trim()) return;
      this.ws.send(this.inputText);
      this.addRecord(this.inputText, true);
      this.inputText = "";
      this.$refs.input.focus();
    },
    addRecord(msg, isSelf) {
      this.records.push({
        // avatar:
        message: msg,
        isSelf,
      });
    },
    connectToServer() {
      const userId = this.$store.getters.userId;
      const ws = new WebSocket(`ws://localhost:3000/chat/${userId}`);

      ws.onopen = () => {
        console.log("chat服务已连接！");
      };
      ws.onmessage = (e) => {
        const msg = e.data;
        console.log("收到消息 => ", msg);
        this.addRecord(msg, false);
      };
      ws.onclose = () => {
        console.log("断开！");
      };
      ws.onerror = (err) => {
        console.log(err);
      };
      this.ws = ws;
    },
  },
};
</script>

<style lang="scss">
$border-color: #dcdfe6;
.chat-box {
  display: flex;
  flex-direction: column;
  min-height: 425px;
  padding: 10px 25px;
  border: 1px solid $border-color;
  border-radius: 4px;
  &__record {
    flex-grow: 1;
    height: 0;
		overflow: auto;
    .record {
      display: flex;
      margin-bottom: 12px;
      .avatar {
        width: 48px;
        height: 48px;
        border: 1px solid $border-color;
        border-radius: 8px;
        margin-right: 12px;
				flex-shrink: 0;
      }
      .message {
        line-height: 30px;
        font-size: 16px;
        border: 1px solid $border-color;
        border-radius: 8px;
        padding: 8px 20px;
				word-break: break-all;
      }
    }
    .record.main {
      flex-direction: row-reverse;
      .avatar {
        margin-right: 0;
        margin-left: 12px;
      }
      .message {
        background: green;
      }
    }
  }
  &__send {
    display: flex;
    .input {
      margin-right: 6px;
    }
    .button {
    }
  }
}
.chat-page {
  width: 100%;
  height: 100%;
  padding: 15px 25px;
}
</style>