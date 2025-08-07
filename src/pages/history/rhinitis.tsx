import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { formDataService } from '../../services/formDataService'
import { UserFormSubmission } from '../../models/userForm'
import Taro from '@tarojs/taro'
import TabBar from '../../components/TabBar'
import './index.less'

const History = () => {
  const [submissions, setSubmissions] = useState<UserFormSubmission[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentSubmission, setCurrentSubmission] = useState<UserFormSubmission | null>(null)

  const loadHistory = () => {
    const history = formDataService.getFormHistory()
    setSubmissions(history)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          formDataService.deleteFormSubmission(id)
          loadHistory()
        }
      }
    })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /* 显示详细信息弹窗 */
  const handleShowDetail = (submission: UserFormSubmission) => {
    setCurrentSubmission(submission)
    setShowDetailModal(true)
  }

  /* 渲染详细信息模态框 */
  const renderDetailModal = () => {
    if (!showDetailModal || !currentSubmission) return null
    
    return (
      <View className='detail-modal'>
        <View className='modal-content'>
          <View className='modal-header'>
            <Text className='modal-title'>详细问卷信息</Text>
            <Text className='close-btn' onClick={() => setShowDetailModal(false)}>×</Text>
          </View>
          <View className='modal-body'>
            {Object.entries(currentSubmission.data).map(([key, value]) => (
              <View key={key} className='detail-item'>
                <Text className='detail-label'>{key}：</Text>
                <Text className='detail-value'>
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    )
  }

  if (submissions.length === 0) {
    return (
      <View className='history-container'>
        <View className='empty-state'>
          <Text>暂无问卷记录</Text>
        </View>
        <View className='tabbar-placeholder' />
        <TabBar current={2} />
      </View>
    )
  }

  return (
    <View className='history-container'>
      <View className='history-title'>问卷提交记录</View>
      <View className='history-count'>共 {submissions.length} 条记录</View>
      
      {renderDetailModal()}
      
      {submissions.map((submission) => (
        <View key={submission.id} className='history-card'>
          <View className='card-header'>
            <View className='submission-time'>
              <Text className='time-label'>提交时间：</Text>
              <Text className='time-value'>{formatDate(submission.timestamp)}</Text>
            </View>
            <View className='card-actions'>
              <Text 
                className='action-button'
                onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
              >
                {expandedId === submission.id ? '收起' : '展开'}
              </Text>
              <Text 
                className='action-button delete'
                onClick={() => handleDelete(submission.id)}
              >
                删除
              </Text>
            </View>
          </View>

          {expandedId === submission.id && (
            <View className='card-content'>
              <View className='content-section'>
                <View className='section-title'>基础信息</View>
                <View className='info-item'>
                  <Text className='label'>是否年龄在12-65岁之间：</Text>
                  <Text className='value'>{submission.data.isAgeRange}</Text>
                </View>
                <View className='info-item'>
                  <Text className='label'>是否有1年以上屋尘螨或粉尘螨过敏:</Text>
                  <Text className='value'>{submission.data.isHDMA}</Text>
                </View>
                <View className='info-item'>
                  <Text className='label'>是否仅偶尔暴露于有猫或狗的环境：</Text>
                  <Text className='value'>{submission.data.conditionCatOrDogAppear}</Text>
                </View>
              </View>

              <View className='content-section'>
                <View className='section-title'>疾病信息</View>
                <View className='info-item'>
                  <Text className='label'>常規类型：</Text>
                  <Text className='value'>{submission.data.hasIllness?.join(', ')}</Text>
                </View>
                <View className='info-item'>
                  <Text className='label'>慢性感染：</Text>
                  <Text className='value'>{submission.data.hasInfection?.join(', ')}</Text>
                </View>
                <View className='info-item'>
                  <Text className='label'>严重不良反应史：</Text>
                  <Text className='value'>{submission.data.hasAdverseReaction?.join(', ')}</Text>
                </View>
              </View>

              <View className='content-section'>
                <View className='section-title'>其他病史</View>
                <View className='info-item'>
                  <Text className='label'>相对罕见的身体状况：</Text>
                  <Text className='value'>{submission.data.hasRareDiseases?.join(', ')}</Text>
                </View>
              </View>
              
              <View className='card-actions' style={{ marginTop: '20px' }}>
                <Text 
                  className='action-button'
                  onClick={() => handleShowDetail(submission)}
                >
                  查看详细信息
                </Text>
                <Text 
                  className='action-button'
                  onClick={() => {
                    Taro.showModal({
                      title: '联系CRC',
                      content: '您确定要联系临床研究协调员(CRC)吗？',
                      success: (res) => {
                        if (res.confirm) {
                          // 这里可以添加联系CRC的逻辑，比如打电话或发送消息
                          Taro.showToast({ title: '功能开发中', icon: 'none' })
                        }
                      }
                    })
                  }}
                >
                  联系CRC
                </Text>
                <Text 
                  className='action-button'
                  onClick={() => {
                    // 这里可以添加查看研究排行的逻辑
                    Taro.showToast({ title: '查看关联研究功能开发中', icon: 'none' })
                  }}
                >
                  查看关联研究
                </Text>
              </View>
            </View>
          )}
        </View>
      ))}
      <View className='tabbar-placeholder' />
      <TabBar current={2} />
    </View>
  )
}

export default History
