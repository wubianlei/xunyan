import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtButton, AtCard, AtIcon } from 'taro-ui'
import TabBar from '../../components/TabBar'

// import "taro-ui/dist/style/components/button.scss"
// import "taro-ui/dist/style/components/card.scss"
// import "taro-ui/dist/style/components/icon.scss"
// import "taro-ui/dist/style/components/list.scss"
// import "taro-ui/dist/style/components/flex.scss"
import './index.less'

export default class Index extends Component {
  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleNavigateToForm = (): void => {
    Taro.navigateTo({
      url: '/pages/userForm/index'
    })
  }

  handleNavigateToHistory = (): void => {
    Taro.navigateTo({
      url: '/pages/history/index'
    })
  }

  loginNow = (): void => {
    Taro.navigateTo({
      url: '/pages/login/index'
    })
  }

  handleGetRealTimePhoneNumber = (
    e: any
  ) => {
    // 微信返回的字段
    const { code, errMsg, errno } = e.detail;

    if (code) {
      // 把 code 传给你的后台
      console.log('code:',code)
      // Taro.request({
      //   url: `${API_BASE}/wx/getPhoneByCode`,
      //   method: 'POST',
      //   data: { code },               // 仅传 code
      //   success: (res) => {
      //     const { phoneNumber } = res.data;
      //     console.log('用户手机号：', phoneNumber);
      //     // TODO: 登录/注册业务
      //   },
      //   fail: () => {
      //     Taro.showToast({ title: '获取失败', icon: 'none' });
      //   }
      // });
    } else {
      // 用户拒绝或系统错误
      console.error(errMsg, errno);
    }
  };
  
  render () {
    return (
      <View className='index-page'>
        <View className='header'>
          <View className='logo-container'>
            <AtIcon value='heart-2' size='40' color='#1890ff' className='logo-icon' />
          </View>
          <Text className='title'>临床试验入组调查</Text>
          <Text className='subtitle'>欢迎参与临床试验资格预筛查</Text>
        </View>

        <AtCard
          title='参与须知'
          className='notice-card'
          renderIcon={<AtIcon value='alert-circle' size='16' color='#1890ff' />}
        >
          <View className='notice-content'>
            <View className='notice-item'>
              <AtIcon value='check-circle' size='15' color='#52c41a' />
              <Text>本调查用于初步评估您是否符合临床试验的基本要求</Text>
            </View>
            <View className='notice-item'>
              <AtIcon value='lock' size='15' color='#1890ff' />
              <Text>所有信息将严格保密，仅用于临床试验筛选</Text>
            </View>
            <View className='notice-item'>
              <AtIcon value='clock' size='15' color='#faad14' />
              <Text>完整填写问卷大约需要5-10分钟</Text>
            </View>
          </View>
        </AtCard>

        <View className='action-section'>
          <AtButton 
            type='primary' 
            className='start-button'
            onClick={this.handleNavigateToForm}
          >
            <View className='button-content'>
              <Text>开始填写调查问卷</Text>
              <AtIcon value='chevron-right' size='18' color='#fff' />
            </View>
          </AtButton>
          <Button
            type="primary"
            openType="getRealtimePhoneNumber"
            onGetRealTimePhoneNumber={this.handleGetRealTimePhoneNumber}
          >
            一键获取手机号
          </Button>
          
          <View className='history-link' onClick={this.handleNavigateToHistory}>
            <AtIcon value='list' size='16' color='#1890ff' />
            <Text className='link-text'>查看历史提交记录</Text>
          </View>
        </View>

        <View className='footer'>
          <Text className='footer-text'>© {new Date().getFullYear()} 临床试验资格预筛查</Text>
        </View>
        <View className='tabbar-placeholder'></View>
        <TabBar current={0 as number} />
      </View>
    )
  }
}
