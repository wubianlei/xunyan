import { View, Text, Input } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { formDataService } from '../../services/formDataService'
import { UserFormSubmission } from '../../models/userForm'
import Taro from '@tarojs/taro'
import './index.less'

const Admin = () => {
  const [allSubmissions, setAllSubmissions] = useState<UserFormSubmission[]>([])
  const [filteredSubmissions, setFilteredSubmissions] = useState<UserFormSubmission[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [currentSubmission, setCurrentSubmission] = useState<UserFormSubmission | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadAllSubmissions = () => {
    const submissions = formDataService.getAllFormSubmissions()
    setAllSubmissions(submissions)
    setFilteredSubmissions(submissions)
  }

  useEffect(() => {
    loadAllSubmissions()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSubmissions(allSubmissions)
    } else {
      const filtered = allSubmissions.filter(submission => {
        // Search in timestamp
        if (submission.timestamp.toLowerCase().includes(searchTerm.toLowerCase())) {
          return true
        }
        // Search in form data values
        for (const [_, value] of Object.entries(submission.data)) {
          if (typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true
          }
          if (Array.isArray(value) && value.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))) {
            return true
          }
        }
        return false
      })
      setFilteredSubmissions(filtered)
    }
  }, [searchTerm, allSubmissions])

  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          formDataService.deleteFormSubmission(id)
          loadAllSubmissions()
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
            <View className='detail-item admin-detail-item'>
              <Text className='detail-label'>提交ID：</Text>
              <Text className='detail-value'>{currentSubmission.id}</Text>
            </View>
            <View className='detail-item admin-detail-item'>
              <Text className='detail-label'>提交时间：</Text>
              <Text className='detail-value'>{formatDate(currentSubmission.timestamp)}</Text>
            </View>
            {Object.entries(currentSubmission.data).map(([key, value]) => (
              <View key={key} className='detail-item admin-detail-item'>
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

  return (
    <View className='admin-container large-font-mode'>
      <View className='admin-header'>
        <View className='header-top'>
          <Text 
            className='back-button'
            onClick={() => Taro.navigateBack()}
          >
            返回
          </Text>
          <View className='admin-title'>问卷管理后台</View>
        </View>
        <View className='admin-search'>
          <Input 
            className='search-input'
            placeholder='搜索问卷内容...'
            value={searchTerm}
            onInput={e => setSearchTerm(e.detail.value)}
          />
        </View>
      </View>
      
      <View className='admin-stats'>
        <View className='stat-item'>
          <Text className='stat-value'>{allSubmissions.length}</Text>
          <Text className='stat-label'>总提交数</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value'>{filteredSubmissions.length}</Text>
          <Text className='stat-label'>筛选结果</Text>
        </View>
      </View>
      
      {renderDetailModal()}
      
      {filteredSubmissions.length === 0 ? (
        <View className='empty-state'>
          <Text>暂无匹配的问卷记录</Text>
        </View>
      ) : (
        filteredSubmissions.map((submission) => (
          <View key={submission.id} className='admin-card'>
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
                    <Text className='label'>提交ID：</Text>
                    <Text className='value'>{submission.id}</Text>
                  </View>
                  <View className='info-item'>
                    <Text className='label'>是否成年：</Text>
                    <Text className='value'>{submission.data.isAdult}</Text>
                  </View>
                  <View className='info-item'>
                    <Text className='label'>是否参与其他研究：</Text>
                    <Text className='value'>{submission.data.inOtherStudy}</Text>
                  </View>
                  <View className='info-item'>
                    <Text className='label'>妇婴状态：</Text>
                    <Text className='value'>{submission.data.pregnancyStatus}</Text>
                  </View>
                </View>

                <View className='content-section'>
                  <View className='section-title'>疾病信息</View>
                  <View className='info-item'>
                    <Text className='label'>肺癌类型：</Text>
                    <Text className='value'>{submission.data.lungCancerType}</Text>
                  </View>
                  <View className='info-item'>
                    <Text className='label'>癌症分期：</Text>
                    <Text className='value'>{submission.data.cancerStage}</Text>
                  </View>
                  <View className='info-item'>
                    <Text className='label'>系统治疗：</Text>
                    <Text className='value'>{submission.data.systemicTreatment?.join(', ')}</Text>
                  </View>
                </View>

                <View className='content-section'>
                  <View className='section-title'>其他病史</View>
                  <View className='info-item'>
                    <Text className='label'>当前疾病：</Text>
                    <Text className='value'>{submission.data.currentDiseases?.join(', ')}</Text>
                  </View>
                  <View className='info-item'>
                    <Text className='label'>既往病史：</Text>
                    <Text className='value'>{submission.data.medicalHistory?.join(', ')}</Text>
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
                        title: '联系患者',
                        content: '您确定要联系该患者吗？',
                        success: (res) => {
                          if (res.confirm) {
                            // 这里可以添加联系患者的逻辑，比如打电话或发送消息
                            Taro.showToast({ title: '功能开发中', icon: 'none' })
                          }
                        }
                      })
                    }}
                  >
                    联系患者
                  </Text>
                  <Text 
                    className='action-button'
                    onClick={() => {
                      // 这里可以添加导出数据的逻辑
                      Taro.showToast({ title: '导出功能开发中', icon: 'none' })
                    }}
                  >
                    导出数据
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  )
}

export default Admin
