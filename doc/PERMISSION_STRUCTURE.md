# 权限结构说明

## 数据库权限表结构

根据你提供的截图，权限表结构如下：

| id  | parent_id | type | name     | backend_url      | frontend_url                        | status |
| --- | --------- | ---- | -------- | ---------------- | ----------------------------------- | ------ |
| 1   | 0         | 1    | 系统     | -                | sysSetting                          | 1      |
| 2   | 1         | 1    | 全局设置 | basic-setting    | sysSetting/basicSetting             | 1      |
| 3   | 2         | 1    | 基本信息 | user-basic-info  | sysSetting/basicSetting/sysBasicSet | 1      |
| 5   | 2         | 1    | 会员注册 | register-setting | sysSetting/basicSetting/sysMemReg   | 1      |
| 7   | 2         | 1    | 积分设置 | points-setting   | sysSetting/basicSetting/sysMemScore | 1      |

## 字段说明

- **id**: 权限 ID
- **parent_id**: 父级 ID（0 表示顶级菜单）
- **type**: 类型（1=菜单，2=按钮）
- **name**: 菜单名称
- **backend_url**: 后端接口路径
- **frontend_url**: 前端路由路径
- **status**: 状态（1=启用，0=禁用）

## 路由层级结构

### 一级菜单（顶级）

```
/sysSetting (系统)
```

### 二级菜单

```
/sysSetting
  └─ basicSetting (全局设置)
```

### 三级菜单

```
/sysSetting
  └─ basicSetting
      ├─ sysBasicSet (基本信息)
      ├─ sysMemReg (会员注册)
      └─ sysMemScore (积分设置)
```

## 生成的 Vue Router 路由结构

```javascript
{
  path: '/sysSetting',
  name: '系统',
  component: Layout,
  meta: { title: '系统', icon: 'setting', id: 1 },
  children: [
    {
      path: 'basicSetting',
      name: '全局设置',
      component: () => import('@/views/sysSetting/basicSetting.vue'),
      meta: { title: '全局设置', id: 2 },
      children: [
        {
          path: 'sysBasicSet',
          name: '基本信息',
          component: () => import('@/views/sysSetting/basicSetting/sysBasicSet.vue'),
          meta: { title: '基本信息', id: 3 }
        },
        {
          path: 'sysMemReg',
          name: '会员注册',
          component: () => import('@/views/sysSetting/basicSetting/sysMemReg.vue'),
          meta: { title: '会员注册', id: 5 }
        },
        {
          path: 'sysMemScore',
          name: '积分设置',
          component: () => import('@/views/sysSetting/basicSetting/sysMemScore.vue'),
          meta: { title: '积分设置', id: 7 }
        }
      ]
    }
  ]
}
```

## 访问路径

- 基本信息页面：`/sysSetting/basicSetting/sysBasicSet`
- 会员注册页面：`/sysSetting/basicSetting/sysMemReg`
- 积分设置页面：`/sysSetting/basicSetting/sysMemScore`

## 文件目录结构

```
src/views/
└── sysSetting/
    ├── basicSetting/
    │   ├── sysBasicSet.vue      # 基本信息
    │   ├── sysMemReg.vue         # 会员注册
    │   └── sysMemScore.vue       # 积分设置
    └── sysAccount/
        └── admins.vue            # 员工列表
```

## 权限控制逻辑

### 1. 自动补齐父级权限

如果用户有 `id=3` (基本信息) 的权限，系统会自动补齐：

- `id=2` (全局设置)
- `id=1` (系统)

这样用户才能看到完整的菜单路径。

### 2. 按钮权限

`type=2` 的权限不会生成路由，只用于页面内的按钮权限控制。

例如：

```javascript
// 在页面中使用
import { hasPermission } from '@/utils/permission'

// 检查是否有某个按钮权限
if (hasPermission('create-admin')) {
  // 显示"添加员工"按钮
}
```

## 后端接口返回格式

### 权限菜单树 (permission_list)

```json
[
  {
    "id": 1,
    "parent_id": 0,
    "type": 1,
    "name": "系统",
    "backend_url": "",
    "frontend_url": "sysSetting",
    "icon": "setting",
    "children": [
      {
        "id": 2,
        "parent_id": 1,
        "type": 1,
        "name": "全局设置",
        "backend_url": "basic-setting",
        "frontend_url": "sysSetting/basicSetting",
        "children": [
          {
            "id": 3,
            "parent_id": 2,
            "type": 1,
            "name": "基本信息",
            "backend_url": "user-basic-info",
            "frontend_url": "sysSetting/basicSetting/sysBasicSet",
            "children": []
          }
        ]
      }
    ]
  }
]
```

### 用户权限 ID (rolePermissionIds)

```json
["1", "2", "3", "5", "7", "25", "26", "27"]
```

## 常见问题

### Q1: 二级菜单需要组件吗？

**答：** 如果二级菜单下还有三级菜单，通常不需要单独的组件。但如果你想让二级菜单可点击并显示内容，需要创建对应的组件文件。

**建议：**

- 如果二级菜单只是分组，不需要组件
- 如果二级菜单需要显示内容，创建对应的 `.vue` 文件

### Q2: 如何处理没有组件的中间层级？

**方案 1：** 使用 `redirect` 重定向到第一个子菜单

```javascript
{
  path: 'basicSetting',
  redirect: 'basicSetting/sysBasicSet',
  children: [...]
}
```

**方案 2：** 使用空的容器组件

```vue
<!-- basicSetting.vue -->
<template>
  <router-view />
</template>
```

### Q3: 如何调试路由生成？

打开浏览器控制台，查看以下日志：

- `🔐 开始生成动态路由...`
- `📋 权限列表: [...]`
- `🔑 用户权限ID: [...]`
- `✅ 生成的动态路由: [...]`
- `➕ 添加路由: /sysSetting`

## 优化建议

### 1. 添加路由重定向

对于有子菜单的路由，建议添加默认重定向：

```typescript
if (children.length > 0) {
  route.children = children
  route.redirect = children[0].path // 重定向到第一个子菜单
  route.meta!.alwaysShow = true
}
```

### 2. 处理中间层级组件

创建一个通用的容器组件：

```vue
<!-- src/views/common/RouterView.vue -->
<template>
  <router-view />
</template>
```

在路由生成时使用：

```typescript
// 如果是中间层级（有子菜单但不是叶子节点）
component: () => import('@/views/common/RouterView.vue')
```

### 3. 添加面包屑导航

在 `meta` 中添加面包屑信息：

```typescript
meta: {
  title: c.name,
  id: c.id,
  breadcrumb: true, // 是否显示在面包屑中
  activeMenu: parentPath // 高亮的菜单路径
}
```
