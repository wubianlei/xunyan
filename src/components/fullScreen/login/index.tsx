import React, { useState } from 'react'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.less'

interface LoginPageProps {}

interface UserInfo {
  phone: string
  code: string
}

const LoginPage: React.FC<LoginPageProps> = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    phone: '',
    code: ''
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [codeLoading, setCodeLoading] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(0)

  useLoad(() => {
    console.log('登录页面加载完成')
  })

  // 手机号输入处理
  const handlePhoneChange = (e: any) => {
    const phone = e.detail.value
    setUserInfo(prev => ({ ...prev, phone }))
  }

  // 验证码输入处理
  const handleCodeChange = (e: any) => {
    const code = e.detail.value
    setUserInfo(prev => ({ ...prev, code }))
  }

  // 手机号验证
  const validatePhone = (phone: string): boolean => {
    const phoneReg = /^1[3-9]\d{9}$/
    return phoneReg.test(phone)
  }

  // 发送验证码
  const sendCode = async () => {
    if (!validatePhone(userInfo.phone)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    setCodeLoading(true)
    
    try {
      // 这里调用发送验证码的API
      // const result = await api.sendCode({ phone: userInfo.phone })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      Taro.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
      
      // 开始倒计时
      startCountdown()
    } catch (error) {
      Taro.showToast({
        title: '发送失败，请重试',
        icon: 'none'
      })
    } finally {
      setCodeLoading(false)
    }
  }

  // 倒计时
  const startCountdown = () => {
    let count = 60
    setCountdown(count)
    
    const timer = setInterval(() => {
      count--
      setCountdown(count)
      
      if (count <= 0) {
        clearInterval(timer)
        setCountdown(0)
      }
    }, 1000)
  }

  // 微信授权登录
  const handleWechatLogin = async () => {
    try {
      setLoading(true)
      
      // 获取微信授权
      const loginRes = await Taro.login()
      console.log('微信登录结果:', loginRes)
      
      if (loginRes.code) {
        // 获取用户信息
        const userProfile = await Taro.getUserProfile({
          desc: '用于完善用户资料'
        })
        
        console.log('用户信息:', userProfile)
        
        // 这里调用后端登录接口
        // const result = await api.wechatLogin({
        //   code: loginRes.code,
        //   userInfo: userProfile.userInfo
        // })
        
        Taro.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 跳转到首页
        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      Taro.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  // 手机号登录
  const handlePhoneLogin = async () => {
    if (!validatePhone(userInfo.phone)) {
      Taro.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }

    if (!userInfo.code || userInfo.code.length !== 6) {
      Taro.showToast({
        title: '请输入6位验证码',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    
    try {
      // 这里调用手机号登录接口
      // const result = await api.phoneLogin({
      //   phone: userInfo.phone,
      //   code: userInfo.code
      // })
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      Taro.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 跳转到首页
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } catch (error) {
      Taro.showToast({
        title: '登录失败，请检查验证码',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='login-container'>
      {/* 头部logo区域 */}
      <View className='header'>
        <Image 
          className='logo' 
          src='/assets/images/logo.png' 
          mode='aspectFit'
        />
        <Text className='title'>欢迎登录</Text>
        <Text className='subtitle'>请选择登录方式</Text>
      </View>

      {/* 登录表单 */}
      <View className='form-container'>
        {/* 手机号输入 */}
        <View className='input-group'>
          <View className='input-wrapper'>
            <Text className='input-label'>+86</Text>
            <Input
              className='input'
              type='number'
              placeholder='请输入手机号'
              value={userInfo.phone}
              maxlength={11}
              onInput={handlePhoneChange}
            />
          </View>
        </View>

        {/* 验证码输入 */}
        <View className='input-group'>
          <View className='input-wrapper'>
            <Input
              className='input'
              type='number'
              placeholder='请输入验证码'
              value={userInfo.code}
              maxlength={6}
              onInput={handleCodeChange}
            />
            <Button
              className={`code-btn ${countdown > 0 ? 'disabled' : ''}`}
              size='mini'
              loading={codeLoading}
              disabled={countdown > 0}
              onClick={sendCode}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </View>
        </View>

        {/* 手机号登录按钮 */}
        <Button
          className='login-btn primary'
          loading={loading}
          onClick={handlePhoneLogin}
        >
          手机号登录
        </Button>

        {/* 分割线 */}
        <View className='divider'>
          <View className='line'></View>
          <Text className='divider-text'>或</Text>
          <View className='line'></View>
        </View>

        {/* 微信登录按钮 */}
        <Button
          className='login-btn wechat'
          loading={loading}
          onClick={handleWechatLogin}
        >
          <Image 
            className='wechat-icon' 
            src='/assets/images/wechat-icon.png' 
            mode='aspectFit'
          />
          微信登录
        </Button>
      </View>

      {/* 用户协议 */}
      <View className='agreement'>
        <Text className='agreement-text'>
          登录即表示同意
          <Text className='link'>《用户协议》</Text>
          和
          <Text className='link'>《隐私政策》</Text>
        </Text>
      </View>
    </View>
  )
}

export default LoginPage