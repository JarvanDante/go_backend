<template>
  <div class="rebate-setting-container">
    <el-card>
      <!-- 左侧规则列表 -->
      <div class="layout-wrapper">
        <div class="sidebar">
          <div class="sidebar-header">
            <el-button type="primary" size="small" @click="addRule">添加规则</el-button>
          </div>
          <div class="rule-list">
            <div
              v-for="rule in ruleList"
              :key="rule.id"
              :class="['rule-item', { active: currentRuleId === rule.id }]"
              @click="selectRule(rule.id)"
            >
              <span class="rule-name">{{ rule.name }}</span>
              <div class="rule-actions">
                <el-button link size="small" @click.stop="editRule(rule)" class="edit-btn">
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click.stop="deleteRule(rule)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧配置区域 -->
        <div class="content-area">
          <div v-if="currentRule" class="rule-config">
            <!-- 规则条件列表 -->
            <div
              v-for="(option, index) in currentRule.option_list"
              :key="option.id"
              class="option-card"
            >
              <div class="option-header">
                <div class="option-range">
                  <span class="label">单日有效投注范围</span>
                  <el-input-number
                    v-model="option.min"
                    :min="0"
                    :precision="2"
                    :controls="false"
                    style="width: 120px"
                  />
                  <span class="unit">元</span>
                  <span class="separator">~</span>
                  <el-input-number
                    v-model="option.max"
                    :min="0"
                    :precision="2"
                    :controls="false"
                    style="width: 120px"
                  />
                  <span class="unit">元</span>
                </div>
                <div class="option-actions">
                  <el-button type="primary" size="small" @click="saveOption(option)">
                    保存
                  </el-button>
                  <el-button size="small" @click="loadData">取消</el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="deleteOption(option)"
                    v-if="currentRule.option_list.length > 1"
                  >
                    删除
                  </el-button>
                </div>
              </div>

              <!-- 游戏返水比例表格 -->
              <div class="game-table">
                <table>
                  <thead>
                    <tr>
                      <th>体育</th>
                      <th>彩票</th>
                      <th>真人视讯</th>
                      <th>电子游戏</th>
                      <th>棋牌</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, rowIndex) in getTableRows(option.percent_list)"
                      :key="rowIndex"
                    >
                      <td>
                        <div v-if="row.sports" class="game-row">
                          <span class="game-name">{{ row.sports.name }}</span>
                          <div class="percent-input">
                            <el-input-number
                              v-model="row.sports.percent"
                              :min="0"
                              :max="100"
                              :precision="2"
                              :controls="false"
                              size="small"
                              style="width: 60px"
                            />
                            <span class="unit">%</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div v-if="row.lottery" class="game-row">
                          <span class="game-name">{{ row.lottery.name }}</span>
                          <div class="percent-input">
                            <el-input-number
                              v-model="row.lottery.percent"
                              :min="0"
                              :max="100"
                              :precision="2"
                              :controls="false"
                              size="small"
                              style="width: 60px"
                            />
                            <span class="unit">%</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div v-if="row.live" class="game-row">
                          <span class="game-name">{{ row.live.name }}</span>
                          <div class="percent-input">
                            <el-input-number
                              v-model="row.live.percent"
                              :min="0"
                              :max="100"
                              :precision="2"
                              :controls="false"
                              size="small"
                              style="width: 60px"
                            />
                            <span class="unit">%</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div v-if="row.slot" class="game-row">
                          <span class="game-name">{{ row.slot.name }}</span>
                          <div class="percent-input">
                            <el-input-number
                              v-model="row.slot.percent"
                              :min="0"
                              :max="100"
                              :precision="2"
                              :controls="false"
                              size="small"
                              style="width: 60px"
                            />
                            <span class="unit">%</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div v-if="row.poker" class="game-row">
                          <span class="game-name">{{ row.poker.name }}</span>
                          <div class="percent-input">
                            <el-input-number
                              v-model="row.poker.percent"
                              :min="0"
                              :max="100"
                              :precision="2"
                              :controls="false"
                              size="small"
                              style="width: 60px"
                            />
                            <span class="unit">%</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 添加条件按钮 -->
            <div class="add-option-btn">
              <el-button type="primary" @click="addOption">+ 添加</el-button>
            </div>
          </div>

          <el-empty v-else description="请选择一个规则" />
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑规则弹窗 -->
    <el-dialog :title="ruleDialogTitle" v-model="ruleDialogVisible" width="400px">
      <el-form :model="ruleForm" label-width="80px">
        <el-form-item label="规则名称">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    getRebateSetting,
    createRebateRule,
    updateRebateRule,
    deleteRebateRule,
    createRebateOption,
    updateRebateOption,
    deleteRebateOption
  } from '@/api/member'

  const ruleList = ref([])
  const currentRuleId = ref(null)
  const ruleDialogVisible = ref(false)
  const isEditRule = ref(false)

  const ruleForm = reactive({
    id: 0,
    name: ''
  })

  const ruleDialogTitle = computed(() => (isEditRule.value ? '编辑规则' : '添加规则'))

  const currentRule = computed(() => {
    return ruleList.value.find(r => r.id === currentRuleId.value)
  })

  // 将游戏列表按类型分组到表格行
  const getTableRows = gameList => {
    if (!gameList || gameList.length === 0) return []

    // 按类型分组：1=体育；2=彩票；3=真人；4=电子游戏；5=棋牌
    const typeGroups = {
      1: [], // 体育
      2: [], // 彩票
      3: [], // 真人
      4: [], // 电子游戏
      5: [] // 棋牌
    }

    gameList.forEach(game => {
      if (typeGroups[game.type]) {
        typeGroups[game.type].push(game)
      }
    })

    // 找出最大行数
    const maxRows = Math.max(
      typeGroups[1].length,
      typeGroups[2].length,
      typeGroups[3].length,
      typeGroups[4].length,
      typeGroups[5].length
    )

    // 构建表格行
    const rows = []
    for (let i = 0; i < maxRows; i++) {
      rows.push({
        sports: typeGroups[1][i] || null, // 体育
        lottery: typeGroups[2][i] || null, // 彩票
        live: typeGroups[3][i] || null, // 真人
        slot: typeGroups[4][i] || null, // 电子游戏
        poker: typeGroups[5][i] || null // 棋牌
      })
    }

    return rows
  }

  // 加载数据
  const loadData = async () => {
    try {
      const res = await getRebateSetting()
      if (res.code === 200) {
        // 转换数据格式
        ruleList.value = res.data.rule_list.map(rule => ({
          id: rule.id,
          name: rule.name,
          option_list: rule.option_list.map(option => ({
            id: option.id,
            min: parseFloat(option.min),
            max: parseFloat(option.max),
            percent_list: option.percent_list.map(game => ({
              id: game.id,
              name: game.name,
              type: game.type, // 1=体育；2=彩票；3=真人；4=电子游戏；5=棋牌
              percent: parseFloat(game.percent)
            }))
          }))
        }))

        if (ruleList.value.length > 0 && !currentRuleId.value) {
          currentRuleId.value = ruleList.value[0].id
        }
      } else {
        ElMessage.error(res.message || '获取数据失败')
      }
    } catch (error) {
      ElMessage.error('获取数据失败')
      console.error(error)
    }
  }

  // 选择规则
  const selectRule = ruleId => {
    currentRuleId.value = ruleId
  }

  // 添加规则
  const addRule = () => {
    isEditRule.value = false
    ruleForm.id = 0
    ruleForm.name = ''
    ruleDialogVisible.value = true
  }

  // 编辑规则
  const editRule = rule => {
    isEditRule.value = true
    ruleForm.id = rule.id
    ruleForm.name = rule.name
    ruleDialogVisible.value = true
  }

  // 提交规则
  const submitRule = async () => {
    if (!ruleForm.name) {
      ElMessage.warning('请输入规则名称')
      return
    }

    try {
      let res
      if (isEditRule.value) {
        res = await updateRebateRule({ id: ruleForm.id, name: ruleForm.name })
      } else {
        res = await createRebateRule({ name: ruleForm.name })
      }

      if (res.code === 200) {
        ElMessage.success(isEditRule.value ? '编辑成功' : '添加成功')
        ruleDialogVisible.value = false
        loadData()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      ElMessage.error('操作失败')
      console.error(error)
    }
  }

  // 删除规则
  const deleteRule = rule => {
    ElMessageBox.confirm(`确定要删除规则【${rule.name}】吗？`, '提示', {
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await deleteRebateRule(rule.id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
            if (currentRuleId.value === rule.id) {
              currentRuleId.value = null
            }
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

  // 添加条件
  const addOption = async () => {
    try {
      const res = await createRebateOption({ id: currentRuleId.value })
      if (res.code === 200) {
        ElMessage.success('添加成功')
        loadData()
      } else {
        ElMessage.error(res.message || '添加失败')
      }
    } catch (error) {
      ElMessage.error('添加失败')
      console.error(error)
    }
  }

  // 保存条件
  const saveOption = async option => {
    if (option.min >= option.max) {
      ElMessage.warning('有效投注范围设置不合理')
      return
    }

    try {
      // 确保percent_list包含所有必要字段
      const gameList = option.percent_list.map(game => ({
        id: game.id,
        name: game.name,
        type: game.type,
        percent: game.percent
      }))

      const content = JSON.stringify(gameList)
      const res = await updateRebateOption({
        id: option.id,
        min: option.min,
        max: option.max,
        content
      })

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

  // 删除条件
  const deleteOption = option => {
    ElMessageBox.confirm('确定要删除该条件吗？', '提示', {
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await deleteRebateOption(option.id)
          if (res.code === 200) {
            ElMessage.success('删除成功')
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

  onMounted(() => {
    loadData()
  })
</script>

<style scoped>
  .rebate-setting-container {
    padding: 20px;
  }

  .layout-wrapper {
    display: flex;
    gap: 20px;
    min-height: 600px;
  }

  .sidebar {
    width: 200px;
    border-right: 1px solid #e4e7ed;
    padding-right: 20px;
  }

  .sidebar-header {
    margin-bottom: 15px;
  }

  .rule-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rule-item {
    padding: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .rule-item:hover {
    background: #f5f7fa;
    border-color: #409eff;
  }

  .rule-item.active {
    background: #ecf5ff;
    border-color: #409eff;
  }

  .rule-name {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
  }

  .rule-actions {
    display: flex;
    gap: 8px;
  }

  .edit-btn {
    color: #409eff;
  }

  .edit-btn:hover {
    color: #66b1ff;
  }

  .content-area {
    flex: 1;
  }

  .rule-config {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .option-card {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 20px;
    background: #fff;
  }

  .option-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e4e7ed;
  }

  .option-range {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .option-range .label {
    font-weight: 500;
    color: #606266;
  }

  .option-range .unit {
    color: #909399;
  }

  .option-range .separator {
    color: #909399;
    margin: 0 5px;
  }

  .option-actions {
    display: flex;
    gap: 10px;
  }

  .game-table {
    overflow-x: auto;
  }

  .game-table table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .game-table th,
  .game-table td {
    border: 1px solid #e4e7ed;
    padding: 12px;
    text-align: center;
    width: 20%;
  }

  .game-table th {
    background: #f5f7fa;
    font-weight: 600;
    color: #606266;
  }

  .game-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0 10px;
  }

  .game-name {
    flex-shrink: 0;
    color: #606266;
    font-size: 13px;
  }

  .percent-input {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .percent-input .unit {
    color: #606266;
    font-size: 13px;
  }

  .add-option-btn {
    text-align: center;
    padding: 20px;
  }

  :deep(.el-input-number .el-input__wrapper) {
    padding: 0 8px;
  }

  :deep(.el-input__inner) {
    text-align: center;
  }
</style>
