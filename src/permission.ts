import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import router from './router'
import permissionStore from './store/modules/permission'
import userStore from './store/modules/user'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  console.log(`🚀 路由跳转: ${from.path} → ${to.path}`)

  // 开始进度条
  NProgress.start()

  // 设置页面标题
  document.title = getPageTitle(to.meta.title)

  // 判断用户是否已登录
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // 已登录，重定向到首页
      console.log('✅ 已登录，跳转到首页')
      NProgress.done()
      next({ path: '/' })
    } else {
      // 判断用户是否已获取权限信息
      const hasRoles = userStore().roles && userStore().roles.length > 0

      if (hasRoles) {
        // 已有权限信息，直接放行
        next()
      } else {
        try {
          console.log('🔄 获取用户信息和权限...')

          // 获取用户信息
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const infoRes = (await userStore().getInfo()) as any
          const userRoles = infoRes.roles || []

          console.log('👤 用户角色:', userRoles)

          // 获取权限列表
          const permissionListRes = (await userStore().permissions()) as any
          const permissionList = permissionListRes.permission_list || []
          const allRoles = permissionListRes.role_list || []

          console.log('📋 权限菜单树:', permissionList)
          console.log('🎭 所有角色:', allRoles)

          // 整合用户拥有的所有权限ID
          let rolePermissionIds: string[] = []

          if (userRoles && allRoles) {
            allRoles.forEach(role => {
              if (userRoles.includes(role.name)) {
                rolePermissionIds.push(...role.permission_list)
              }
            })
          }

          // 去重
          rolePermissionIds = [...new Set(rolePermissionIds)]
          console.log('🔑 用户权限ID:', rolePermissionIds)

          // 生成动态路由
          const accessRoutes = await permissionStore().generateRoutes(
            permissionList,
            rolePermissionIds
          )

          // 动态添加路由
          accessRoutes.forEach(r => {
            router.addRoute(r)
            console.log(`➕ 添加路由: ${r.path}`)
          })

          console.log('✅ 动态路由添加完成')

          // 确保 addRoute 完成后再跳转
          // replace: true 不会留下历史记录
          next({ ...to, replace: true })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error('❌ 获取权限失败:', error)

          // 清除 token 并跳转到登录页
          await userStore().resetToken()
          ElMessage.error(error.message || '获取权限失败，请重新登录')
          NProgress.done()
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    // 未登录
    if (whiteList.indexOf(to.path) !== -1) {
      // 在白名单中，直接放行
      next()
    } else {
      // 不在白名单中，重定向到登录页
      console.log('⚠️ 未登录，跳转到登录页')
      NProgress.done()
      next(`/login?redirect=${to.path}`)
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
