import Taro from '@tarojs/taro'
import { UserFormData, UserFormSubmission } from '../models/userForm'

/**
 * 表单数据在本地存储中的键名
 * 使用应用名作为前缀，避免与其他数据冲突
 */
const FORM_HISTORY_KEY = 'xunyan_form_history'

/**
 * 表单数据服务
 * 使用单例模式确保全局只有一个实例
 * 负责处理表单数据的持久化存储和读取
 */
class FormDataService {
  private static instance: FormDataService

  private constructor() {}

  static getInstance(): FormDataService {
    if (!FormDataService.instance) {
      FormDataService.instance = new FormDataService()
    }
    return FormDataService.instance
  }

  /**
   * 保存表单数据到本地存储
   * 如果已存在数据，会覆盖原有数据
   * @param data 要保存的表单数据
   */
  saveFormData(data: UserFormData): void {
    try {
      // 创建新的表单提交记录
      const submission: UserFormSubmission = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        data: data
      }

      // 获取现有历史记录
      const history = this.getFormHistory()
      history.unshift(submission)

      // 保存历史记录
      const jsonData = JSON.stringify(history)
      console.log('[FormDataService] 准备保存的数据:', submission)
      console.log('[FormDataService] 序列化后的JSON:', jsonData)
      
      // 在H5环境中直接查看 localStorage
      if (process.env.TARO_ENV === 'h5') {
        console.log('[FormDataService] 当前TARO_ENV:', process.env.TARO_ENV)
        console.log('[FormDataService] localStorage当前状态:', window.localStorage)
      }
      
      Taro.setStorageSync(FORM_HISTORY_KEY, jsonData)
      
      // 立即验证数据是否保存成功
      const savedData = Taro.getStorageSync(FORM_HISTORY_KEY)
      console.log('[FormDataService] 验证已保存的数据:', savedData)
      
      // 获取所有storage的信息
      const storageInfo = Taro.getStorageInfoSync()
      console.log('[FormDataService] Storage信息:', storageInfo)
      
      // 在H5环境中再次确认localStorage
      if (process.env.TARO_ENV === 'h5') {
        console.log('[FormDataService] 保存后localStorage状态:', window.localStorage)
        console.log('[FormDataService] 直接从localStorage读取:', window.localStorage.getItem(FORM_HISTORY_KEY))
      }
      
      console.log('[FormDataService] 表单数据保存成功')
    } catch (error) {
      console.error('[FormDataService] 保存表单数据失败:', error)
      Taro.showToast({
        title: '数据保存失败',
        icon: 'error'
      })
    }
  }

  /**
   * 获取所有表单提交历史
   * @returns 返回表单提交历史记录数组
   */
  getFormHistory(): UserFormSubmission[] {
    try {
      const data = Taro.getStorageSync(FORM_HISTORY_KEY)
      if (!data) {
        return []
      }
      return JSON.parse(data)
    } catch (error) {
      console.error('[FormDataService] 获取表单历史失败:', error)
      return []
    }
  }

  /**
   * 获取最新的表单数据
   * @returns 返回最新的表单数据，如果没有数据则返回null
   */
  getFormData(): UserFormData | null {
    const history = this.getFormHistory()
    console.log('history-----', history[0])
    return history.length > 0 ? history[0].data : null
  }

  /**
   * 删除指定ID的表单记录
   * @param id 要删除的表单记录ID
   */
  deleteFormSubmission(id: string): void {
    try {
      const history = this.getFormHistory()
      const updatedHistory = history.filter(item => item.id !== id)
      Taro.setStorageSync(FORM_HISTORY_KEY, JSON.stringify(updatedHistory))
      
      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('[FormDataService] 删除表单记录失败:', error)
      Taro.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  }

  /**
   * 获取所有用户的表单提交记录
   * 主要用于管理员界面查看所有用户的提交
   * 注意：此方法当前返回的是与 getFormHistory 相同的数据
   * 未来可以扩展为从服务器获取所有用户的数据
   * @returns 返回所有用户的表单提交历史记录数组
   */
  getAllFormSubmissions(): UserFormSubmission[] {
    try {
      const data = Taro.getStorageSync(FORM_HISTORY_KEY)
      if (!data) {
        return []
      }
      return JSON.parse(data)
    } catch (error) {
      console.error('[FormDataService] 获取所有用户表单记录失败:', error)
      return []
    }
  }

}

export const formDataService = FormDataService.getInstance()
