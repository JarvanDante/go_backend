<template>
  <div class="journal-container">
    <el-card>
      <!-- 搜索条件 -->
      <div class="filter-box">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 380px"
        />

        <el-input
          v-model="query.username"
          placeholder="请输入操作账号"
          clearable
          style="width: 180px; margin-left: 10px"
        />

        <el-button type="primary" style="margin-left: 10px" @click="loadData">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </div>

      <!-- 列表 -->
      <el-table :data="list" border style="width: 100%; margin-top: 20px">
        <el-table-column label="员工账号" prop="username" width="120" align="center" />
        <el-table-column label="操作内容" prop="remark" min-width="200" />
        <el-table-column label="操作IP" prop="ip" width="150" align="center" />
        <el-table-column label="操作时间" prop="created_at" width="180" align="center" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-box">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
  import { reactive, ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { adminLogs } from '@/api/log'

  // 搜索条件
  const query = reactive({
    username: '',
    start: '',
    end: '',
    page: 1,
    size: 20
  })

  const dateRange = ref([])
  const list = ref([])
  const total = ref(0)

  // 加载数据
  const loadData = async () => {
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      query.start = dateRange.value[0]
      query.end = dateRange.value[1]
    } else {
      query.start = ''
      query.end = ''
    }

    const params = {
      username: query.username,
      start: query.start,
      end: query.end,
      page: query.page,
      size: query.size
    }

    const res = await adminLogs(params)
    if (res.code === 200) {
      list.value = res.data.list || []
      total.value = res.data.count || 0
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  }

  // 重置
  const resetQuery = () => {
    query.username = ''
    query.start = ''
    query.end = ''
    query.page = 1
    dateRange.value = []
    loadData()
  }

  // 初始化
  onMounted(() => {
    loadData()
  })
</script>

<style scoped>
  .journal-container {
    padding: 20px;
  }

  .filter-box {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .pagination-box {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-right: 10px;
  }
</style>
