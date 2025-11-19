<template>
  <div class="brand-setting">
    <el-card>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="160px">
        <!-- 品牌名称 -->
        <el-form-item label="品牌名称" prop="site_name">
          <el-input v-model="form.site_name" placeholder="请输入品牌名称" disabled></el-input>
        </el-form-item>

        <!-- 商户标识 -->
        <el-form-item label="商户标识" prop="site_code">
          <el-input v-model="form.site_code" placeholder="请输入商户标识" disabled></el-input>
        </el-form-item>

        <!-- 单笔最低 & 最高提现金额 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单笔最低提现金额" prop="min_withdraw">
              <el-input v-model="form.min_withdraw"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单笔最高提现金额" prop="max_withdraw">
              <el-input v-model="form.max_withdraw"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 在线客服链接 -->
        <el-form-item label="在线客服链接地址">
          <el-input v-model="form.service_url"></el-input>
        </el-form-item>

        <!-- 代理平台链接 -->
        <el-form-item label="代理平台链接地址" prop="agent_url">
          <el-input v-model="form.agent_url"></el-input>
        </el-form-item>

        <!-- 代理推广地址 -->
        <el-form-item label="代理推广地址" prop="agent_register_url">
          <el-input v-model="form.agent_register_url"></el-input>
        </el-form-item>

        <!-- APP 下载地址 -->
        <el-form-item label="手机APP下载地址" prop="mobile_url">
          <el-input v-model="form.mobile_url"></el-input>
        </el-form-item>

        <!-- LOGO 上传 -->
        <el-form-item label="手机端LOGO">
          <el-upload
            class="logo-uploader"
            action=""
            :http-request="uploadLogo"
            :show-file-list="false"
          >
            <img v-if="form.mobile_logo" :src="form.mobile_logo" class="logo-preview" />
            <div v-else class="upload-box">
              <el-icon><Plus /></el-icon>
            </div>
          </el-upload>

          <span class="tips">图片大小 100KB 内，支持 svg</span>
        </el-form-item>

        <!-- 同 IP 重复注册 -->
        <el-form-item label="同一IP重复注册">
          <el-input v-model="form.register_time_interval">
            <template #append>分钟</template>
          </el-input>
          <span class="tips">设定时间内，同一IP将无法进行多次注册。0或留空表示不限制</span>
        </el-form-item>

        <!-- 是否开放注册 -->
        <el-form-item label="是否开放注册">
          <el-radio-group v-model="form.switch_register">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 关闭网站 -->
        <el-form-item label="暂时关闭网站">
          <el-radio-group v-model="form.is_close">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submit">保存</el-button>
          <el-button @click="reset">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'

  import { basicSetting, updateBasicSetting } from '@/api/setting'

  const formRef = ref(null)

  const form = ref({
    // site_name: '',
    // site_code: '',
    min_withdraw: 0,
    max_withdraw: 0,
    service_url: '',
    agent_url: '',
    agent_register_url: '',
    mobile_url: '',
    mobile_logo: '',
    register_time_interval: 0,
    switch_register: 1,
    is_close: 0
  })

  const rules = {
    // site_name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
    // site_code: [{ required: true, message: '请输入商户标识', trigger: 'blur' }],
    agent_url: [{ required: true, message: '请输入代理链接地址', trigger: 'blur' }],
    mobile_url: [{ required: true, message: '请输入手机域名地址', trigger: 'blur' }],
    agent_register_url: [{ required: true, message: '请输入代理推广地址', trigger: 'blur' }],
    min_withdraw: [{ required: true, message: '请输入最低提现', trigger: 'blur' }],
    max_withdraw: [{ required: true, message: '请输入最高提现', trigger: 'blur' }]
  }

  /**
   * 加载设置
   */
  const loadSetting = async () => {
    const res = await basicSetting()

    if (res.code !== 200) {
      ElMessage.error(res.message || '加载配置失败')
      return
    }

    Object.assign(form.value, res.data)
  }

  onMounted(() => {
    loadSetting()
  })

  /**
   * Logo 上传
   */
  const uploadLogo = async options => {
    const fd = new FormData()
    fd.append('file', options.file)

    const res = await request.post('/upload/logo', fd)

    form.value.mobile_logo = res.data.url
    ElMessage.success('上传成功')
  }

  /**
   * 保存
   */
  const submit = () => {
    formRef.value.validate(async valid => {
      if (!valid) return

      const res = await updateBasicSetting(form.value)

      if (res.code === 200) {
        ElMessage.success(res.message)
        loadSetting()
      } else {
        ElMessage.error(res.message)
      }
    })
  }

  /**
   * 重置
   */
  const reset = () => {
    formRef.value.resetFields()
  }
</script>

<style scoped>
  .brand-setting {
    padding: 20px;
  }

  .upload-box {
    width: 80px;
    height: 80px;
    border: 1px dashed #ccc;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo-preview {
    width: 80px;
    height: 80px;
    border-radius: 6px;
  }

  .tips {
    margin-left: 10px;
    color: #999;
  }
</style>
