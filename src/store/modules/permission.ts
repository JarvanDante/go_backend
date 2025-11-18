import { constantRoutes } from '@/router'
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

// 扫描所有页面
const modules = import.meta.glob('@/views/**/*.vue')

function loadView(viewPath: string) {
  const fullPath = `/src/views/${viewPath}.vue`
  return modules[fullPath]
}

// 根据 permission_list 为 role 自动补全所有父级菜单（只要子级有权限）
function collectUserMenus(permissionList, userPermissions) {
  const result = new Set()

  function dfs(menu) {
    // 如果当前菜单或其子菜单有权限，则放入 result
    let hasChildPerm = false

    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (dfs(child)) {
          hasChildPerm = true
        }
      }
    }

    // 当前节点有权限 OR 子节点有权限 → 应加入
    if (userPermissions.includes(String(menu.id)) || hasChildPerm) {
      result.add(menu.id)
      return true
    }

    return false
  }

  permissionList.forEach(m => dfs(m))
  return result
}

// 构建真正的路由
function buildRoutesFromPermissions(list, userPermissions) {
  // console.log('原始 permissionList:', list)
  // console.log('用户权限:', userPermissions)

  // ① 自动补充所有父级节点
  const allowedSet = collectUserMenus(list, userPermissions)
  // console.log('最终可用节点 ID:', [...allowedSet])

  const routes: RouteRecordRaw[] = []

  list.forEach(menu => {
    // 如果根节点没有权限，跳过
    if (!allowedSet.has(menu.id)) return
    if (menu.type === 2) return
    const validChildren = (menu.children || []).filter(c => c.type === 1 && allowedSet.has(c.id))

    const route: RouteRecordRaw = {
      path: '/' + menu.frontend_url,
      name: menu.name,
      component: () => import('@/layout/index.vue'),
      meta: {
        title: menu.name,
        id: menu.id,
        alwaysShow: validChildren.length > 0,
        icon: 'list'
      }
    }

    if (menu.children) {
      route.children = menu.children
        .filter(c => c.type === 1 && allowedSet.has(c.id))
        .map(c => ({
          path: c.frontend_url.replace(menu.frontend_url + '/', ''),
          name: c.name,
          component: loadView(c.frontend_url),
          meta: { title: c.name, id: c.id }
        }))
    }

    routes.push(route)
  })

  return routes
}

export default defineStore('permission', {
  state: () => ({
    routes: [] as RouteRecordRaw[],
    addRoutes: [] as RouteRecordRaw[]
  }),

  actions: {
    generateRoutes(permissionList, userPermissionIds) {
      //动态路由生成
      const accessedRoutes = buildRoutesFromPermissions(permissionList, userPermissionIds)

      // 注意：this 是 Pinia store 实例，此处不会报错
      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)

      return accessedRoutes
    }
  }
})
