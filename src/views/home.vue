<template>
  <BasePage>
    <h2>欢迎回来~ {{ $store.getters.nickname }}</h2>

    <!-- 文件上传 -->
    <div ref="drag" id="drag">
      <input type="file" name="file" @change="handleFilerChange">
    </div>

    <div>
      <el-progress :text-inside="true" :stroke-width="15" :percentage="uploadProgress"></el-progress>
    </div>
    <div>
      <el-progress :text-inside="true" :stroke-width="15" :percentage="hashProgress"></el-progress>
    </div>

    <el-button type="primary" @click="uploadFile">上传</el-button>
  </BasePage>
</template>

<script>
import {
  getUserInfo
} from '@/api/user'
import SparkMD5 from 'spark-md5'

const CHUNK_SIZE = 0.5 * 1024 * 1024
export default {
  name: 'home',
  components: {
  },
  data () {
    return {
      file: null,
      uploadProgress: 0,
      chunks: [],
      worker: null,
      hashProgress: 0
    }
  },
  mounted () {
    getUserInfo()
    this.bindEvent()
  },
  methods: {
    bindEvent () {
      const drag = this.$refs.drag
      drag.addEventListener('dragover', e => {
        drag.style.borderColor = 'red'
        e.preventDefault()
      })
      drag.addEventListener('dragleave', e => {
        drag.style.borderColor = '#ccc'
        e.preventDefault()
      })
      drag.addEventListener('drop', e => {
        const fileList = e.dataTransfer.files
        drag.style.borderColor = '#ccc'
        this.file = fileList[0]
        console.log(this.file)
        e.preventDefault()
      })
    },
    async blobToString (blob) {
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = function () {
          const ret = reader.result.split('')
            .map(v => v.charCodeAt())
            .map(v => v.toString(16).toUpperCase())
            // .map(v => v.padStart(2, '0'))
            .join(' ')

          resolve(ret)
        }
        reader.readAsBinaryString(blob)
      })
    },
    async isGif (file) {
      // 前面几个字符/6个十六进制
      // GIF89a 或 GIF87a
      // '47 49 46 38 39 61' 或 '47 49 46 38 37 61'
      const ret = await this.blobToString(file.slice(0, 6))
      const isGif = ret === '47 49 46 38 39 61' || ret === '47 49 46 38 37 61'
      return isGif
    },
    async isPng (file) {
      // 前8个
      const ret = await this.blobToString(file.slice(0, 8))
      const isPng = ret === '89 50 4E 47 D A 1A A'
      return isPng
    },
    async isJpg (file) {
      // 前、后
      const len = file.size
      const start = await this.blobToString(file.slice(0, 2))
      const tail = await this.blobToString(file.slice(-2, len))
      const isJpg = (start === 'FF D8') && (tail === 'FF D9')
      return isJpg
    },
    async isImage (file) {
      // 通过文件流来判定
      return await this.isGif(file) || await this.isPng(file) || await this.isJpg(file)
    },
    handleFilerChange (e) {
      const [file] = e.target.files
      if (!file) return
      this.file = file
    },
    createFileChunk (file, size = CHUNK_SIZE) {
      const chunks = []
      let cur = 0
      while (cur < file.size) {
        chunks.push({ index: cur, file: file.slice(cur, cur + size) })
        cur += size
      }
      return chunks
    },
    async calculateHashWorker () {
      return new Promise(resolve => {
        this.worker = new Worker('/hash.js')
        this.worker.postMessage({ chunks: this.chunks })
        this.worker.onmessage = e => {
          const { progress, hash } = e.data
          this.hashProgress = Number(progress.toFixed(2))
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    async calculateHashIdle () {
      const chunks = this.chunks
      return new Promise(resolve => {
        const spark = new SparkMD5.ArrayBuffer()
        let count = 0

        const appendToSpark = async file => {
          return new Promise(resolve => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = e => {
              spark.append(e.target.result)
              resolve()
            }
          })
        }

        const workLoop = async deadline => {
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
    async uploadFile () {
      // 1.文件格式限制
      // if (!await this.isImage(this.file)) {
      //   this.$message.info('文件必须为png/gif/jpg')
      //   return
      // }

      // 2.文件切片
      this.chunks = this.createFileChunk(this.file)
      const hash = await this.calculateHashWorker()
      console.log(hash)
      // const hash1 = await this.calculateHashIdle()
      // console.log(hash1)

      // 3.文件上传
      // const form = new FormData()
      // form.append('name', 'file')
      // form.append('file', this.file)

      // const ret = await this.$http.post('/uploadfile', form, {
      //   onUploadProgress: progress => {
      //     this.uploadProgress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
      //   }
      // })
      // console.log(ret)
    }
  }
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
</style>
