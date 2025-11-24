# 图标使用指南

## 项目中可用的图标

项目使用 SVG 图标，所有图标文件位于 `src/icons/svg/` 目录下。

### 可用图标列表

| 图标名称        | 文件名              | 用途建议          |
| --------------- | ------------------- | ----------------- |
| 404             | 404.svg             | 404 错误页面      |
| bug             | bug.svg             | 错误日志、调试    |
| chart           | chart.svg           | 图表、统计        |
| clipboard       | clipboard.svg       | 剪贴板            |
| component       | component.svg       | 组件              |
| dashboard       | dashboard.svg       | 仪表盘、首页      |
| documentation   | documentation.svg   | 文档              |
| drag            | drag.svg            | 拖拽              |
| edit            | edit.svg            | 编辑              |
| education       | education.svg       | 教育、培训        |
| email           | email.svg           | 邮件              |
| example         | example.svg         | 示例              |
| excel           | excel.svg           | Excel 导出        |
| exit-fullscreen | exit-fullscreen.svg | 退出全屏          |
| eye-open        | eye-open.svg        | 显示              |
| eye             | eye.svg             | 查看              |
| form            | form.svg            | 表单              |
| fullscreen      | fullscreen.svg      | 全屏              |
| guide           | guide.svg           | 引导              |
| icon            | icon.svg            | 图标              |
| international   | international.svg   | 国际化            |
| language        | language.svg        | 语言              |
| link            | link.svg            | 链接              |
| list            | list.svg            | 列表              |
| lock            | lock.svg            | 锁定、权限        |
| message         | message.svg         | 消息              |
| **money**       | **money.svg**       | **财务、金钱** ✅ |
| nested          | nested.svg          | 嵌套菜单          |
| password        | password.svg        | 密码              |
| pdf             | pdf.svg             | PDF               |
| people          | people.svg          | 人员              |
| peoples         | peoples.svg         | 多人              |
| qq              | qq.svg              | QQ                |
| search          | search.svg          | 搜索              |
| **settings**    | **settings.svg**    | **设置、系统** ✅ |
| shopping        | shopping.svg        | 购物、运营        |
| size            | size.svg            | 尺寸              |
| skill           | skill.svg           | 技能              |
| **star**        | **star.svg**        | **星标、游戏** ✅ |
| tab             | tab.svg             | 标签页            |
| table           | table.svg           | 表格              |
| theme           | theme.svg           | 主题              |
| tree-table      | tree-table.svg      | 树形表格          |
| **tree**        | **tree.svg**        | **树形、代理** ✅ |
| **user**        | **user.svg**        | **用户、会员** ✅ |
| wechat          | wechat.svg          | 微信              |
| zip             | zip.svg             | ZIP 压缩          |

## 当前一级菜单图标配置

```typescript
const ICON_MAP: Record<string, string> = {
  系统: 'settings', // ⚙️ settings.svg
  运营: 'shopping', // 🛒 shopping.svg
  财务: 'money', // 💰 money.svg
  会员: 'user', // 👤 user.svg
  代理: 'tree', // 🌳 tree.svg
  游戏: 'star' // ⭐ star.svg
}
```

## 图标显示规则

### ✅ 显示图标

- **一级菜单**：显示图标（如：系统、运营、财务等）

### ❌ 不显示图标

- **二级菜单**：不显示图标（如：全局设置、员工账号等）
- **三级菜单**：不显示图标（如：基本信息、员工列表等）

## 如何修改图标

### 方法 1：修改映射表（推荐）

编辑 `src/store/modules/permission.ts` 文件：

```typescript
const ICON_MAP: Record<string, string> = {
  系统: 'settings', // 修改这里
  运营: 'shopping', // 修改这里
  财务: 'money',
  会员: 'user',
  代理: 'tree',
  游戏: 'star'
}
```

### 方法 2：数据库配置

在数据库的 `admin_permission` 表中，为一级菜单添加 `icon` 字段：

```sql
UPDATE admin_permission
SET icon = 'settings'
WHERE id = 1 AND name = '系统';
```

如果数据库中配置了 `icon` 字段，会优先使用数据库的配置。

## 图标替代方案

如果某个图标不存在，可以使用以下替代方案：

| 需求     | 推荐图标 | 备选图标           |
| -------- | -------- | ------------------ |
| 系统设置 | settings | password, lock     |
| 运营管理 | shopping | chart, form        |
| 财务管理 | money    | excel, table       |
| 会员管理 | user     | people, peoples    |
| 代理管理 | tree     | tree-table, nested |
| 游戏管理 | star     | component, skill   |

## 添加新图标

如果需要添加新的图标：

1. 将 SVG 文件放到 `src/icons/svg/` 目录
2. 文件名使用小写字母和连字符（如：`my-icon.svg`）
3. 在代码中使用文件名（不含 `.svg` 后缀）

```typescript
const ICON_MAP: Record<string, string> = {
  系统: 'my-icon' // 使用 my-icon.svg
  // ...
}
```

## 图标使用示例

### 在路由中使用

```typescript
{
  path: '/system',
  meta: {
    title: '系统',
    icon: 'settings'  // 使用 settings.svg
  }
}
```

### 在组件中使用

```vue
<template>
  <svg-icon icon-class="settings" />
</template>
```

## 常见问题

### Q1: 图标不显示怎么办？

**检查步骤：**

1. 确认图标文件是否存在于 `src/icons/svg/` 目录
2. 确认图标名称是否正确（区分大小写）
3. 检查浏览器控制台是否有错误
4. 清除浏览器缓存并刷新

### Q2: 如何查看所有可用图标？

访问项目的图标展示页面（如果有），或直接查看 `src/icons/svg/` 目录。

### Q3: 可以使用 Element Plus 的图标吗？

可以，但需要修改 `SvgIcon` 组件以支持 Element Plus 图标。

## 注意事项

⚠️ **重要提示：**

- 图标名称必须与 SVG 文件名完全一致（不含 `.svg` 后缀）
- 图标名称区分大小写
- 二级、三级菜单不会显示图标（即使配置了也不会显示）
- 修改图标配置后需要刷新页面才能生效
