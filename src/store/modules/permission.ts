import { constantRoutes } from '@/router'
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

// 扫描所有 views 下的 vue 文件
const modules = import.meta.glob('@/views/**/*.vue')

function loadView(viewPath: string) {
  const fullPath = `/src/views/${viewPath}.vue`
  return modules[fullPath]
}

/**
 * 递归收集所有用户可用菜单 (自动补齐父级)
 */
function collectUserMenus(permissionList, userPermissions) {
  const result = new Set()

  function dfs(menu) {
    let hasChildPerm = false

    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (dfs(child)) {
          hasChildPerm = true
        }
      }
    }

    // 当前节点或子节点有权限
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
 */
function buildChildren(menu, parentPath, allowedSet) {
  if (!menu.children || menu.children.length === 0) {
    return []
  }

  return menu.children
    .filter(c => c.type === 1 && allowedSet.has(c.id))
    .map(c => {
      const localPath = c.frontend_url.replace(parentPath + '/', '')

      const route: RouteRecordRaw = {
        path: localPath,
        name: c.name,
        component: loadView(c.frontend_url),
        meta: {
          title: c.name,
          id: c.id
        }
      }

      // ⭐递归生成更深层级
      const subChildren = buildChildren(c, c.frontend_url, allowedSet)
      if (subChildren.length > 0) {
        route.children = subChildren
        route.meta!.alwaysShow = true
      }

      return route
    })
}

/**
 * 生成完整动态路由（根 → 二级 → 三级 → …）
 */
function buildRoutesFromPermissions(list, userPermissions) {
  const allowedSet = collectUserMenus(list, userPermissions)

  const routes: RouteRecordRaw[] = []

  list.forEach(menu => {
    if (!allowedSet.has(menu.id)) return
    if (menu.type === 2) return

    const route: RouteRecordRaw = {
      path: '/' + menu.frontend_url,
      name: menu.name,
      component: () => import('@/layout/index.vue'),
      meta: {
        title: menu.name,
        id: menu.id,
        icon: 'list'
      }
    }

    const children = buildChildren(menu, menu.frontend_url, allowedSet)

    if (children.length > 0) {
      route.children = children
      route.meta!.alwaysShow = true
    }

    routes.push(route)
  })

  return routes
}

/**
 * Pinia Store
 */
export default defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    addRoutes: [] as RouteRecordRaw[]
  }),

  actions: {
    generateRoutes(permissionList, userPermissionIds) {
      const accessedRoutes = buildRoutesFromPermissions(permissionList, userPermissionIds)
      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)
      return accessedRoutes
    }
  }
})
