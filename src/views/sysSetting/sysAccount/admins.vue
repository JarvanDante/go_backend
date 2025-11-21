<template>
  <div class="admin-container">
    <el-card>
      <!-- 搜索条件 -->
      <div class="filter-box">
        <el-select v-model="query.status" placeholder="所有状态" style="width: 150px">
          <el-option label="所有状态" :value="null" />
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>

        <el-input
          v-model="query.username"
          placeholder="请输入员工账号"
          clearable
          style="width: 180px; margin-left: 10px"
        />

        <el-button type="primary" style="margin-left: 10px" @click="loadData"> 查询 </el-button>

        <el-button @click="resetQuery">重置</el-button>

        <el-button type="primary" style="float: right" @click="openCreateDialog">
          添加员工
        </el-button>
      </div>

      <!-- 列表 -->
      <el-table :data="list" border style="width: 100%; margin-top: 20px">
        <el-table-column
          label="序号"
          type="index"
          width="60"
          align="center"
          :index="i => (query.page - 1) * query.size + i + 1"
        />
        <el-table-column label="ID" prop="id" width="80" align="center" />

        <el-table-column label="员工账号" prop="username" align="center" />

        <el-table-column label="昵称" prop="nickname" align="center" />

        <el-table-column label="职务" prop="admin_role_name" align="center" />

        <el-table-column label="登录IP" prop="last_login_ip" align="center">
          <template #default="{ row }">
            {{ row.last_login_ip || '未登陆' }}
          </template>
        </el-table-column>

        <el-table-column label="最后登陆时间" prop="last_login_time" width="180" align="center">
          <template #default="{ row }">
            {{ row.last_login_time || '未登陆' }}
          </template>
        </el-table-column>

        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.status === 1 ? 'green' : 'red' }">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button link @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="del(row)">删除</el-button>
            <el-button link @click="openLog(row)">操作日志</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <el-drawer v-model="logVisible" title="操作日志" size="40%">
      <el-timeline>
        <el-timeline-item v-for="item in logs" :key="item.id" :timestamp="item.time">
          {{ item.content }}
        </el-timeline-item>
      </el-timeline>
    </el-drawer>

    <!-- 新增/编辑 弹窗 -->
    <el-dialog :title="isEdit ? '编辑员工' : '新增员工'" v-model="dialogVisible" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="form.nickname" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="不修改请留空" />
        </el-form-item>

        <el-form-item label="职务">
          <el-select v-model="form.role" placeholder="选择职务">
            <el-option v-for="r in roles" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { reactive, ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { admins, createAdmin, updateAdmin, deleteAdmin } from '@/api/admin'
  import { getRoles } from '@/api/role'

  const logVisible = ref(false)
  const logs = ref([])

  const openLog = async row => {
    logVisible.value = true
    const res = await getAdminLogs({ id: row.id })
    logs.value = res.data
  }
  // 搜索条件
  const query = reactive({
    status: null,
    username: '',
    page: 1,
    size: 20
  })

  const list = ref([])
  const total = ref(0)
  const roles = ref([])

  const dialogVisible = ref(false)
  const isEdit = ref(false)

  const form = reactive({
    id: 0,
    username: '',
    nickname: '',
    password: '',
    role: '',
    status: 1
  })

  // 加载数据
  const loadData = async () => {
    const res = await admins(query)
    if (res.code !== 200) return ElMessage.error(res.message)

    list.value = res.data.list
    total.value = res.data.count
  }

  // 重置
  const resetQuery = () => {
    query.status = null
    query.username = ''
    query.page = 1
    loadData()
  }

  // 打开新增弹窗
  const openCreateDialog = () => {
    isEdit.value = false
    Object.assign(form, { id: 0, username: '', nickname: '', password: '', role: '', status: 1 })
    dialogVisible.value = true
  }

  // 打开编辑弹窗
  const openEditDialog = row => {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      username: row.username,
      nickname: row.nickname,
      password: '',
      role: row.admin_role_id,
      status: row.status
    })
    dialogVisible.value = true
  }

  // 提交表单
  const submitForm = async () => {
    let res

    if (isEdit.value) {
      res = await updateAdmin(form)
    } else {
      res = await createAdmin(form)
    }

    if (res.code === 200) {
      ElMessage.success('成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.message)
    }
  }

  // 删除
  const del = row => {
    ElMessageBox.confirm(`确定要删除员工【${row.username}】吗？`, '提示', {
      type: 'warning'
    }).then(async () => {
      const res = await deleteAdmin({ id: row.id })
      if (res.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error(res.message)
      }
    })
  }

  // 初始化
  onMounted(async () => {
    await loadData()
    const roleRes = await getRoles()
    roles.value = roleRes.data || []
  })
</script>

<style scoped>
  .el-table .el-table__body tr:hover > td {
    background-color: #f5f7fa !important;
  }

  .el-table .el-table__row--current > td {
    background: #e6f7ff !important;
  }
  .pagination-box {
    display: flex;
    justify-content: flex-end; /* 右下角 */
    margin-top: 20px;
    padding-right: 10px;
  }
  .admin-container {
    padding: 20px;
  }

  .filter-box {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }
</style>
