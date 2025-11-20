<template>
  <div class="game-setting">
    <el-card>
      <el-table :data="categoryList" border style="width: 100%">
        <el-table-column v-for="cat in categoryList" :key="cat.type" :label="cat.label">
          <template #default>
            <div v-for="game in gameMap[cat.type]" :key="game.id" class="game-row">
              <span>{{ game.name }}</span>
              <el-switch v-model="game.status" :active-value="1" :inactive-value="0" />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="btn-row">
        <el-button type="primary" @click="save">保 存</el-button>
        <el-button @click="loadGames">取 消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { getGames, updateGames } from '@/api/game'

  // 游戏种类（type 对应 PHP 的 game.type）
  const categoryList = [
    { type: 1, label: '真人视讯' },
    { type: 2, label: '电子游艺' },
    { type: 3, label: '体育竞技' },
    { type: 4, label: '彩票游戏' },
    { type: 5, label: '棋牌游戏' }
  ]

  // 游戏数据 Map（按类型分组）
  const gameMap = ref({
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  })

  // 加载游戏配置
  const loadGames = async () => {
    const res = await getGames()
    if (res.code !== 0) {
      return ElMessage.error(res.message)
    }

    const data = res.data
    Object.keys(gameMap.value).forEach(type => {
      gameMap.value[type] = data[type] || []
    })
  }

  // 保存游戏设置
  const save = async () => {
    const list = []

    // 汇总全部游戏的修改项
    Object.values(gameMap.value).forEach(arr => {
      arr.forEach(g => {
        list.push({
          id: g.id,
          status: g.status,
          sort: g.sort || 0
        })
      })
    })

    const res = await updateGames({ data: list })
    if (res.code === 0) {
      ElMessage.success('保存成功')
      loadGames()
    } else {
      ElMessage.error(res.message)
    }
  }

  onMounted(() => {
    loadGames()
  })
</script>

<style scoped>
  .game-setting {
    padding: 20px;
  }

  .game-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
  }

  .btn-row {
    margin-top: 20px;
    text-align: center;
  }
</style>
