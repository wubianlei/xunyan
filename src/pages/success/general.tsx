import { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import { AtCard, AtProgress, AtDivider } from 'taro-ui'
import { formDataService } from '../../services/formDataService'
import type { UserFormData } from '../../models/userForm'
import questionsData from '../userForm/mock/rhinitisFinal.json'
import type { ResearchMatch } from '../../models/clinicalResearch'
import { researchMatchService } from '../../services/rhinitisMatchService'
import TabBar from '../../components/TabBar'
import './general.less'


interface GeneralSuccessPageState {
  formData: UserFormData | null
  loading: boolean
  error: string | null
  researchMatches: ResearchMatch[]
  totalMatchScore: number
  maxPossibleScore: number
  inmunotekPassRate: string
  alkPassRate: string
  inmMet: string[]
  inmUnmet: string[]
  alkMet: string[]
  alkUnmet: string[]
  highestResearch: 'none' | 'Inmunotek' | 'ALK'
}

export default class GeneralSuccessPage extends Component<{}, GeneralSuccessPageState> {
  state: GeneralSuccessPageState = {
    formData: null,
    loading: true,
    error: null,
    researchMatches: [],
    inmunotekPassRate: '-',
    alkPassRate: '-',
    inmMet: [],
    inmUnmet: [],
    alkMet: [],
    alkUnmet: [],
    totalMatchScore: 0,
    maxPossibleScore: 0, // 初始化为0，在计算匹配时动态设置
    highestResearch: 'none'
  }

  componentDidMount() {
    this.loadFormData().then(() => {
      this.preparePassDetail();
    });
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

  // 放在 calculateResearchMatches 之后即可
  private preparePassDetail = () => {
    const form = this.state.formData;
    if (!form) return;

    const questions = questionsData.questions;
    const inmMet: string[] = [];
    const inmUnmet: string[] = [];
    const alkMet: string[] = [];
    const alkUnmet: string[] = [];

    Object.entries(questions).forEach(([idx, q]) => {
      const userVal = form[q.field as keyof UserFormData];
      const passArr = q.pass ?? [];
      const isMultiple = q.multiple ?? false;

      let passed = false;
      if (isMultiple) {
        const arr = Array.isArray(userVal) ? userVal : [userVal];
        passed = passArr.length === 0 || arr.some(v => passArr.includes(v));
      } else {
        passed = passArr.length === 0 || passArr.includes(userVal as string);
      }

      // 根据所属研究分类
      if (q.research.includes('Inmunotek')) {
        passed ? inmMet.push(`Q${idx}: ${q.title}`) : inmUnmet.push(`Q${idx}: ${q.title}`);
      }
      if (q.research.includes('ALK')) {
        passed ? alkMet.push(`Q${idx}: ${q.title}`) : alkUnmet.push(`Q${idx}: ${q.title}`);
      }
    })



    this.setState({ inmMet, inmUnmet, alkMet, alkUnmet });
  };

  loadFormData = async () => {
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
        this.calculateResearchMatches(formData)
        // 计算 Inmunotek & ALK 通过率
        const inmFlags = formData.inmunotekPassFlags ?? [];
        const alkFlags = formData.alkPassFlags ?? [];
        const inmCnt   = formData.inmunotekCount ?? 0;
        const alkCnt   = formData.alkCount ?? 0;

        const inmRate  = inmCnt ? ((inmFlags.filter(Boolean).length / inmCnt) * 100).toFixed(0) + '%' : '0%';
        const alkRate  = alkCnt ? ((alkFlags.filter(Boolean).length / alkCnt) * 100).toFixed(0) + '%' : '0%';
        
        // 找出匹配率最高的研究

        const inmPct = inmCnt ? (inmFlags.filter(Boolean).length / inmCnt) : 0;
        const alkPct = alkCnt ? (alkFlags.filter(Boolean).length / alkCnt) : 0;

        let highest: 'none' | 'Inmunotek' | 'ALK' = 'none';
        if (inmPct > alkPct) {
          highest = 'Inmunotek'
        } else if (alkPct > inmPct) {
          highest = 'ALK'
        } else if (inmPct > 0) {
          highest = 'Inmunotek' // 平局时默认先显示 Inmunotek
        }
        
        this.setState({ 
          inmunotekPassRate: inmRate,
          alkPassRate: alkRate,
          highestResearch: highest 
        })
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
   * 独立问卷
   */
  handleCoreQuestions = () => {
    Taro.navigateTo({
        url: '/pages/userForm/core'
    })
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
    
    return (
      <View className='research-matches'>
        
        <AtDivider content='具体研究匹配情况' fontColor='#333' lineColor='#e5e5e5' />
        
        {/* 问卷通过率卡片 */}
        {/* Inmunotek 卡片 */}
        <View className='research-detail-card inmunotek'>
          <Text className='card-title'>Inmunotek 临床研究</Text>
          <View className='pass-bar'>
            <View className='rate-fill' style={{ width: `${this.state.inmunotekPassRate}` }} />
            <Text className='rate-text'>{this.state.inmunotekPassRate}</Text>
          </View>

          {this.state.inmMet.length > 0 && (
            <View className='criteria met'>
              <Text className='criteria-title'>已满足</Text>
              {this.state.inmMet.map((t, i) => <Text key={i} className='item'>✓ {t}</Text>)}
            </View>
          )}

          {this.state.inmUnmet.length > 0 && (
            <View className='criteria unmet'>
              <Text className='criteria-title'>未满足</Text>
              {this.state.inmUnmet.map((t, i) => <Text key={i} className='item'>✗ {t}</Text>)}
            </View>
          )}
        </View>

        {/* ALK 卡片 */}
        <View className='research-detail-card alk'>
          <Text className='card-title'>ALK 临床研究</Text>
          <View className='pass-bar'>
            <View className='rate-fill' style={{ width: `${this.state.alkPassRate}` }} />
            <Text className='rate-text'>{this.state.alkPassRate}</Text>
          </View>

          {this.state.alkMet.length > 0 && (
            <View className='criteria met'>
              <Text className='criteria-title'>已满足</Text>
              {this.state.alkMet.map((t, i) => <Text key={i} className='item'>✓ {t}</Text>)}
            </View>
          )}

          {this.state.alkUnmet.length > 0 && (
            <View className='criteria unmet'>
              <Text className='criteria-title'>未满足</Text>
              {this.state.alkUnmet.map((t, i) => <Text key={i} className='item'>✗ {t}</Text>)}
            </View>
          )}
        </View>  
      </View>
    )
  }

  /**
   * 渲染下一步指导
   */
  renderNextSteps = () => {
    const { researchMatches } = this.state;
    const hasHighMatch = researchMatches.some(match => match.matchPercentage >= 70);
    console.log('hasHighMatch======',hasHighMatch)
    console.log('researchMatches=====',researchMatches)
    return (
      // <View className='next-steps'>
      //   <AtDivider content='下一步' fontColor='#333' lineColor='#e5e5e5' />
        
      //   <View className='steps-content'>
      //     <Text className='steps-title'>{hasHighMatch ? '恭喜您！您可能符合我们的研究条件' : '感谢您完成初步评估'}</Text>
      //     <Text className='steps-description'>
      //       {hasHighMatch 
      //         ? '根据您的信息，您与我们的一项或多项研究有较高的匹配度。我们建议您尽快联系您的主治医生或我们的研究团队，进行下一步详细评估。'
      //         : '请继续回答更详细的问卷，全部完成后可能与我们的一项或多项研究有较高的匹配度。'
      //         }
      //     </Text>
          
      //     <View className='steps-list'>
      //       <Text className='steps-list-title'>接下来您可以：</Text>
      //       <Text className='steps-list-item'>*. 继续回答临床研究的独立问卷。</Text>
      //     </View>
      //     <Button className='contact-button' type='primary'>Inmunotek 临床研究</Button>
      //     <Button className='contact-button' onClick={this.handleCoreQuestions} type='primary'>ALK 临床研究</Button>
      //   </View>
      // </View>
      <View className='next-steps'>
        <AtDivider content='下一步' fontColor='#333' lineColor='#e5e5e5' />

        <View className='steps-content'>
          <Text className='steps-title'>
            {this.state.highestResearch === 'none'
              ? '感谢您的填写'
              : `恭喜您！您可能符合我们的研究条件。\n ${this.state.highestResearch} 临床研究的匹配度最高，可继续回答独立问卷。`}
          </Text>

          {/* 主按钮（显眼） */}
          {this.state.highestResearch !== 'none' && (
            <Button
              className='contact-button primary'
              type='primary'
              onClick={() =>
                Taro.navigateTo({
                  url: `/pages/userForm/core?research=${this.state.highestResearch}`
                })
              }
            >
              继续 {this.state.highestResearch} 临床研究
            </Button>
          )}

          {/* 次显按钮（其他研究） */}
          {['Inmunotek', 'ALK'].map(research =>
            research !== this.state.highestResearch && (
              <Button
                key={research}
                className='contact-button secondary'
                onClick={() => Taro.navigateTo({ url: `/pages/userForm/core?research=${research}` })}
              >
                {research} 临床研究（可选）
              </Button>
            )
          )}
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
        <Text className='success-subtitle'>您的综合问卷信息已经成功提交</Text>
      </View>

      {this.renderResearchMatches()}
      {/* 下一步指导 */}
      {this.renderNextSteps()}

     
      <View className='tabbar-placeholder' />
      <TabBar current={3} />
    </View>
  )
}

}
