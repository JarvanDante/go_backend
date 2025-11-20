<template>
  <div class="register-setting">
    <el-card>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="注册页显示类型" />

        <el-table-column label="是否显示">
          <template #default="{ row }">
            <el-switch
              v-model="row.display"
              :active-value="1"
              :inactive-value="0"
              @change="updateSetting(row, 'display')"
            />
          </template>
        </el-table-column>

        <el-table-column label="是否必填">
          <template #default="{ row }">
            <el-switch
              v-model="row.required"
              :active-value="1"
              :inactive-value="0"
              @change="updateSetting(row, 'required')"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { registerSetting, updateRegisterSetting } from '@/api/site'

  const tableData = ref([])

  // 获取配置
  const loadData = async () => {
    const res = await registerSetting()
    if (res.code === 200) {
      tableData.value = res.data
    } else {
      ElMessage.error(res.message)
    }
  }

  // 修改配置（自动请求接口）
  const updateSetting = async (row, field) => {
    const req = {
      type: row.type,
      display: row.display,
      required: row.required
    }

    const res = await updateRegisterSetting(req)
    if (res.code === 200) {
      ElMessage.success('修改成功')
      loadData() // 修改后立即刷新
    } else {
      ElMessage.error(res.message)
    }
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped>
  .register-setting {
    padding: 20px;
  }
</style>
