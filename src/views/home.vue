<template>
  <BasePage>
    <h2>欢迎回来~ {{ $store.getters.nickname }}</h2>

    <!-- 文件上传 -->
    <i class="el-icon-loading"></i>
    <div ref="drag" id="drag">
      <input type="file" name="file" @change="handleFilerChange" />
    </div>

    <div>
      <el-progress
        :text-inside="true"
        :stroke-width="15"
        :percentage="uploadProgress"
      ></el-progress>
    </div>
    <div>
      <el-progress
        :text-inside="true"
        :stroke-width="15"
        :percentage="hashProgress"
      ></el-progress>
    </div>

    <div>
      <!-- 区块进度条
      chunk.progress < 0 报错 现实红色 -->
      <div class="cube-container" :style="{ width: cubeWidth + 'px' }">
        <div class="cube" v-for="chunk in chunks" :key="chunk.name">
          <div
            :class="{
              uploading: chunk.progress > 0 && chunk.progress < 100,
              success: chunk.progress === 100,
              error: chunk.progress < 0,
            }"
            :style="{ height: chunk.progress + '%' }"
          >
            <i
              class="el-icon-loading"
              style="color: #f56c6c"
              v-if="chunk.progress < 100 && chunk.progress > 0"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <el-button type="primary" @click="uploadFile">上传</el-button>
  </BasePage>
</template>

<script>
import { getUserInfo } from "@/api/user"
import SparkMD5 from "spark-md5"
import sparkMd5 from "spark-md5"

const CHUNK_SIZE = 0.5 * 1024 * 1024
export default {
  name: "home",
  components: {},
  data() {
    return {
      file: null,
      // uploadProgress: 0,
      chunks: [],
      hash: "",
      worker: null,
      hashProgress: 0,
    }
  },
  computed: {
    cubeWidth() {
      return Math.ceil(Math.sqrt(this.chunks.length)) * 16
    },
    uploadProgress() {
      if (!this.file || this.chunks.length) {
        return 0
      }
      const loaded = this.chunks
        .map((item) => item.chunk.size * item.progress)
        .reduce((acc, cur) => acc + cur, 0)
      return parseInt(((loaded * 100) / this.file.size).toFixed(2))
    },
  },
  mounted() {
    getUserInfo()
    this.bindEvent()
  },
  methods: {
    bindEvent() {
      const drag = this.$refs.drag
      drag.addEventListener("dragover", (e) => {
        drag.style.borderColor = "red"
        e.preventDefault()
      })
      drag.addEventListener("dragleave", (e) => {
        drag.style.borderColor = "#ccc"
        e.preventDefault()
      })
      drag.addEventListener("drop", (e) => {
        const fileList = e.dataTransfer.files
        drag.style.borderColor = "#ccc"
        this.file = fileList[0]
        console.log(this.file)
        e.preventDefault()
      })
    },
    async blobToString(blob) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = function () {
          const ret = reader.result
            .split("")
            .map((v) => v.charCodeAt())
            .map((v) => v.toString(16).toUpperCase())
            // .map(v => v.padStart(2, '0'))
            .join(" ")

          resolve(ret)
        }
        reader.readAsBinaryString(blob)
      })
    },
    async isGif(file) {
      // 前面几个字符/6个十六进制
      // GIF89a 或 GIF87a
      // '47 49 46 38 39 61' 或 '47 49 46 38 37 61'
      const ret = await this.blobToString(file.slice(0, 6))
      const isGif = ret === "47 49 46 38 39 61" || ret === "47 49 46 38 37 61"
      return isGif
    },
    async isPng(file) {
      // 前8个
      const ret = await this.blobToString(file.slice(0, 8))
      const isPng = ret === "89 50 4E 47 D A 1A A"
      return isPng
    },
    async isJpg(file) {
      // 前、后
      const len = file.size
      const start = await this.blobToString(file.slice(0, 2))
      const tail = await this.blobToString(file.slice(-2, len))
      const isJpg = start === "FF D8" && tail === "FF D9"
      return isJpg
    },
    async isImage(file) {
      // 通过文件流来判定
      return (
        (await this.isGif(file)) ||
        (await this.isPng(file)) ||
        (await this.isJpg(file))
      )
    },
    handleFilerChange(e) {
      const [file] = e.target.files
      if (!file) return
      this.file = file
    },
    createFileChunk(file, size = CHUNK_SIZE) {
      const chunks = []
      let cur = 0
      while (cur < file.size) {
        chunks.push({ index: cur, file: file.slice(cur, cur + size) })
        cur += size
      }
      return chunks
    },
    async calculateHashWorker() {
      return new Promise((resolve) => {
        this.worker = new Worker("/hash.js")
        this.worker.postMessage({ chunks: this.chunks })
        this.worker.onmessage = (e) => {
          const { progress, hash } = e.data
          this.hashProgress = Number(progress.toFixed(2))
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    async calculateHashIdle() {
      const chunks = this.chunks
      return new Promise((resolve) => {
        const spark = new SparkMD5.ArrayBuffer()
        let count = 0

        const appendToSpark = async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = (e) => {
              spark.append(e.target.result)
              resolve()
            }
          })
        }

        const workLoop = async (deadline) => {
          while (count < chunks.length && deadline.timeRemaining() > 1) {
            // 空闲时间，且有任务
            await appendToSpark(chunks[count].file)
            count++
            if (count < chunks.length) {
              this.hashProgress = Number(
                (100 * count) / chunks.length.toFixed(2)
              )
            } else {
              this.hashProgress = 100
              resolve(spark.end())
            }
          }
          window.requestIdleCallback(workLoop)
        }
        window.requestIdleCallback(workLoop)
      })
    },
    async calculateHashSample() {
      // 布隆过滤器 判断一个数据存在与否
      // 1G的文件，抽样后5M以内，所以快
      return new Promise((resolve) => {
        const spark = new sparkMd5.ArrayBuffer()
        const reader = new FileReader()

        const file = this.file
        const size = file.size
        const offset = 2 * 1024 * 1024
        // 第一个2M，最后一个区块全要，中间的取前中后各2个字节
        let chunks = [file.slice(0, offset)]

        let cur = offset
        while (cur < size) {
          if (cur + offset >= size) {
            // 最后一个
            chunks.push(file.slice(cur, cur + offset))
          } else {
            // 中间
            const mid = cur + offset / 2
            const end = cur + offset
            chunks.push(file.slice(cur, cur + 2))
            chunks.push(file.slice(mid, mid + 2))
            chunks.push(file.slice(end - 2, end))
          }
          cur += offset
        }
        reader.readAsArrayBuffer(new Blob(chunks))
        reader.onload = (e) => {
          spark.append(e.target.result)
          this.hashProgress = 100
          resolve(spark.end())
        }
      })
    },
    async uploadFile() {
      if (!this.file) return

      // 1.文件格式限制
      // if (!await this.isImage(this.file)) {
      //   this.$message.info('文件必须为png/gif/jpg')
      //   return
      // }

      // 2.文件切片
      const chunks = this.createFileChunk(this.file)
      // const hash = await this.calculateHashWorker()
      // console.log(hash)
      // const hash1 = await this.calculateHashIdle()
      // console.log(hash1)
      const hash = await this.calculateHashSample()
      this.hash = hash

      // 询问后端，文件是否上传过，若没有，是否有存在的碎片
      const {
        data: { uploaded, uploadedList },
      } = await this.$http.post("/checkfile", {
        hash: this.hash,
        ext: this.file.name.split(".").pop(),
      })

      if (uploaded) {
        // 秒传功能
        return this.$message.success("秒传成功！")
      }

      // 切片上传
      this.chunks = chunks.map((chunk, index) => {
        const name = hash + "-" + index
        return {
          hash,
          name,
          index,
          chunk: chunk.file,
          // 断点续传：已经上传的根据uploadedList设置100
          progress: uploadedList.includes(name)  ? 100 : 0,
          // progress: 0
        }
      })

      await this.uploadChunks(uploadedList)
      await this.mergefile()

      // 3.文件Form普通上传
      // const form = new FormData()
      // form.append('name', 'file')
      // form.append('file', this.file)

      // const ret = await this.$http.post('/uploadfile', form, {
      //   onUploadProgress: progress => {
      //     this.uploadProgress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
      //   }
      // })
      // console.log(ret)
    },
    async uploadChunks(uploadedList) {
      const requests = this.chunks
        .filter(chunk => !uploadedList.includes(chunk.name))
        .map((chunk, index) => {
          const form = new FormData()
          form.append("chunk", chunk.chunk)
          form.append("hash", chunk.hash)
          form.append("name", chunk.name)
          // form.append('index', chunk.index) // 这个可以不传，后端不怎么需要
          return { form, index: chunk.index, error: 0 }
        })
        // 无并发控制
        // .map(({ form, index }) =>
        //   this.$http.post("/uploadfile", form, {
        //     onUploadProgress: (progress) => {
        //       // 这块是每个区块的进度条，整体需要计算获得
        //       this.chunks[index].progress = Number(
        //         ((progress.loaded / progress.total) * 100).toFixed(2)
        //       )
        //     },
        //   })
        // )
      // 并发控制
      await this.sendRequest(requests)
      // await Promise.all(requests)
    },
    async mergefile() {
      // 请求合并切片文件
      this.$http.post("/mergefile", {
        ext: this.file.name.split(".").pop(),
        size: CHUNK_SIZE,
        hash: this.hash,
      })
    },
    async sendRequest(chunks, limit = 3) {
      // limit并发数
      // 一个数组，长度为limit
      // [task1, task2, task3]
      return new Promise((resolve, reject) => {
        const len = chunks.length
        let count = 0
        let isStop = false

        const start = async () => {
          if (isStop) return

          const task = chunks.shift()
          if (task) {
            const { form, index } = task

            // 上传可能报错
            // 报错之后，进度条变红，并开始重试
            // 一个切片重试三次，整体全部终结
            try {
              await this.$http.post("/uploadfile", form, {
                onUploadProgress: (progress) => {
                  // 这块是每个区块的进度条，整体需要计算获得
                  this.chunks[index].progress = Number(
                    ((progress.loaded / progress.total) * 100).toFixed(2)
                  )
                }
              })
              if (count === len - 1) {
                // 最后一个任务，结束战斗
                resolve()
              } else {
                count++
                // 启动下一个任务（结束一个，新增一个）
                start()
              }
            } catch (e) {
              this.chunks[index].progress = -1
              // 重试三次
              if (task.error < 3) {
                task.error++
                chunks.unshift(task)
                start()
              } else {
                isStop = true
                reject()
              }
            }
          }
        }

        while (limit > 0) {
          // 一次性循环启动limit个任务
          start()
          limit -= 1
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
#drag {
  height: 100px;
  width: 500px;
  border: 1px dashed #ccc;
  text-align: center;
  line-height: 100px;

  // &:hover {
  //   border-color: red;
  //   cursor: pointer;
  // }
}
.cube-container {
  height: 16px;
  .cube {
    width: 14px;
    height: 14px;
    line-height: 12px;
    border: 1px solid black;
    background: #eee;
    float: left;
    > .success {
      background: green;
    }
    > .uploading {
      background: blue;
    }
    > .error {
      background: red;
    }
  }
}
</style>
