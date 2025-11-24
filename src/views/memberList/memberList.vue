<template>
  <div class="member-list-container">
    <el-card>
      <!-- 搜索条件 -->
      <div class="filter-box">
        <el-input v-model="query.username" placeholder="会员ID" clearable style="width: 150px" />
        <el-select
          v-model="query.grade"
          placeholder="所有等级"
          style="width: 150px; margin-left: 10px"
          clearable
        >
          <el-option
            v-for="grade in gradeList"
            :key="grade.id"
            :label="grade.name"
            :value="grade.id"
          />
        </el-select>
        <el-select
          v-model="query.level"
          placeholder="所有层级"
          style="width: 150px; margin-left: 10px"
          clearable
        >
          <el-option
            v-for="level in levelList"
            :key="level.id"
            :label="level.name"
            :value="level.id"
          />
        </el-select>
        <el-select
          v-model="query.status"
          placeholder="所有状态"
          style="width: 150px; margin-left: 10px"
          clearable
        >
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 380px; margin-left: 10px"
        />
        <el-select
          v-model="query.num"
          placeholder="每页20条"
          style="width: 120px; margin-left: 10px"
        >
          <el-option label="每页10条" :value="10" />
          <el-option label="每页20条" :value="20" />
          <el-option label="每页50条" :value="50" />
          <el-option label="每页100条" :value="100" />
        </el-select>
        <el-button type="primary" style="margin-left: 10px" @click="loadData">筛选</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="success" style="margin-left: 10px" @click="exportData">导出</el-button>
        <el-button style="margin-left: 10px" @click="openColumnDialog">自定义列</el-button>
      </div>
      <!-- 统计信息 -->
      <div class="stats-box">
        <span class="stats-item"
          >总会员数: <strong>{{ totalUsers }}</strong></span
        >
        <span class="stats-item"
          >总充值会员数: <strong>{{ totalChargeUsers }}</strong></span
        >
        <span class="stats-item"
          >当前筛选: <strong style="color: #f56c6c">{{ total }}</strong></span
        >
      </div>
      <!-- 列表 -->
      <el-table :data="list" border style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column
          label="序号"
          type="index"
          width="60"
          align="center"
          :index="i => (query.page - 1) * query.num + i + 1"
        />
        <el-table-column
          v-if="visibleColumns.username"
          label="会员账号"
          prop="username"
          width="140"
          align="center"
        >
          <template #default="{ row }">
            <span class="username-link" @click="viewDetail(row)">{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.grade_name"
          label="会员等级"
          prop="grade_name"
          width="100"
          align="center"
        />
        <el-table-column
          v-if="visibleColumns.level_name"
          label="会员层级"
          prop="level_name"
          width="100"
          align="center"
        />
        <el-table-column
          v-if="visibleColumns.agent_username"
          label="上级代理"
          prop="agent_username"
          width="120"
          align="center"
        >
          <template #default="{ row }">{{ row.agent_username || '-' }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.realname"
          label="真实姓名"
          prop="realname"
          width="120"
          align="center"
        >
          <template #default="{ row }">{{ row.realname || '-' }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.mobile"
          label="手机号"
          prop="mobile"
          width="130"
          align="center"
        >
          <template #default="{ row }">{{ row.mobile || '-' }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.email"
          label="邮箱"
          prop="email"
          width="180"
          align="center"
        >
          <template #default="{ row }">{{ row.email || '-' }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.pay_times"
          label="存款次数"
          prop="pay_times"
          width="100"
          align="center"
        >
          <template #default="{ row }">{{ row.pay_times || 0 }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.balance"
          label="账户余额"
          prop="balance"
          width="120"
          align="center"
        >
          <template #default="{ row }">{{ formatMoney(row.balance) }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.balance_frozen"
          label="冻结余额"
          prop="balance_frozen"
          width="120"
          align="center"
        >
          <template #default="{ row }">{{ formatMoney(row.balance_frozen) }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.points"
          label="积分"
          prop="points"
          width="100"
          align="center"
        >
          <template #default="{ row }">{{ row.points || 0 }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.register_ip"
          label="注册IP"
          prop="register_ip"
          width="140"
          align="center"
        >
          <template #default="{ row }">{{ row.register_ip || '-' }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.register_time"
          label="注册时间"
          prop="register_time"
          width="180"
          align="center"
        >
          <template #default="{ row }">{{ row.register_time || row.created_at }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.last_login_time"
          label="最后登录时间"
          prop="last_login_time"
          width="180"
          align="center"
        >
          <template #default="{ row }">{{ row.last_login_time || '-' }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.last_login_ip"
          label="最后登录IP"
          prop="last_login_ip"
          width="140"
          align="center"
        >
          <template #default="{ row }">{{ row.last_login_ip || '-' }}</template>
        </el-table-column>
        <el-table-column
          v-if="visibleColumns.last_login_address"
          label="最后登录地址"
          prop="last_login_address"
          width="150"
          align="center"
        >
          <template #default="{ row }">{{ row.last_login_address || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button link @click="editMember(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-box">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.num"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
    <!-- 自定义列弹窗 -->
    <el-dialog v-model="columnVisible" title="自定义列" width="600px">
      <div class="column-selector">
        <div class="tip">请选择不超过11个需要显示的内容！！！</div>
        <div class="column-grid">
          <el-checkbox
            v-for="col in availableColumns"
            :key="col.key"
            v-model="col.visible"
            :disabled="!col.visible && selectedCount >= 11"
          >
            {{ col.label }}
          </el-checkbox>
        </div>
      </div>
      <template #footer>
        <el-button @click="columnVisible = false">取消</el-button>
        <el-button type="primary" @click="saveColumns">确定</el-button>
      </template>
    </el-dialog>
    <!-- 会员详情弹窗 -->
    <el-dialog v-model="detailVisible" title="会员详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="会员ID">{{ currentMember.id }}</el-descriptions-item>
        <el-descriptions-item label="会员账号">{{ currentMember.username }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{
          currentMember.realname || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{
          currentMember.mobile || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentMember.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="会员等级">{{ currentMember.grade_name }}</el-descriptions-item>
        <el-descriptions-item label="会员层级">{{ currentMember.level_name }}</el-descriptions-item>
        <el-descriptions-item label="上级代理">{{
          currentMember.agent_username || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="账户余额">{{
          formatMoney(currentMember.balance)
        }}</el-descriptions-item>
        <el-descriptions-item label="冻结余额">{{
          formatMoney(currentMember.balance_frozen)
        }}</el-descriptions-item>
        <el-descriptions-item label="积分">{{ currentMember.points || 0 }}</el-descriptions-item>
        <el-descriptions-item label="存款次数">{{
          currentMember.pay_times || 0
        }}</el-descriptions-item>
        <el-descriptions-item label="注册IP">{{ currentMember.register_ip }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{
          currentMember.register_time || currentMember.created_at
        }}</el-descriptions-item>
        <el-descriptions-item label="最后登录IP">{{
          currentMember.last_login_ip || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="最后登录时间">{{
          currentMember.last_login_time || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentMember.status === 1 ? 'success' : 'danger'">{{
            currentMember.status === 1 ? '正常' : '禁用'
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="在线状态">
          <el-tag :type="currentMember.is_online === 1 ? 'success' : 'info'">{{
            currentMember.is_online === 1 ? '在线' : '离线'
          }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <!-- 编辑会员弹窗 -->
    <el-dialog v-model="editVisible" title="编辑会员" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="会员账号"
          ><el-input v-model="editForm.username" disabled
        /></el-form-item>
        <el-form-item label="真实姓名"
          ><el-input v-model="editForm.realname" placeholder="请输入真实姓名"
        /></el-form-item>
        <el-form-item label="手机号"
          ><el-input v-model="editForm.mobile" placeholder="请输入手机号"
        /></el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="editForm.grade_id" placeholder="请选择会员等级" style="width: 100%">
            <el-option
              v-for="grade in gradeList"
              :key="grade.id"
              :label="grade.name"
              :value="grade.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="会员层级">
          <el-select v-model="editForm.level_id" placeholder="请选择会员层级" style="width: 100%">
            <el-option
              v-for="level in levelList"
              :key="level.id"
              :label="level.name"
              :value="level.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态"
          ><el-switch v-model="editForm.status" :active-value="1" :inactive-value="0"
        /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { reactive, ref, onMounted, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import request from '@/utils/request'

  const loading = ref(false)
  const dateRange = ref([])
  const query = reactive({
    username: '',
    grade: null,
    level: null,
    status: null,
    start_date: '',
    end_date: '',
    page: 1,
    num: 20
  })
  const list = ref([])
  const total = ref(0)
  const totalUsers = ref(0)
  const totalChargeUsers = ref(0)
  const gradeList = ref([])
  const levelList = ref([])
  const detailVisible = ref(false)
  const editVisible = ref(false)
  const columnVisible = ref(false)
  const currentMember = ref({})
  const editForm = reactive({
    id: 0,
    username: '',
    realname: '',
    mobile: '',
    grade_id: null,
    level_id: null,
    status: 1
  })

  // 可见列配置
  const visibleColumns = reactive({
    username: true,
    grade_name: true,
    level_name: true,
    agent_username: true,
    realname: false,
    mobile: false,
    email: false,
    pay_times: true,
    balance: true,
    balance_frozen: false,
    points: true,
    register_ip: true,
    register_time: true,
    last_login_time: false,
    last_login_ip: false,
    last_login_address: false
  })

  // 可选列配置
  const availableColumns = ref([
    { key: 'username', label: '会员账号', visible: true },
    { key: 'grade_name', label: '会员等级', visible: true },
    { key: 'level_name', label: '会员层级', visible: true },
    { key: 'agent_username', label: '上级代理', visible: true },
    { key: 'realname', label: '真实姓名', visible: false },
    { key: 'mobile', label: '手机号', visible: false },
    { key: 'email', label: '邮箱', visible: false },
    { key: 'pay_times', label: '存款次数', visible: true },
    { key: 'balance', label: '账户余额', visible: true },
    { key: 'balance_frozen', label: '冻结余额', visible: false },
    { key: 'points', label: '积分', visible: true },
    { key: 'register_ip', label: '注册IP', visible: true },
    { key: 'register_time', label: '注册时间', visible: true },
    { key: 'last_login_time', label: '最后登录时间', visible: false },
    { key: 'last_login_ip', label: '最后登录IP', visible: false },
    { key: 'last_login_address', label: '最后登录地址', visible: false }
  ])

  const selectedCount = computed(() => availableColumns.value.filter(col => col.visible).length)

  const formatMoney = value => {
    if (!value && value !== 0) return '0.00'
    return Number(value).toFixed(2)
  }

  const loadData = async () => {
    loading.value = true
    try {
      if (dateRange.value && dateRange.value.length === 2) {
        query.start_date = dateRange.value[0]
        query.end_date = dateRange.value[1]
      } else {
        query.start_date = ''
        query.end_date = ''
      }
      const res = await request({ url: '/api/backend/users', method: 'get', params: query })
      if (res.code === 200) {
        list.value = res.data.list || []
        total.value = res.data.count || 0
        totalUsers.value = res.data.total_users || 0
        totalChargeUsers.value = res.data.total_charge_users || 0
      } else {
        ElMessage.error(res.message || '获取数据失败')
      }
    } catch (error) {
      ElMessage.error('获取数据失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const resetQuery = () => {
    query.username = ''
    query.grade = null
    query.level = null
    query.status = null
    dateRange.value = []
    query.start_date = ''
    query.end_date = ''
    query.page = 1
    query.num = 20
    loadData()
  }

  const viewDetail = row => {
    currentMember.value = { ...row }
    detailVisible.value = true
  }

  const editMember = row => {
    Object.assign(editForm, {
      id: row.id,
      username: row.username,
      realname: row.realname || '',
      mobile: row.mobile || '',
      grade_id: row.grade_id,
      level_id: row.level_id,
      status: row.status
    })
    editVisible.value = true
  }

  const submitEdit = async () => {
    try {
      const res = await request({ url: '/api/backend/update-user', method: 'post', data: editForm })
      if (res.code === 200) {
        ElMessage.success('编辑成功')
        editVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.message || '编辑失败')
      }
    } catch (error) {
      ElMessage.error('编辑失败')
      console.error(error)
    }
  }

  const exportData = () => {
    ElMessage.info('导出功能开发中...')
  }

  const openColumnDialog = () => {
    availableColumns.value.forEach(col => {
      col.visible = visibleColumns[col.key]
    })
    columnVisible.value = true
  }

  const saveColumns = () => {
    if (selectedCount.value > 11) {
      ElMessage.warning('最多只能选择11个列')
      return
    }
    availableColumns.value.forEach(col => {
      visibleColumns[col.key] = col.visible
    })
    localStorage.setItem('memberListColumns', JSON.stringify(visibleColumns))
    columnVisible.value = false
    ElMessage.success('保存成功')
  }

  const loadGradeList = async () => {
    try {
      const res = await request({ url: '/api/backend/user-grades', method: 'get' })
      if (res.code === 200) {
        gradeList.value = res.data || []
      }
    } catch (error) {
      console.error('获取会员等级失败', error)
    }
  }

  const loadLevelList = async () => {
    try {
      const res = await request({ url: '/api/backend/user-levels', method: 'get' })
      if (res.code === 200) {
        levelList.value = res.data || []
      }
    } catch (error) {
      console.error('获取会员层级失败', error)
    }
  }

  onMounted(async () => {
    const savedColumns = localStorage.getItem('memberListColumns')
    if (savedColumns) {
      Object.assign(visibleColumns, JSON.parse(savedColumns))
    }
    await loadData()
    await loadGradeList()
    await loadLevelList()
  })
</script>

<style scoped>
  .member-list-container {
    padding: 20px;
  }
  .filter-box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 0;
  }
  .stats-box {
    margin-top: 15px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    gap: 30px;
  }
  .stats-item {
    font-size: 14px;
    color: #606266;
  }
  .stats-item strong {
    color: #409eff;
    font-size: 16px;
  }
  .pagination-box {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding-right: 10px;
  }
  .el-table :deep(.el-table__body tr:hover > td) {
    background-color: #f5f7fa !important;
  }
  .el-table :deep(.el-table__row--current > td) {
    background: #e6f7ff !important;
  }
  .column-selector {
    padding: 10px;
  }
  .column-selector .tip {
    color: #f56c6c;
    font-size: 14px;
    margin-bottom: 15px;
    padding: 10px;
    background: #fef0f0;
    border-radius: 4px;
  }
  .column-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px 20px;
  }
  .column-grid .el-checkbox {
    margin: 0;
  }
  .username-link {
    color: #409eff;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s;
  }
  .username-link:hover {
    color: #66b1ff;
    text-decoration: underline;
  }
</style>
