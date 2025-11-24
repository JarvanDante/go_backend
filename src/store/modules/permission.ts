import { constantRoutes } from '@/router'
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

// 扫描所有 views 下的 vue 文件
const modules = import.meta.glob('@/views/**/*.vue')

/**
 * 动态加载视图组件
 * @param viewPath 视图路径，如 'sysSetting/sysAccount/admins'
 * @returns 组件加载函数
 */
function loadView(viewPath: string) {
  const fullPath = `/src/views/${viewPath}.vue`
  const component = modules[fullPath]

  if (!component) {
    console.warn(`⚠️ 组件路径不存在: ${fullPath}`)
    // 返回一个默认的 404 组件或空组件
    return () => import('@/views/error-page/404.vue')
  }

  return component
}

/**
 * 递归收集所有用户可用菜单 (自动补齐父级)
 * @param permissionList 完整的权限菜单树
 * @param userPermissions 用户拥有的权限ID数组
 * @returns Set<number> 用户可访问的菜单ID集合
 */
function collectUserMenus(permissionList: any[], userPermissions: string[]): Set<number> {
  const result = new Set<number>()

  function dfs(menu: any): boolean {
    let hasChildPerm = false

    // 递归检查子菜单
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (dfs(child)) {
          hasChildPerm = true
        }
      }
    }

    // 当前节点有权限 或 子节点有权限（自动补齐父级）
    if (userPermissions.includes(String(menu.id)) || hasChildPerm) {
      result.add(menu.id)
      return true
    }
    return false
  }

  permissionList.forEach(m => dfs(m))
  return result
}

/**
 * 递归构建子路由（支持无限层级）
 * @param menu 当前菜单节点
 * @param parentPath 父级路径
 * @param allowedSet 允许访问的菜单ID集合
 * @returns RouteRecordRaw[] 子路由数组
 */
function buildChildren(menu: any, parentPath: string, allowedSet: Set<number>): RouteRecordRaw[] {
  if (!menu.children || menu.children.length === 0) {
    return []
  }

  return menu.children
    .filter(c => c.type === 1 && allowedSet.has(c.id)) // type=1 表示菜单
    .map(c => {
      // 计算相对路径
      const localPath = c.frontend_url.replace(parentPath + '/', '')

      // 递归生成更深层级的子路由
      const subChildren = buildChildren(c, c.frontend_url, allowedSet)

      // 判断是否有子菜单
      const hasChildren = subChildren.length > 0

      const route: RouteRecordRaw = {
        path: localPath,
        name: c.name,
        // 如果有子菜单，使用 RouterView 容器组件；否则加载实际组件
        component: hasChildren
          ? () => import('@/views/common/RouterView.vue')
          : loadView(c.frontend_url),
        meta: {
          title: c.name,
          id: c.id,
          // 二级、三级目录不显示图标，完全移除 icon 字段
          noCache: c.no_cache || false
        }
      }

      if (hasChildren) {
        route.children = subChildren
        route.meta!.alwaysShow = true // 始终显示根菜单
        // 自动重定向到第一个子菜单
        route.redirect = `${c.frontend_url}/${subChildren[0].path}`
      }

      return route
    })
}

/**
 * 一级菜单图标映射表
 * 只有一级目录显示图标，二级、三级目录不显示图标
 * 图标名称必须与 src/icons/svg/ 目录下的 svg 文件名一致
 */
const ICON_MAP: Record<string, string> = {
  系统: 'password', // password.svg
  运营: 'shopping', // shopping.svg (运营相关)
  财务: 'money', // money.svg
  会员: 'user', // user.svg
  代理: 'tree', // tree.svg
  游戏: 'star' // star.svg
}

/**
 * 生成完整动态路由（根 → 二级 → 三级 → …）
 * @param list 完整的权限菜单树
 * @param userPermissions 用户拥有的权限ID数组
 * @returns RouteRecordRaw[] 动态路由数组
 */
function buildRoutesFromPermissions(list: any[], userPermissions: string[]): RouteRecordRaw[] {
  const allowedSet = collectUserMenus(list, userPermissions)
  const routes: RouteRecordRaw[] = []

  list.forEach(menu => {
    // 过滤：用户无权限 或 类型为按钮(type=2)
    if (!allowedSet.has(menu.id)) return
    if (menu.type === 2) return // type=2 表示按钮权限

    // 获取图标
    const myIcon = ICON_MAP[menu.name] || menu.icon || 'list'

    const route: RouteRecordRaw = {
      path: '/' + menu.frontend_url,
      name: menu.name,
      component: () => import('@/layout/index.vue'),
      meta: {
        title: menu.name,
        id: menu.id,
        icon: myIcon
      }
    }

    // 构建子路由
    const children = buildChildren(menu, menu.frontend_url, allowedSet)

    if (children.length > 0) {
      route.children = children
      route.meta!.alwaysShow = true // 始终显示根菜单
    } else {
      // 如果没有子路由，可能需要重定向或隐藏
      console.warn(`⚠️ 菜单 "${menu.name}" 没有可访问的子路由`)
    }

    routes.push(route)
  })

  return routes
}

/**
 * Pinia Store - 权限路由管理
 */
export default defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[], // 完整路由列表（静态 + 动态）
    addRoutes: [] as RouteRecordRaw[] // 动态添加的路由
  }),

  getters: {
    // 获取所有路由
    allRoutes: state => state.routes,
    // 获取动态路由
    dynamicRoutes: state => state.addRoutes
  },

  actions: {
    /**
     * 根据用户权限生成可访问的路由
     * @param permissionList 完整的权限菜单树
     * @param userPermissionIds 用户拥有的权限ID数组
     * @returns 动态路由数组
     */
    generateRoutes(permissionList: any[], userPermissionIds: string[]): RouteRecordRaw[] {
      console.log('🔐 开始生成动态路由...')
      console.log('📋 权限列表:', permissionList)
      console.log('🔑 用户权限ID:', userPermissionIds)

      const accessedRoutes = buildRoutesFromPermissions(permissionList, userPermissionIds)

      console.log('✅ 生成的动态路由:', accessedRoutes)

      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)

      return accessedRoutes
    },

    /**
     * 重置路由
     */
    resetRoutes() {
      this.routes = []
      this.addRoutes = []
    }
  }
})
