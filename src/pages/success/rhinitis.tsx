import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { AtCard, AtProgress, AtDivider } from 'taro-ui'
import { formDataService } from '../../services/formDataService'
import type { UserFormData } from '../../models/userForm'
import type { ResearchMatch } from '../../models/clinicalResearch'
import { researchMatchService } from '../../services/rhinitisMatchService'
import TabBar from '../../components/TabBar'
import './index.less'


interface SuccessPageState {
  formData: UserFormData | null
  loading: boolean
  error: string | null
  researchMatches: ResearchMatch[]
  totalMatchScore: number
  maxPossibleScore: number
}

export default class SuccessPage extends Component<{}, SuccessPageState> {
  state: SuccessPageState = {
    formData: null,
    loading: true,
    error: null,
    researchMatches: [],
    totalMatchScore: 0,
    maxPossibleScore: 0 // 初始化为0，在计算匹配时动态设置
  }

  componentDidMount() {
    this.loadFormData()
  }

  /**
   * 计算研究匹配度
   * 根据表单数据评估患者与各项研究的匹配程度
   */
  calculateResearchMatches = (formData: UserFormData) => {
    try {
      // 使用研究匹配服务计算匹配度
      const matches = researchMatchService.getMatchingResearch(formData);
      
      // 计算总匹配得分
      const totalScore = matches.reduce((sum, match) => sum + match.matchScore, 0);
      const maxScore = matches.reduce((sum, match) => sum + match.maxPossibleScore, 0);

      // 如果没有匹配到研究，显示提示
      if (matches.length === 0) {
        Taro.showToast({
          title: '暂未匹配到符合条件的研究',
          icon: 'none',
          duration: 2000
        });
      }

      this.setState({
        researchMatches: matches,
        totalMatchScore: totalScore,
        maxPossibleScore: maxScore > 0 ? maxScore : 1 // 避免除偤0的情况
      });
    } catch (error) {
      console.error('计算研究匹配度时出错:', error);
      this.setState({
        error: '计算研究匹配度时出错，请稍后再试'
      });
    }
  }



  loadFormData = () => {
    this.setState({
      loading: true,
      error: null
    });
    
    try {
      const formData = formDataService.getFormData();

      console.log('formData--------------', formData)
      
      if (!formData) {
        this.setState({
          loading: false,
          error: '未找到表单数据，请先完成问卷'
        });
        
        // 向用户显示提示并延时跳转到表单页
        Taro.showToast({
          title: '未找到表单数据，即将跳转到表单页',
          icon: 'none',
          duration: 2000
        });
        
        setTimeout(() => {
          Taro.navigateTo({
            url: '/pages/userForm/index'
          });
        }, 2000);
        
        return;
      }
      
      this.setState({
        formData,
        loading: false,
        error: null
      }, () => {
        // 计算研究匹配度
        this.calculateResearchMatches(formData);
      });
    } catch (error) {
      console.error('加载表单数据失败:', error);
      this.setState({
        loading: false,
        error: '加载数据失败，请稍后再试'
      });
    }
  }

  renderArrayData = (data: string[] | string | null | undefined) => {
    // Handle case when data is undefined or null
    if (!data) return '无';
    
    // Handle case when data is a string
    if (typeof data === 'string') return data;
    
    // Handle case when data is an array
    if (Array.isArray(data)) {
      return data.length > 0 ? data.join('、') : '无';
    }
    
    // Handle any other unexpected types
    return String(data);
  }

  /**
   * 渲染研究匹配结果
   */
  renderResearchMatches = () => {
    const { researchMatches, totalMatchScore, maxPossibleScore } = this.state;
    
    if (researchMatches.length === 0) {
      return (
        <View className='no-matches'>
          <Text>暂无可匹配的研究</Text>
        </View>
      )
    }

    // 计算总体匹配百分比
    const totalPercentage = Math.round((totalMatchScore / maxPossibleScore) * 100);
    
    return (
      <View className='research-matches'>
        <View className='total-match-score'>
          <View className='score-header'>
            <Text className='score-title'>总体研究匹配度</Text>
            <Text className='score-value'>{totalMatchScore}/{maxPossibleScore}</Text>
          </View>
          <AtProgress percent={totalPercentage} color={totalPercentage >= 70 ? '#13CE66' : totalPercentage >= 40 ? '#FFCA3A' : '#FF4949'} />
        </View>
        
        <AtDivider content='具体研究匹配情况' fontColor='#333' lineColor='#e5e5e5' />
        
        {researchMatches.map((match) => {
          // 使用模型中的匹配百分比
          const matchPercentage = Math.round(match.matchPercentage);
          const matchColor = matchPercentage >= 70 ? '#13CE66' : matchPercentage >= 40 ? '#FFCA3A' : '#FF4949';
          
          return (
            <View key={match.researchId} className='match-item'>
              <View className='match-header'>
                <Text className='match-name'>{match.name}</Text>
                <Text className='match-score' style={{ color: matchColor }}>{match.matchScore}/{match.maxPossibleScore} ({matchPercentage}%)</Text>
              </View>
              <AtProgress percent={matchPercentage} color={matchColor} />
              <Text className='match-description'>{match.description}</Text>
              <View className='match-requirements'>
                <Text className='requirements-title'>主要入组条件：</Text>
                {match.requirements.map((req, i) => (
                  <Text key={i} className='requirement-item'>· {req}</Text>
                ))}
              </View>
              {match.metCriteria.length > 0 && (
                <View className='match-met-criteria'>
                  <Text className='criteria-title'>满足的标准：</Text>
                  {match.metCriteria.map((criterion, i) => (
                    <Text key={i} className='criterion-item success'>✓ {criterion}</Text>
                  ))}
                </View>
              )}
              {match.unmetCriteria.length > 0 && (
                <View className='match-unmet-criteria'>
                  <Text className='criteria-title'>未满足的标准：</Text>
                  {match.unmetCriteria.map((criterion, i) => (
                    <Text key={i} className='criterion-item warning'>✗ {criterion}</Text>
                  ))}
                </View>
              )}
            </View>
          )
        })}
      </View>
    )
  }

  /**
   * 渲染下一步指导
   */
  renderNextSteps = () => {
    const { researchMatches } = this.state;
    const hasHighMatch = researchMatches.some(match => match.matchPercentage >= 70);
    
    return (
      <View className='next-steps'>
        <AtDivider content='下一步' fontColor='#333' lineColor='#e5e5e5' />
        
        <View className='steps-content'>
          <Text className='steps-title'>{hasHighMatch ? '恭喜您！您可能符合我们的研究条件' : '感谢您完成所有评估'}</Text>
          <Text className='steps-description'>
            {
            hasHighMatch 
              ? '根据您的信息，您与我们的一项或多项研究有较高的匹配度。我们建议您尽快联系您的主治医生或我们的研究团队，进行下一步详细评估。'
              : '虽然初步匹配度不是很高，但临床研究的入组标准复杂多样，建议您仍与医生讨论是否有合适的临床研究机会。'
            }
          </Text>
          
          <View className='steps-list'>
            <Text className='steps-list-title'>接下来您可以：</Text>
            <Text className='steps-list-item'>*. 联系我们的研究团队，</Text>
            <Text className='steps-list-item'>*. 安排线下评估，确认是否符合完整入组标准</Text>
          </View>
          
          <Button className='contact-button' type='primary'>联系研究团队</Button>
        </View>
      </View>
    )
  }

  render() {
    const { formData, loading, error } = this.state

    if (loading) {
      return (
        <View className='success-page loading'>
          <Text>正在加载数据...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View className='success-page error'>
          <Text className='error-message'>{error}</Text>
          <View className='retry-button' onClick={this.loadFormData}>
            <Text>重试</Text>
          </View>
        </View>
      )
    }

    if (!formData) {
      return (
        <View className='success-page error'>
          <Text>数据加载失败</Text>
        </View>
      )
    }

    return (
    <View className='success-page'>
      <View className='success-header'>
        <Text className='success-title'>提交成功</Text>
        <Text className='success-subtitle'>您的问卷信息已经成功提交</Text>
      </View>

      {/* 研究匹配结果 */}
      <View className='match-results-section'>
        {this.renderResearchMatches()}
      </View>

      {/* 下一步指导 */}
      {this.renderNextSteps()}

      {/* 详细表单数据 */}
      {/* <View className='form-data'>
        <AtDivider content='您的提交信息' fontColor='#333' lineColor='#e5e5e5' />
        
        <AtCard title='基础信息'>
          <View className='info-item'>
            <Text className='label'>年龄确认：</Text>
            <Text className='value'>{formData.isAdult === '是' ? '已满18岁' : '未满18岁'}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>研究参与情况：</Text>
            <Text className='value'>{formData.inOtherStudy === '是' ? '已参与其他研究' : '未参与其他研究'}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>身体状况：</Text>
            <Text className='value'>{formData.physicalStatus || '未填写'}</Text>
          </View>
        </AtCard>

        <AtCard title='疾病状况'>
          <View className='info-item'>
            <Text className='label'>肺癌治疗情况：</Text>
            <Text className='value'>{formData.lungCancerTreatment}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>肺癌类型：</Text>
            <Text className='value'>{formData.lungCancerType}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>分期：</Text>
            <Text className='value'>{formData.cancerStage}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>转移情况：</Text>
            <Text className='value'>{formData.metastasis || '未填写'}</Text>
          </View>
        </AtCard>

        <AtCard title='治疗信息'>
          <View className='info-item'>
            <Text className='label'>系统治疗：</Text>
            <Text className='value'>{this.renderArrayData(formData.systemicTreatment)}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>EGFR状态：</Text>
            <Text className='value'>{formData.egfrStatus}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>EGFR突变：</Text>
            <Text className='value'>{formData.egfrMutation}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>EGFR TKI药物：</Text>
            <Text className='value'>{this.renderArrayData(formData.egfrTKIDrugs)}</Text>
          </View>
        </AtCard>

        <AtCard title='最近治疗情况'>
          <View className='info-item'>
            <Text className='label'>最近手术/治疗：</Text>
            <Text className='value'>{formData.recentSurgery || '未填写'}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>最近用药：</Text>
            <Text className='value'>{formData.recentMedication || '未填写'}</Text>
          </View>
        </AtCard>
        
        <AtCard title='肺部相关情况'>
          <View className='info-item'>
            <Text className='label'>肺部问题：</Text>
            <Text className='value'>{formData.lungProblems || '未填写'}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>放射性肺炎：</Text>
            <Text className='value'>{formData.radiationPneumonitis || '未填写'}</Text>
          </View>
        </AtCard>
        
        <AtCard title='心血管情况'>
          <View className='info-item'>
            <Text className='label'>心脏疾病：</Text>
            <Text className='value'>{formData.heartDisease || '未填写'}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>高血压：</Text>
            <Text className='value'>{formData.hypertension || '未填写'}</Text>
          </View>
        </AtCard>

        <AtCard title='其他健康状况'>
          <View className='info-item'>
            <Text className='label'>当前疾病：</Text>
            <Text className='value'>{this.renderArrayData(formData.currentDiseases)}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>病史：</Text>
            <Text className='value'>{this.renderArrayData(formData.medicalHistory)}</Text>
          </View>
          <View className='info-item'>
            <Text className='label'>吸收问题：</Text>
            <Text className='value'>{formData.absorptionIssues || '未填写'}</Text>
          </View>
        </AtCard>
      </View> */}
      <View className='tabbar-placeholder' />
      <TabBar current={3} />
    </View>
  )
}

}
