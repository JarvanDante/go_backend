<template>
  <div class="app-container">
    <!-- 表单区域 -->
    <el-form :model="form" label-width="160px" class="form-panel">
      <el-form-item label="品牌名称：">
        <el-input v-model="form.brand_name" placeholder="请输入品牌名称" />
      </el-form-item>

      <el-form-item label="商户标识：">
        <el-input v-model="form.merchant_code" placeholder="by" />
      </el-form-item>

      <el-form-item label="可用额度：">
        <span>{{ form.balance }}</span>
      </el-form-item>

      <el-form-item label="单笔最低提现金额：">
        <el-input v-model="form.min_withdraw" />
      </el-form-item>

      <el-form-item label="单笔最高提现金额：">
        <el-input v-model="form.max_withdraw" />
      </el-form-item>

      <el-form-item label="在线客服链接地址：">
        <el-input v-model="form.service_url" />
      </el-form-item>

      <el-form-item label="代理平台注册地址：">
        <el-input v-model="form.agent_register_url" />
      </el-form-item>

      <el-form-item label="代理推广地址：">
        <el-input v-model="form.agent_url" />
      </el-form-item>

      <el-form-item label="手机APP下载地址：">
        <el-input v-model="form.mobile_url" />
      </el-form-item>

      <el-form-item label="手机端LOGO：">
        <el-upload class="logo-uploader" action="#" :auto-upload="false">
          <el-button type="primary">+</el-button>
          <div class="el-upload__tip">图片大小100KB内，支持扩展名 svg</div>
        </el-upload>
      </el-form-item>

      <el-form-item label="同一IP重复注册：">
        <el-input v-model="form.ip_limit" style="width: 100px" />
        <span>&nbsp;分钟</span>
      </el-form-item>

      <el-form-item label="是否开放注册：">
        <el-radio-group v-model="form.allow_register">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="暂时关闭网站：">
        <el-radio-group v-model="form.site_close">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <el-button type="primary">保存</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const activeTab = ref('basic')

  const form = ref({
    brand_name: '博雅',
    merchant_code: 'by',
    balance: '300000',
    min_withdraw: '500',
    max_withdraw: '999999999',
    service_url: '',
    agent_url: '',
    agent_register_url: '',
    mobile_url: '',
    ip_limit: 5,
    allow_register: 1,
    site_close: 0
  })
</script>

<style scoped>
  .custom-tabs {
    margin-bottom: 20px;
  }

  .form-panel {
    background: #fff;
    padding: 20px 30px;
    border-radius: 6px;
  }

  .logo-uploader .el-upload__tip {
    margin-left: 10px;
    color: #888;
  }
</style>
