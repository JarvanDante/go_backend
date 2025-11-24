# 动态路由使用指南

## 概述

本项目使用基于权限的动态路由系统，根据用户的权限自动生成可访问的路由。

## 权限数据结构

### 数据库表字段

```sql
CREATE TABLE admin_permission (
  id INT PRIMARY KEY,
  parent_id INT,           -- 父级ID，0表示顶级菜单
  type INT,                -- 1=菜单，2=按钮
  name VARCHAR(50),        -- 菜单名称
  backend_url VARCHAR(100),-- 后端接口路径
  frontend_url VARCHAR(100),-- 前端路由路径
  icon VARCHAR(50),        -- 图标
  status INT               -- 1=启用，0=禁用
);
```

### 示例数据

| id  | parent_id | type | name     | frontend_url                        |
| --- | --------- | ---- | -------- | ----------------------------------- |
| 1   | 0         | 1    | 系统     | sysSetting                          |
| 2   | 1         | 1    | 全局设置 | sysSetting/basicSetting             |
| 3   | 2         | 1    | 基本信息 | sysSetting/basicSetting/sysBasicSet |
| 5   | 2         | 1    | 会员注册 | sysSetting/basicSetting/sysMemReg   |

## 路由生成规则

### 1. 一级菜单（顶级）

```typescript
{
  path: '/sysSetting',
  name: '系统',
  component: Layout,
  meta: { title: '系统', icon: 'setting', id: 1 },
  children: [...]
}
```

### 2. 二级菜单（有子菜单）

```typescript
{
  path: 'basicSetting',
  name: '全局设置',
  component: RouterView,  // 使用容器组件
  redirect: 'basicSetting/sysBasicSet',  // 自动重定向到第一个子菜单
  meta: { title: '全局设置', id: 2, alwaysShow: true },
  children: [...]
}
```

### 3. 三级菜单（叶子节点）

```typescript
{
  path: 'sysBasicSet',
  name: '基本信息',
  component: () => import('@/views/sysSetting/basicSetting/sysBasicSet.vue'),
  meta: { title: '基本信息', id: 3 }
}
```

## 文件目录结构

### 必需的文件结构

```
src/views/
├── common/
│   └── RouterView.vue          # 路由容器组件（已创建）
└── sysSetting/
    ├── basicSetting/
    │   ├── sysBasicSet.vue     # 基本信息页面
    │   ├── sysMemReg.vue       # 会员注册页面
    │   └── sysMemScore.vue     # 积分设置页面
    └── sysAccount/
        └── admins.vue          # 员工列表页面
```

### RouterView 容器组件

已创建在 `src/views/common/RouterView.vue`：

```vue
<template>
  <router-view />
</template>
```

**作用：** 用于有子菜单的中间层级，渲染子路由内容。

## 权限控制流程

### 1. 用户登录

```javascript
// 登录成功后获取 token
const token = await login({ username, password })
setToken(token)
```

### 2. 获取用户信息

```javascript
// 获取用户角色
const userInfo = await getInfo()
// userInfo.roles = ['管理员']
```

### 3. 获取权限列表

```javascript
// 获取完整的权限菜单树和角色权限
const permissions = await permissions()
// permissions.permission_list = [菜单树]
// permissions.role_list = [角色列表]
```

### 4. 生成动态路由

```javascript
// 根据用户角色整合权限ID
const rolePermissionIds = ['1', '2', '3', '5', '7']

// 生成可访问的路由
const accessRoutes = await permissionStore().generateRoutes(permissionList, rolePermissionIds)

// 动态添加路由
accessRoutes.forEach(r => router.addRoute(r))
```

## 关键特性

### 1. 自动补齐父级权限

如果用户有子菜单的权限，系统会自动补齐父级菜单的权限。

**示例：**

- 用户权限：`['3']` (基本信息)
- 自动补齐：`['1', '2', '3']` (系统 → 全局设置 → 基本信息)

### 2. 智能组件加载

- **有子菜单：** 使用 `RouterView` 容器组件
- **无子菜单：** 加载实际的 `.vue` 组件
- **组件不存在：** 自动降级到 404 页面

### 3. 自动重定向

有子菜单的路由会自动重定向到第一个子菜单：

```typescript
redirect: 'basicSetting/sysBasicSet'
```

### 4. 按钮权限过滤

`type=2` 的权限不会生成路由，只用于页面内的按钮控制。

## 调试指南

### 1. 查看生成的路由

打开浏览器控制台，查看以下日志：

```
🔐 开始生成动态路由...
📋 权限列表: [...]
🔑 用户权限ID: ['1', '2', '3', '5', '7']
✅ 生成的动态路由: [...]
➕ 添加路由: /sysSetting
```

### 2. 检查组件路径

如果页面显示 404，检查日志：

```
⚠️ 组件路径不存在: /src/views/sysSetting/basicSetting/sysBasicSet.vue
```

**解决方法：**

1. 确认文件是否存在
2. 检查文件名大小写是否正确
3. 确认 `frontend_url` 配置是否正确

### 3. 检查权限配置

如果菜单不显示，检查：

1. 用户是否有对应的权限 ID
2. 权限的 `type` 是否为 1（菜单）
3. 权限的 `status` 是否为 1（启用）

## 常见问题

### Q1: 二级菜单点击后显示空白

**原因：** 二级菜单没有使用 `RouterView` 容器组件

**解决：** 系统已自动处理，有子菜单的路由会使用 `RouterView` 组件

### Q2: 路由跳转后页面不刷新

**原因：** 路由 `key` 配置问题

**解决：** 在 `AppMain.vue` 中使用 `:key="route.fullPath"`

### Q3: 菜单显示但点击无反应

**原因：** 组件文件不存在

**解决：**

1. 检查控制台警告日志
2. 创建对应的 `.vue` 文件
3. 确认文件路径与 `frontend_url` 一致

### Q4: 刷新页面后路由丢失

**原因：** 动态路由没有持久化

**解决：** 系统已处理，每次刷新会重新获取权限并生成路由

## 最佳实践

### 1. 命名规范

**frontend_url 命名：**

- 使用小驼峰或短横线命名
- 保持与文件路径一致
- 示例：`sysSetting/basicSetting/sysBasicSet`

**组件文件命名：**

- 使用大驼峰命名
- 示例：`SysBasicSet.vue` 或 `sysBasicSet.vue`

### 2. 目录结构

```
views/
├── 模块名/
│   ├── 子模块名/
│   │   └── 页面名.vue
│   └── index.vue (可选)
```

### 3. 路由 meta 配置

```typescript
meta: {
  title: '页面标题',      // 必需
  icon: 'icon-name',      // 图标
  noCache: false,         // 是否缓存
  affix: false,           // 是否固定在 tags-view
  breadcrumb: true,       // 是否显示在面包屑
  activeMenu: '/path'     // 高亮的菜单路径
}
```

### 4. 权限检查

在页面中检查按钮权限：

```vue
<template>
  <el-button v-if="hasPermission('create-admin')"> 添加员工 </el-button>
</template>

<script setup>
  import { hasPermission } from '@/utils/permission'
</script>
```

## 性能优化

1. **路由懒加载：** 所有组件使用 `() => import()` 动态导入
2. **权限缓存：** 权限信息存储在 Pinia Store
3. **组件缓存：** 使用 `keep-alive` 缓存页面组件
4. **按需加载：** 只加载用户有权限的路由

## 总结

本动态路由系统具有以下优势：

✅ 基于权限的路由生成
✅ 支持无限层级菜单
✅ 自动补齐父级权限
✅ 智能组件加载
✅ 完善的错误处理
✅ 详细的调试日志
✅ 高性能优化

如有问题，请查看控制台日志或参考本文档。
