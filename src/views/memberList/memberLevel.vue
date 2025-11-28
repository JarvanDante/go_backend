<template>
  <div class="member-level-container">
    <el-card>
      <div class="layout-wrapper">
        <!-- 左侧层级列表 -->
        <div class="sidebar">
          <div class="sidebar-header">
            <h3>层级列表</h3>
            <el-button type="primary" size="small" @click="addLevel">添加层级</el-button>
          </div>
          <div class="level-list">
            <div
              v-for="level in levelList"
              :key="level.id"
              :class="['level-item', { active: currentLevelId === level.id }]"
              @click="selectLevel(level.id)"
            >
              <span class="level-name">{{ level.name }}</span>
              <el-tag v-if="level.is_default" type="success" size="small">默认</el-tag>
            </div>
          </div>
        </div>

        <!-- 右侧配置区域 -->
        <div class="content-area">
          <div v-if="currentLevel" class="level-config">
            <!-- 标签页 -->
            <el-tabs v-model="activeTab" class="config-tabs">
              <el-tab-pane label="会员层级-编辑" name="edit">
                <div class="tab-actions">
                  <el-button type="primary" size="small">编辑</el-button>
                  <el-button size="small" v-if="!currentLevel.is_default">删除</el-button>
                </div>
                <div class="form-container">
                  <div class="form-row">
                    <div class="form-label">层级</div>
                    <div class="form-value">
                      <el-tag type="primary" size="small">{{ levelForm.name }}</el-tag>
                    </div>
                    <div class="form-label right-label">银行转账</div>
                    <div class="form-value"></div>
                  </div>
                  <div class="form-row">
                    <div class="form-label">可用转账</div>
                    <div class="form-value"></div>
                    <div class="form-label right-label">微信转账</div>
                    <div class="form-value"></div>
                  </div>
                  <div class="form-row">
                    <div class="form-label">短信充值</div>
                    <div class="form-value"></div>
                    <div class="form-label right-label">支付宝转账</div>
                    <div class="form-value"></div>
                  </div>
                  <div class="form-row">
                    <div class="form-label">返水</div>
                    <div class="form-value">
                      <el-tag type="primary" size="small">WAVE</el-tag>
                    </div>
                    <div class="form-label right-label">QQ钱包</div>
                    <div class="form-value"></div>
                  </div>
                  <div class="form-row">
                    <div class="form-label">支付宝</div>
                    <div class="form-value"></div>
                    <div class="form-label right-label">财付通转账</div>
                    <div class="form-value"></div>
                  </div>
                  <div class="form-row">
                    <div class="form-label">支付宝APP</div>
                    <div class="form-value"></div>
                    <div class="form-label right-label"></div>
                    <div class="form-value"></div>
                  </div>
                </div>
              </el-tab-pane>

              <el-tab-pane label="会员层级配置" name="config">
                <div class="tab-content">
                  <el-empty description="暂无数据" />
                </div>
              </el-tab-pane>

              <el-tab-pane label="已选中的会员层级" name="selected">
                <div class="tab-content">
                  <el-empty description="暂无数据" />
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>

          <el-empty v-else description="请选择一个层级" />
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑层级弹窗 -->
    <el-dialog :title="levelDialogTitle" v-model="levelDialogVisible" width="500px">
      <el-form :model="levelDialogForm" label-width="120px">
        <el-form-item label="层级名称">
          <el-input v-model="levelDialogForm.name" placeholder="请输入层级名称" />
        </el-form-item>
        <el-form-item label="是否返水">
          <el-radio-group v-model="levelDialogForm.is_rebate">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="返水规则" v-if="levelDialogForm.is_rebate === 1">
          <el-select
            v-model="levelDialogForm.rebate_rule_id"
            placeholder="请选择返水规则"
            style="width: 100%"
          >
            <el-option
              v-for="rule in rebateRuleOptions"
              :key="rule.id"
              :label="rule.name"
              :value="rule.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单日提款次数">
          <el-input-number
            v-model="levelDialogForm.daily_withdraw_times"
            :min="0"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="levelDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitLevel">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    getUserLevels,
    createUserLevel,
    getUpdateUserLevel,
    updateUserLevel,
    deleteUserLevel
  } from '@/api/member'

  const levelList = ref([])
  const currentLevelId = ref(null)
  const levelDialogVisible = ref(false)
  const isEditLevel = ref(false)
  const activeTab = ref('edit')
  const transferOptions = ref([])
  const paymentOptions = ref([])
  const rebateRuleOptions = ref([])

  const levelForm = reactive({
    id: 0,
    name: '',
    is_rebate: 0,
    rebate_rule_id: null,
    daily_withdraw_times: 0,
    transfer_account_list: [],
    payment_account_list: [],
    alipay: '',
    alipay_wap: ''
  })

  const levelDialogForm = reactive({
    id: 0,
    name: '',
    is_rebate: 0,
    rebate_rule_id: null,
    daily_withdraw_times: 0
  })

  const levelDialogTitle = computed(() => (isEditLevel.value ? '编辑层级' : '添加层级'))

  const currentLevel = computed(() => {
    return levelList.value.find(l => l.id === currentLevelId.value)
  })

  // 加载数据
  const loadData = async () => {
    try {
      const res = await getUserLevels()
      if (res.code === 200) {
        levelList.value = res.data || []

        if (levelList.value.length > 0) {
          if (!currentLevelId.value) {
            currentLevelId.value = levelList.value[0].id
          }
          const level = levelList.value.find(l => l.id === currentLevelId.value)
          if (level) {
            loadLevelDetail(level)
          }
        }
      } else {
        ElMessage.error(res.message || '获取数据失败')
      }
    } catch (error) {
      ElMessage.error('获取数据失败')
      console.error(error)
    }
  }

  // 加载层级详情
  const loadLevelDetail = level => {
    Object.assign(levelForm, {
      id: level.id,
      name: level.name,
      is_rebate: level.is_rebate,
      rebate_rule_id: level.rebate_rule_id,
      daily_withdraw_times: level.daily_withdraw_times,
      transfer_account_list: level.transfer_account_list || [],
      payment_account_list: level.payment_account_list || [],
      alipay: '',
      alipay_wap: ''
    })
  }

  // 选择层级
  const selectLevel = levelId => {
    currentLevelId.value = levelId
    const level = levelList.value.find(l => l.id === levelId)
    if (level) {
      loadLevelDetail(level)
    }
  }

  // 添加层级
  const addLevel = () => {
    isEditLevel.value = false
    Object.assign(levelDialogForm, {
      id: 0,
      name: '',
      is_rebate: 0,
      rebate_rule_id: null,
      daily_withdraw_times: 3
    })
    levelDialogVisible.value = true
  }

  // 编辑层级名称
  const editLevelName = () => {
    isEditLevel.value = true
    Object.assign(levelDialogForm, {
      id: levelForm.id,
      name: levelForm.name,
      is_rebate: levelForm.is_rebate,
      rebate_rule_id: levelForm.rebate_rule_id,
      daily_withdraw_times: levelForm.daily_withdraw_times
    })
    levelDialogVisible.value = true
  }

  // 提交层级
  const submitLevel = async () => {
    if (!levelDialogForm.name) {
      ElMessage.warning('请输入层级名称')
      return
    }

    try {
      let res
      if (isEditLevel.value) {
        res = await updateUserLevel(levelDialogForm)
      } else {
        res = await createUserLevel(levelDialogForm)
      }

      if (res.code === 200) {
        ElMessage.success(isEditLevel.value ? '编辑成功' : '添加成功')
        levelDialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }

  // 保存层级配置
  const saveLevel = async () => {
    try {
      const res = await updateUserLevel(levelForm)
      if (res.code === 200) {
        ElMessage.success('保存成功')
        loadData()
      } else {
        ElMessage.error(res.message || '保存失败')
      }
    } catch (error) {
      ElMessage.error('保存失败')
      console.error(error)
    }
  }

  // 删除层级
  const deleteLevel = () => {
    ElMessageBox.confirm(`确定要删除层级【${currentLevel.value.name}】吗？`, '提示', {
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await deleteUserLevel(currentLevel.value.id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            currentLevelId.value = null
            loadData()
          } else {
            ElMessage.error(res.message || '删除失败')
          }
        } catch (error) {
          ElMessage.error('删除失败')
          console.error(error)
        }
      })
      .catch(() => {})
  }

  // 加载选项数据
  const loadOptions = async () => {
    // TODO: 加载转账接口、支付接口、返水规则选项
    transferOptions.value = [
      { id: 1, name: '银行转账' },
      { id: 2, name: '微信转账' },
      { id: 3, name: '支付宝转账' }
    ]

    paymentOptions.value = [
      { id: 1, name: '网银支付' },
      { id: 2, name: '微信支付' },
      { id: 3, name: '支付宝支付' }
    ]

    rebateRuleOptions.value = [{ id: 1, name: 'WAVE' }]
  }

  onMounted(() => {
    loadData()
    loadOptions()
  })
</script>

<style scoped>
  .member-level-container {
    padding: 20px;
  }

  .layout-wrapper {
    display: flex;
    gap: 20px;
    min-height: 600px;
  }

  .sidebar {
    width: 250px;
    border-right: 1px solid #e4e7ed;
    padding-right: 20px;
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .sidebar-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .level-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .level-item {
    padding: 15px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .level-item:hover {
    background: #f5f7fa;
    border-color: #409eff;
  }

  .level-item.active {
    background: #ecf5ff;
    border-color: #409eff;
  }

  .level-name {
    font-weight: 500;
    color: #606266;
  }

  .content-area {
    flex: 1;
  }

  .level-config {
    background: #fff;
  }

  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px solid #e4e7ed;
    margin-bottom: 20px;
  }

  .config-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }

  .config-tabs {
    border: 1px solid #dcdfe6;
  }

  .config-tabs :deep(.el-tabs__header) {
    margin: 0;
    background: #fff;
    padding: 0;
  }

  .config-tabs :deep(.el-tabs__nav-wrap) {
    padding: 0 20px;
  }

  .config-tabs :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: #dcdfe6;
  }

  .config-tabs :deep(.el-tabs__item) {
    padding: 0 20px;
    height: 45px;
    line-height: 45px;
    font-size: 14px;
  }

  .config-tabs :deep(.el-tabs__content) {
    padding: 0;
  }

  .tab-actions {
    display: flex;
    gap: 10px;
    padding: 15px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .form-container {
    padding: 20px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 100px 1fr 100px 1fr;
    gap: 15px;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    align-items: center;
  }

  .form-row:last-child {
    border-bottom: none;
  }

  .form-label {
    color: #606266;
    font-size: 14px;
    text-align: left;
  }

  .form-label.right-label {
    text-align: left;
  }

  .form-value {
    color: #303133;
    font-size: 14px;
  }

  .tab-content {
    padding: 40px 20px;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
