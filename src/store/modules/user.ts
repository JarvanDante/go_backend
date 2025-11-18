import {
  getInfo as apiGetInfo,
  login as apiLogin,
  logout as apiLogout,
  permissions as apiPermissions
} from '@/api/user'
import { resetRouter } from '@/router'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { defineStore } from 'pinia'
import tagsViewStore from './tagsView'

export interface IUserState {
  token: string
  userId: string
  name: string
  avatar: string
  introduction: string
  roles: string[]
  permissionList: []
  roleList: []
}

export default defineStore({
  id: 'user',
  state: (): IUserState => ({
    token: getToken(),
    userId: '',
    name: '',
    avatar: '',
    introduction: '',
    roles: [],
    permissionList: [],
    roleList: []
  }),
  getters: {},
  actions: {
    // user login
    login(userInfo): Promise<void> {
      const { username, password, code } = userInfo
      return new Promise((resolve, reject) => {
        apiLogin({ username: username.trim(), password, code })
          .then(response => {
            let token = ''

            // 1) 如果 GoFrame 返回格式：{ code, status, data:{} }
            if (response.data) {
              // data.token 或 data 本身就是 token
              token = response.data.token ?? response.data
            }

            if (!token) {
              reject('登录失败：后端未返回 token')
              return
            }

            this.token = token
            setToken(token)
            resolve()
          })
          .catch(error => {
            console.log('接口登录验证失败')
            reject(error)
          })
      })
    },

    // get user info
    getInfo() {
      return new Promise((resolve, reject) => {
        // console.log('=' + this.token + '=')
        apiGetInfo()
          .then(response => {
            const { data } = response

            if (!data) {
              reject('Verification failed, please Login again.')
            }

            const { roles, name, avatar, introduction } = data

            // roles must be a non-empty array
            if (!roles || roles.length <= 0) {
              reject('getInfo: roles must be a non-null array!')
            }

            this.roles = roles
            this.name = name
            this.avatar = avatar
            this.introduction = introduction
            resolve(data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 获取所有 角色role 或 权限permissions
    permissions() {
      return new Promise((resolve, reject) => {
        apiPermissions()
          .then(response => {
            const { data } = response

            if (!data) {
              reject('Verification failed, please Login again.')
            }

            const { permission_list, role_list } = data

            this.permissionList = permission_list
            this.roleList = role_list

            resolve(data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // user logout
    logout(): Promise<void> {
      return new Promise((resolve, reject) => {
        apiLogout()
          .then(() => {
            this.token = ''
            this.roles = []
            removeToken()
            resetRouter()

            // reset visited views and cached views
            // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
            tagsViewStore().delAllViews()

            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // remove token
    resetToken() {
      this.token = ''
      this.roles = []
      removeToken()
    }

    // dynamically modify permissions
    //主动换角色的时候
    // async changeRoles(role) {
    //   const token = role + '-token'

    //   this.token = token
    //   setToken(token)

    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   const infoRes = (await this.getInfo()) as any
    //   let roles = []
    //   if (infoRes.roles) {
    //     roles = infoRes.roles
    //   }

    //   resetRouter()

    //   // generate accessible routes map based on roles
    //   const accessRoutes = await permissionStore().generateRoutes(roles)
    //   // dynamically add accessible routes
    //   // router.addRoutes(accessRoutes);
    //   accessRoutes.forEach(item => {
    //     router.addRoute(item)
    //   })

    //   // reset visited views and cached views
    //   tagsViewStore().delAllViews()
    // }
  }
})
