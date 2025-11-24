<template>
  <div class="permissions-container">
    <el-card>
      <div class="content-wrapper">
        <!-- 左侧角色列表 -->
        <div class="role-list">
          <div
            v-for="role in roles"
            :key="role.id"
            class="role-item"
            :class="{ active: currentRoleId === role.id }"
            @click="selectRole(role)"
          >
            {{ role.name }}
          </div>

          <div class="role-actions">
            <el-button type="primary" size="small" @click="openAddRoleDialog">添加</el-button>
            <el-button size="small" @click="openEditRoleDialog">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteRole">删除</el-button>
          </div>
        </div>

        <!-- 右侧权限树 -->
        <div class="permission-tree">
          <el-tree
            ref="treeRef"
            :data="permissionTree"
            :props="treeProps"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedKeys"
            @check="handleCheck"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>{{ node.label }}</span>
                <span v-if="data.type === 2" class="permission-tag">按钮</span>
              </span>
            </template>
          </el-tree>

          <div class="tree-actions">
            <el-button type="primary" @click="savePermissions">保存</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 添加/编辑角色弹窗 -->
    <el-dialog :title="isEdit ? '编辑角色' : '添加角色'" v-model="dialogVisible" width="400px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRole">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    getRoles,
    getPermissions,
    createRole,
    updateRole,
    deleteRole,
    savePermission
  } from '@/api/role'

  const treeRef = ref(null)
  const roles = ref([])
  const rolePermissionMap = ref({}) // 角色权限映射表
  const currentRoleId = ref(null)
  const currentRole = ref(null)
  const permissionTree = ref([])
  const checkedKeys = ref([])

  const dialogVisible = ref(false)
  const isEdit = ref(false)
  const roleForm = reactive({
    id: null,
    name: '',
    description: ''
  })

  const treeProps = {
    children: 'children',
    label: 'name'
  }

  // 加载角色列表
  const loadRoles = async () => {
    const res = await getRoles()
    if (res.code === 200) {
      roles.value = res.data || []
      if (roles.value.length > 0) {
        selectRole(roles.value[0])
      }
    }
  }

  // 加载权限树和角色权限映射
  const loadPermissions = async () => {
    const res = await getPermissions()
    if (res.code === 200) {
      // 权限菜单树
      permissionTree.value = res.data.permission_list || []

      // 角色权限映射
      const roleList = res.data.role_list || []
      rolePermissionMap.value = {}
      roleList.forEach(role => {
        rolePermissionMap.value[role.id] = role.permission_list || []
      })

      console.log('权限树:', permissionTree.value)
      console.log('角色权限映射:', rolePermissionMap.value)
    }
  }

  // 选择角色
  const selectRole = role => {
    currentRoleId.value = role.id
    currentRole.value = role

    // 从角色权限映射中获取该角色的权限ID列表
    const rolePermissions = rolePermissionMap.value[role.id] || []

    console.log(`选择角色: ${role.name} (ID: ${role.id})`)
    console.log('角色权限ID:', rolePermissions)

    if (rolePermissions.length > 0) {
      // 只设置叶子节点，避免父节点被自动选中
      const leafKeys = getLeafKeys(permissionTree.value, rolePermissions)
      checkedKeys.value = leafKeys

      console.log('叶子节点权限ID:', leafKeys)

      nextTick(() => {
        if (treeRef.value) {
          treeRef.value.setCheckedKeys(leafKeys)
        }
      })
    } else {
      checkedKeys.value = []
      nextTick(() => {
        if (treeRef.value) {
          treeRef.value.setCheckedKeys([])
        }
      })
    }
  }

  // 获取叶子节点的keys
  const getLeafKeys = (tree, permissionList) => {
    const leafKeys = []

    // 将权限列表转换为字符串数组（统一格式）
    const permissionStrList = permissionList.map(id => String(id))

    const traverse = nodes => {
      nodes.forEach(node => {
        // 检查当前节点是否在权限列表中
        if (permissionStrList.includes(String(node.id))) {
          // 如果没有子节点或子节点为空，则为叶子节点
          if (!node.children || node.children.length === 0) {
            leafKeys.push(node.id)
          } else {
            // 有子节点，继续遍历子节点
            traverse(node.children)
          }
        }
      })
    }

    traverse(tree)
    return leafKeys
  }

  // 树节点选中变化
  const handleCheck = (data, checked) => {
    // 可以在这里添加额外的逻辑
  }

  // 保存权限
  const savePermissions = async () => {
    if (!currentRole.value) {
      ElMessage.warning('请先选择角色')
      return
    }

    // 获取所有选中的节点（包括半选中的父节点）
    const checkedNodes = treeRef.value.getCheckedKeys()
    const halfCheckedNodes = treeRef.value.getHalfCheckedKeys()
    const allCheckedKeys = [...checkedNodes, ...halfCheckedNodes]

    const res = await savePermission({
      id: currentRole.value.id,
      permissions: allCheckedKeys.join(',')
    })

    if (res.code === 200) {
      ElMessage.success('权限保存成功')
      // 重新加载角色列表以更新权限
      await loadRoles()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  }

  // 打开添加角色弹窗
  const openAddRoleDialog = () => {
    isEdit.value = false
    roleForm.id = null
    roleForm.name = ''
    roleForm.description = ''
    dialogVisible.value = true
  }

  // 打开编辑角色弹窗
  const openEditRoleDialog = () => {
    if (!currentRole.value) {
      ElMessage.warning('请先选择角色')
      return
    }

    isEdit.value = true
    roleForm.id = currentRole.value.id
    roleForm.name = currentRole.value.name
    roleForm.description = currentRole.value.description || ''
    dialogVisible.value = true
  }

  // 提交角色
  const submitRole = async () => {
    if (!roleForm.name) {
      ElMessage.warning('请输入角色名称')
      return
    }

    try {
      let res
      if (isEdit.value) {
        res = await updateRole({
          id: roleForm.id,
          name: roleForm.name,
          description: roleForm.description
        })
      } else {
        res = await createRole({
          name: roleForm.name,
          description: roleForm.description
        })
      }

      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
        dialogVisible.value = false
        await loadRoles()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }

  // 删除角色
  const handleDeleteRole = () => {
    if (!currentRole.value) {
      ElMessage.warning('请先选择角色')
      return
    }

    ElMessageBox.confirm(`确定要删除角色【${currentRole.value.name}】吗？`, '提示', {
      type: 'warning'
    }).then(async () => {
      const res = await deleteRole({ id: currentRole.value.id })
      if (res.code === 200) {
        ElMessage.success('删除成功')
        currentRoleId.value = null
        currentRole.value = null
        await loadRoles()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    })
  }

  // 取消编辑
  const cancelEdit = () => {
    if (!currentRole.value) {
      ElMessage.warning('请先选择角色')
      return
    }
    // 重新加载当前角色的权限
    selectRole(currentRole.value)
    ElMessage.info('已取消修改')
  }

  // 初始化
  onMounted(async () => {
    // 先加载权限树和角色权限映射
    await loadPermissions()
    // 再加载角色列表并选中第一个
    await loadRoles()
  })
</script>

<style scoped>
  .permissions-container {
    padding: 20px;
  }

  .content-wrapper {
    display: flex;
    gap: 20px;
    min-height: 600px;
  }

  /* 左侧角色列表 */
  .role-list {
    width: 200px;
    border-right: 1px solid #e4e7ed;
    padding-right: 20px;
    display: flex;
    flex-direction: column;
  }

  .role-item {
    padding: 12px 16px;
    margin-bottom: 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
    background-color: #f5f7fa;
  }

  .role-item:hover {
    background-color: #e6f7ff;
  }

  .role-item.active {
    background-color: #409eff;
    color: white;
  }

  .role-actions {
    margin-top: auto;
    padding-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .role-actions .el-button {
    width: 100%;
    margin: 0;
  }

  /* 右侧权限树 */
  .permission-tree {
    flex: 1;
    padding-left: 20px;
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .permission-tag {
    font-size: 12px;
    color: #909399;
    background-color: #f4f4f5;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .tree-actions {
    margin-top: 20px;
    text-align: center;
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .tree-actions .el-button {
    min-width: 100px;
  }

  /* 树节点样式 */
  :deep(.el-tree-node__content) {
    height: 32px;
    line-height: 32px;
  }

  :deep(.el-tree) {
    background-color: transparent;
  }
</style>
