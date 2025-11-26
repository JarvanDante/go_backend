<template>
  <div class="member-grade-container">
    <el-card>
      <div class="header-actions">
        <el-button type="primary" @click="saveAllGrades">保存配置</el-button>
        <el-button @click="loadData">刷新</el-button>
      </div>

      <!-- 横向滚动表格容器 -->
      <div class="table-scroll-wrapper">
        <table class="grade-table">
          <thead>
            <tr>
              <th class="fixed-col">等级名称</th>
              <th v-for="grade in grades" :key="grade.id">
                <div class="grade-header">
                  <el-input v-model="grade.name" placeholder="等级名称" style="width: 100px" />
                  <el-button
                    type="danger"
                    link
                    size="small"
                    @click="removeGrade(grade)"
                    style="margin-left: 5px"
                  >
                    删除
                  </el-button>
                </div>
              </th>
              <th class="add-col">
                <el-button type="primary" link @click="addGrade">+</el-button>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- 会员数量 -->
            <tr>
              <td class="fixed-col label-col">会员数量</td>
              <td v-for="grade in grades" :key="'count-' + grade.id">
                <span class="readonly-value">{{ grade.memberCount || 0 }}</span>
              </td>
              <td class="add-col"></td>
            </tr>

            <!-- 首级消耗积分 -->
            <tr>
              <td class="fixed-col label-col">首级消耗积分</td>
              <td v-for="grade in grades" :key="'points-' + grade.id">
                <el-input-number
                  v-model="grade.requiredPoints"
                  :min="0"
                  :controls="false"
                  style="width: 100px"
                />
              </td>
              <td class="add-col"></td>
            </tr>

            <!-- 首级彩金 -->
            <tr>
              <td class="fixed-col label-col">
                <el-checkbox v-model="allGrades.firstBonusEnabled" @change="toggleAllFirstBonus" />
                首级彩金
              </td>
              <td v-for="grade in grades" :key="'firstBonus-' + grade.id">
                <div class="input-with-unit">
                  <el-input-number
                    v-model="grade.firstBonus"
                    :min="0"
                    :controls="false"
                    :disabled="!allGrades.firstBonusEnabled"
                    style="width: 80px"
                  />
                  <span class="unit">元</span>
                </div>
              </td>
              <td class="add-col"></td>
            </tr>

            <!-- 生日彩金 -->
            <tr>
              <td class="fixed-col label-col">
                <el-checkbox
                  v-model="allGrades.birthdayBonusEnabled"
                  @change="toggleAllBirthdayBonus"
                />
                生日彩金
              </td>
              <td v-for="grade in grades" :key="'birthdayBonus-' + grade.id">
                <div class="input-with-unit">
                  <el-input-number
                    v-model="grade.birthdayBonus"
                    :min="0"
                    :controls="false"
                    :disabled="!allGrades.birthdayBonusEnabled"
                    style="width: 80px"
                  />
                  <span class="unit">元</span>
                </div>
              </td>
              <td class="add-col"></td>
            </tr>

            <!-- 额外返水可领 - 标题行 -->
            <tr class="section-header">
              <td class="fixed-col label-col" colspan="100%">额外返水可领</td>
            </tr>

            <!-- 体育 -->
            <tr>
              <td class="fixed-col label-col sub-label">体育</td>
              <td v-for="grade in grades" :key="'sports-' + grade.id">
                <div class="input-with-unit">
                  <el-input-number
                    v-model="grade.rebate.sports"
                    :min="0"
                    :max="100"
                    :precision="4"
                    :step="0.0001"
                    :controls="false"
                    style="width: 80px"
                  />
                  <span class="unit">%</span>
                </div>
              </td>
              <td class="add-col"></td>
            </tr>

            <!-- 彩票 -->
            <tr>
              <td class="fixed-col label-col sub-label">彩票</td>
              <td v-for="grade in grades" :key="'lottery-' + grade.id">
                <div class="input-with-unit">
                  <el-input-number
                    v-model="grade.rebate.lottery"
                    :min="0"
                    :max="100"
                    :precision="4"
                    :step="0.0001"
                    :controls="false"
                    style="width: 80px"
                  />
                  <span class="unit">%</span>
                </div>
              </td>
              <td class="add-col"></td>
            </tr>

            <!-- 真人视讯 -->
            <tr>
              <td class="fixed-col label-col sub-label">真人视讯</td>
              <td v-for="grade in grades" :key="'live-' + grade.id">
                <div class="input-with-unit">
                  <el-input-number
                    v-model="grade.rebate.live"
                    :min="0"
                    :max="100"
                    :precision="4"
                    :step="0.0001"
                    :controls="false"
                    style="width: 80px"
                  />
                  <span class="unit">%</span>
                </div>
              </td>
              <td class="add-col"></td>
            </tr>

            <!-- 电子游戏 -->
            <tr>
              <td class="fixed-col label-col sub-label">电子游戏</td>
              <td v-for="grade in grades" :key="'slot-' + grade.id">
                <div class="input-with-unit">
                  <el-input-number
                    v-model="grade.rebate.slot"
                    :min="0"
                    :max="100"
                    :precision="4"
                    :step="0.0001"
                    :controls="false"
                    style="width: 80px"
                  />
                  <span class="unit">%</span>
                </div>
              </td>
              <td class="add-col"></td>
            </tr>

            <!-- 捕鱼 -->
            <tr>
              <td class="fixed-col label-col sub-label">捕鱼</td>
              <td v-for="grade in grades" :key="'fishing-' + grade.id">
                <div class="input-with-unit">
                  <el-input-number
                    v-model="grade.rebate.fishing"
                    :min="0"
                    :max="100"
                    :precision="4"
                    :step="0.0001"
                    :controls="false"
                    style="width: 80px"
                  />
                  <span class="unit">%</span>
                </div>
              </td>
              <td class="add-col"></td>
            </tr>

            <!-- 专属活动 -->
            <tr>
              <td class="fixed-col label-col">专属活动<br />(活动管理中配置)</td>
              <td v-for="grade in grades" :key="'activity-' + grade.id">
                <span class="readonly-value">-</span>
              </td>
              <td class="add-col"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { getMemberGrades, saveMemberGrades, deleteMemberGrade } from '@/api/member'

  const grades = ref([])
  const fieldsDisable = ref('')
  const autoProviding = ref('')

  const allGrades = reactive({
    firstBonusEnabled: true,
    birthdayBonusEnabled: true
  })

  // 加载数据
  const loadData = async () => {
    try {
      const res = await getMemberGrades()
      if (res.code === 200) {
        // 转换后端数据格式为前端格式
        grades.value = res.data.map(item => ({
          id: item.id,
          name: item.name,
          memberCount: item.user_count || 0,
          requiredPoints: item.points_upgrade || 0,
          firstBonus: parseFloat(item.bonus_upgrade) || 0,
          birthdayBonus: parseFloat(item.bonus_birthday) || 0,
          rebate: {
            sports: parseFloat(item.rebate_percent_sports) || 0,
            lottery: parseFloat(item.rebate_percent_lottery) || 0,
            live: parseFloat(item.rebate_percent_live) || 0,
            slot: parseFloat(item.rebate_percent_egame) || 0,
            fishing: 0
          }
        }))

        // 获取字段配置（从第一个等级）
        if (res.data.length > 0 && res.data[0].fields_disable) {
          fieldsDisable.value = res.data[0].fields_disable
        }
        if (res.data.length > 0 && res.data[0].auto_providing) {
          autoProviding.value = res.data[0].auto_providing
        }

        ElMessage.success('数据已刷新')
      } else {
        ElMessage.error(res.message || '获取数据失败')
      }
    } catch (error) {
      ElMessage.error('获取数据失败')
      console.error(error)
    }
  }

  // 保存所有等级配置
  const saveAllGrades = async () => {
    try {
      // 转换前端数据格式为后端格式
      const data = grades.value.map(grade => ({
        id: grade.id > 1000000000000 ? 0 : grade.id, // 新增的临时ID转为0
        name: grade.name,
        points_upgrade: grade.requiredPoints,
        bonus_upgrade: grade.firstBonus,
        bonus_birthday: grade.birthdayBonus,
        rebate_percent_sports: grade.rebate.sports,
        rebate_percent_lottery: grade.rebate.lottery,
        rebate_percent_live: grade.rebate.live,
        rebate_percent_egame: grade.rebate.slot,
        rebate_percent_poker: grade.rebate.fishing
      }))

      const res = await saveMemberGrades(data, fieldsDisable.value, autoProviding.value)
      if (res.code === 200) {
        ElMessage.success('保存成功')
        loadData() // 重新加载数据
      } else {
        ElMessage.error(res.message || '保存失败')
      }
    } catch (error) {
      ElMessage.error('保存失败')
      console.error(error)
    }
  }

  // 添加新等级
  const addGrade = () => {
    const newGrade = {
      id: Date.now(), // 临时ID
      name: `VIP${grades.value.length + 1}`,
      memberCount: 0,
      requiredPoints: 100,
      firstBonus: 200,
      birthdayBonus: 0,
      rebate: {
        sports: 0.0111,
        lottery: 0.0112,
        live: 0.0113,
        slot: 0.0114,
        fishing: 0.0
      }
    }
    grades.value.push(newGrade)
  }

  // 删除等级
  const removeGrade = async grade => {
    // 如果是新增的等级（临时ID），直接从数组中删除
    if (grade.id > 1000000000000) {
      const index = grades.value.findIndex(g => g.id === grade.id)
      if (index > -1) {
        grades.value.splice(index, 1)
      }
      return
    }

    // 如果是已存在的等级，需要调用API删除
    ElMessageBox.confirm(`确定要删除等级【${grade.name}】吗？`, '提示', {
      type: 'warning'
    })
      .then(async () => {
        try {
          const res = await deleteMemberGrade(grade.id)
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

  // 切换所有首级彩金
  const toggleAllFirstBonus = val => {
    if (!val) {
      grades.value.forEach(grade => {
        grade.firstBonus = 0
      })
    }
  }

  // 切换所有生日彩金
  const toggleAllBirthdayBonus = val => {
    if (!val) {
      grades.value.forEach(grade => {
        grade.birthdayBonus = 0
      })
    }
  }

  onMounted(() => {
    loadData()
  })
</script>

<style scoped>
  .member-grade-container {
    padding: 20px;
  }

  .header-actions {
    margin-bottom: 20px;
  }

  .table-scroll-wrapper {
    overflow-x: auto;
    overflow-y: visible;
  }

  .grade-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1200px;
  }

  .grade-table th,
  .grade-table td {
    border: 1px solid #e4e7ed;
    padding: 12px 8px;
    text-align: center;
    vertical-align: middle;
    background: #fff;
  }

  .grade-table th {
    background: #f5f7fa;
    font-weight: 600;
    color: #606266;
    position: relative;
    z-index: 2;
  }

  .grade-header {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
  }

  .grade-table .fixed-col {
    position: sticky;
    left: 0;
    z-index: 5;
    background: #f5f7fa;
    min-width: 150px;
    font-weight: 600;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.06);
  }

  .grade-table tbody .fixed-col {
    background: #fff;
    z-index: 4;
  }

  .grade-table thead .fixed-col {
    z-index: 6;
  }

  .grade-table .label-col {
    text-align: left;
    padding-left: 16px;
  }

  .grade-table .sub-label {
    padding-left: 32px;
  }

  .grade-table .add-col {
    background: #f5f7fa;
    width: 60px;
  }

  .section-header td {
    background: #e8f4ff !important;
    font-weight: 600;
    text-align: left;
    padding-left: 16px;
  }

  .readonly-value {
    color: #909399;
    font-size: 14px;
  }

  .input-with-unit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .unit {
    color: #606266;
    font-size: 14px;
  }

  /* 输入框样式优化 */
  :deep(.el-input-number) {
    width: 100%;
  }

  :deep(.el-input-number .el-input__wrapper) {
    padding: 0 8px;
  }

  :deep(.el-input__inner) {
    text-align: center;
  }

  /* 滚动条美化 */
  .table-scroll-wrapper::-webkit-scrollbar {
    height: 8px;
  }

  .table-scroll-wrapper::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 4px;
  }

  .table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
    background: #c0c4cc;
  }

  .table-scroll-wrapper::-webkit-scrollbar-track {
    background: #f5f7fa;
  }
</style>
