import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { AtList, AtListItem, AtAvatar, AtTag } from 'taro-ui'
import TabBar from '../../components/TabBar'

import "taro-ui/dist/style/components/list.scss"
import "taro-ui/dist/style/components/avatar.scss"
import "taro-ui/dist/style/components/icon.scss"
import "taro-ui/dist/style/components/tag.scss"
import './index.less'

// 用户数据示例（实际项目中可能会从服务器获取）
const userData = {
  name: '张三',
  avatar: 'https://jdc.jd.com/img/200',
  phone: '138****1234',
  email: 'zh****@example.com',
  registrationDate: '2023-10-01',
  participatedResearchCount: 2,
  completedForms: 5,
  region: '北京市朝阳区'
}

export default class Profile extends Component {
  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  
  render () {
    return (
      <View className='profile-page'>
        <View className='header'>
          <View className='avatar-container'>
            <AtAvatar circle image={userData.avatar} size='large' />
          </View>
          <Text className='username'>{userData.name}</Text>
          <View className='user-tags'>
            <AtTag size='small' type='primary' circle>活跃用户</AtTag>
          </View>
        </View>

        <View className='stats-section'>
          <View className='stat-card'>
            <Text className='stat-value'>{userData.completedForms}</Text>
            <Text className='stat-label'>已提交问卷</Text>
          </View>
          <View className='stat-card'>
            <Text className='stat-value'>{userData.participatedResearchCount}</Text>
            <Text className='stat-label'>参与研究</Text>
          </View>
        </View>
        
        <View className='info-section'>
          <Text className='section-title'>个人信息</Text>
          <AtList>
            <AtListItem
              title='姓名'
              extraText={userData.name}
              iconInfo={{ value: 'user', color: '#1890ff' }}
            />
            <AtListItem
              title='手机号'
              extraText={userData.phone}
              iconInfo={{ value: 'phone', color: '#1890ff' }}
            />
            <AtListItem
              title='邮箱'
              extraText={userData.email}
              iconInfo={{ value: 'mail', color: '#1890ff' }}
            />
            <AtListItem
              title='所在地区'
              extraText={userData.region}
              iconInfo={{ value: 'map-pin', color: '#1890ff' }}
            />
            <AtListItem
              title='注册日期'
              extraText={userData.registrationDate}
              iconInfo={{ value: 'calendar', color: '#1890ff' }}
            />
          </AtList>
        </View>
        
        <View className='info-section settings-section'>
          <Text className='section-title'>设置</Text>
          <AtList>
            <AtListItem
              title='隐私设置'
              arrow='right'
              iconInfo={{ value: 'settings', color: '#1890ff' }}
            />
            <AtListItem
              title='通知管理'
              arrow='right'
              iconInfo={{ value: 'bell', color: '#1890ff' }}
            />
            <AtListItem
              title='帮助与反馈'
              arrow='right'
              iconInfo={{ value: 'help', color: '#1890ff' }}
            />
          </AtList>
        </View>

        <View className='footer'>
          <Text className='footer-text'>© {new Date().getFullYear()} 临床试验资格预筛查</Text>
          <Text className='footer-version'>版本 1.0.0</Text>
        </View>
        <View className='tabbar-placeholder'></View>
        <TabBar current={3 as number} />
      </View>
    )
  }
}
