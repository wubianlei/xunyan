import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtForm,AtInput,AtButton } from 'taro-ui'
import { formDataService } from '../../services/formDataService'
// 引入并实际使用UserFormData类型
import type { UserFormData } from '../../models/userForm'
import TabBar from '../../components/TabBar'

import questionsData from './mock/rhinitisFinal.json'
import './index.less'

// import "taro-ui/dist/style/components/form.scss"
// import 'taro-ui/dist/style/index.scss'

const QUESTION_MAX_NUM = Object.keys(questionsData.questions).length

interface UserFormState {
  // 核心字段
  dustMiteAllergyDiagnosis: string
  otherAllergenSensitivity: string[]
  ageEligibility: string
  gender: string
  pregnancyLactationPlanning: string
  
  // 疾病状况
  respiratoryConditions: string[]
  immuneSystemConditions: string[]
  cardiovascularEndocrineConditions: string[]
  chronicInfectionHistory: string[]
  psychiatricOralOncologyConditions: string[]
  severeAdverseReactionHistory: string[]
  systemicAllergicReactionHistory: string[]
  
  // 治疗史
  antidepressantAntipsychoticHistory: string
  pastDustMiteImmunotherapyHistory: string
  pastYearDustMiteImmunotherapy: string[]
  
  // 近期用药和治疗
  recentImmunosuppressiveMedicationUse: string[]
  recentKetotifenAntipsychoticUse: string[]
  recentRespiratoryComplications: string[]
  pastTwoYearAllergicEvents: string[]
  recentNasalSurgeryHistory: string
  recentResearchParticipation: string
  recentOralCorticosteroidUse: string[]
  recentLongActingCorticosteroidUse: string[]
  recentAsthmaExacerbationEvents: string[]
  recentBiologicTherapyUse: string[]
  
  // 研究期间承诺和限制
  contraceptionComplianceDuringStudy: string
  studyLifestyleRestrictionCompliance: string
  researcherRelationshipAndStudyEligibility: string
  prohibitedMedicationComplianceDuringStudy: string
  currentAllergenImmunotherapy: string
  
  inmunotekCount: number;
  alkCount: number;

  currentQuestion: number
  presentValue: string[]
}

  const NONE = ['以上均没有' , '没有' , '无','没有使用过以上2种药物', '没有使用过' , '以上都没有' , '没有以上情况' , '没有以上疾病', '没有发生过']

export default class UserForm extends Component<{}, UserFormState> {
  state: UserFormState = {
    // 核心字段
    dustMiteAllergyDiagnosis: '',
    otherAllergenSensitivity: [],
    ageEligibility: '',
    gender: '',
    pregnancyLactationPlanning: '',
    
    // 疾病状况
    respiratoryConditions: [],
    immuneSystemConditions: [],
    cardiovascularEndocrineConditions: [],
    chronicInfectionHistory: [],
    psychiatricOralOncologyConditions: [],
    severeAdverseReactionHistory: [],
    systemicAllergicReactionHistory: [],
    
    // 治疗史
    antidepressantAntipsychoticHistory: '',
    pastDustMiteImmunotherapyHistory: '',
    pastYearDustMiteImmunotherapy: [],
    
    // 近期用药和治疗
    recentImmunosuppressiveMedicationUse: [],
    recentKetotifenAntipsychoticUse: [],
    recentRespiratoryComplications: [],
    pastTwoYearAllergicEvents: [],
    recentNasalSurgeryHistory: '',
    recentResearchParticipation: '',
    recentOralCorticosteroidUse: [],
    recentLongActingCorticosteroidUse: [],
    recentAsthmaExacerbationEvents: [],
    recentBiologicTherapyUse: [],
    
    // 研究期间承诺和限制
    contraceptionComplianceDuringStudy: '',
    studyLifestyleRestrictionCompliance: '',
    researcherRelationshipAndStudyEligibility: '',
    prohibitedMedicationComplianceDuringStudy: '',
    currentAllergenImmunotherapy: '',

    inmunotekCount: 0,
    alkCount: 0,
    currentQuestion: 1,
    presentValue: []
  }



  handleChange = (field: string, value: string, isMultiSelect: boolean, research: string[]): void => {
     // 统计不同 research 的题目量
    const inmunotekCount = research.includes('Inmunotek') ? this.state.inmunotekCount + 1 : this.state.inmunotekCount;
    const alkCount = research.includes('ALK') ? this.state.alkCount + 1 : this.state.alkCount;

    this.setState({ inmunotekCount, alkCount })

    if (isMultiSelect) {
      const currentValue = this.state[field as keyof UserFormState] as string[]
      let newValue: string[]
      
      // 多选逻辑 每选一个新选项 添加内容至数组
      if (currentValue.includes(value)) {
        newValue = currentValue.filter(v => v !== value)
      } else {
        newValue = [...currentValue, value]
      }

      // If user selects '以上均没有', unselect all others
      if (NONE.includes(value)) {
        newValue = [value]
      } else if (newValue.length > 0 && newValue.some(item => NONE.includes(item))) {
        newValue = newValue.filter(v => !NONE.includes(v))
      }

      console.log('newV', newValue)

      this.setState({
        [field]: newValue,
        presentValue: newValue
      } as unknown as Pick<UserFormState, keyof UserFormState>, () => {
        if (newValue.length > 0) {
          // 统计不同research的题目量
          // if(research.includes('Inmunotek')) {
          //   this.setState({ numOfInmunotek: this.state.numOfInmunotek + 1 });
          // } else if(research.includes('ALK')) {
          //   this.setState({ numOfALK: this.state.numOfALK + 1 });
          // }
          // 退出问卷流程 暂时不走这个逻辑
          // this.checkExitConditions(field, newValue)
          // Only advance if it's not an exit condition
          const isLastQuestion = this.state.currentQuestion === QUESTION_MAX_NUM;
          if (isLastQuestion) {
            // 如果是最后一个问题，自动提交表单
            this.handleSubmit();
          }
        }
      })
    } else {
      this.setState({
        [field]: value,
        presentValue: [...value]
      } as unknown as Pick<UserFormState, keyof UserFormState>, () => {
        // 退出问卷流程 暂时不走这个逻辑
        // this.checkExitConditions(field, value)
        console.log('newV', value)
        
        const isLastQuestion = this.state.currentQuestion === QUESTION_MAX_NUM;
        if (isLastQuestion) {
          // 如果是最后一个问题，自动提交表单
          this.handleSubmit();
        } else {
          // this.setState({ currentQuestion: this.state.currentQuestion + 1 });
        }
      })
    }
  }

  // shouldExit = (field: string, value: string | string[]): boolean => {
  //   const exitConditions = this.getExitConditions()
  //   if (field in exitConditions) {
  //     const condition = exitConditions[field as keyof typeof exitConditions]
  //     if (Array.isArray(value)) {
  //       return value.some(v => condition.includes(v))
  //     }
  //     return condition.includes(value)
  //   }
  //   return false
  // }

  passConditions = () => {
    return {
      // 核心字段
      dustMiteAllergyDiagnosis: '是', // 
      otherAllergenSensitivity: ['以上都没有'],
      ageEligibility: '是', // 
      gender: '',
      pregnancyLactationPlanning: ['否'], // 
      
      // 疾病状况 - 有以下疾病则退出
      respiratoryConditions: ['没有'],
      immuneSystemConditions: ['没有以上情况'],
      cardiovascularEndocrineConditions: ['没有以上疾病'],
      chronicInfectionHistory: ['以上均没有'],
      psychiatricOralOncologyConditions: ['没有以上疾病'],
      severeAdverseReactionHistory: ['没有'],
      systemicAllergicReactionHistory: ['没有以上情况'],
      
      // 治疗史
      antidepressantAntipsychoticHistory: ['是'], 
      pastDustMiteImmunotherapyHistory: ['接受过舌下治疗，超过1个月', '接受过过敏针治疗'],
      pastYearDustMiteImmunotherapy: ['接受过舌下治疗', '接受过过敏针治疗'],
      
      // 近期用药和治疗
      recentImmunosuppressiveMedicationUse: ['糖皮质激素', '生物制剂药物（如生物注射剂）'],
      recentKetotifenAntipsychoticUse: ['酮替芬', '抗精神病药物'],
      recentRespiratoryComplications: ['呼吸道感染', '哮喘急性发作且病情不稳定'],
      pastTwoYearAllergicEvents: ['慢性荨麻疹', '严重急性过敏反应（如过敏性休克）', '血管性水肿'],
      recentNasalSurgeryHistory: ['是'],
      recentResearchParticipation: ['是'],
      recentOralCorticosteroidUse: ['泼尼松（强的松）', '甲泼尼龙', '地塞米松', '口服过其他糖皮质激素药物'],
      recentLongActingCorticosteroidUse: ['地塞米松', '倍他米松', '曲安奈德', '使用过其他长效或注射型糖皮质激素'],
      recentAsthmaExacerbationEvents: ['急救治疗', '住院治疗', '全身性糖皮质激素治疗'],
      recentBiologicTherapyUse: ['奥马珠单抗（茁乐）', '度普利尤单抗（达必妥）', '美泊利珠单抗（新可来）', '其他抗过敏生物制剂'],
      
      // 研究期间承诺和限制
      contraceptionComplianceDuringStudy: ['不接受'],
      studyLifestyleRestrictionCompliance: ['不接受'],
      researcherRelationshipAndStudyEligibility: ['不符合'],
      prohibitedMedicationComplianceDuringStudy: ['否'],
      currentAllergenImmunotherapy: ['是']
    }
  }

  // checkExitConditions = (field: string, value: string | string[]): void => {
  //   if (this.shouldExit(field, value)) {
  //     this.exitQuestionnaire()
  //   }
  // }

  exitQuestionnaire = (): void => {
    Taro.showModal({
      title: '提示',
      content: '很抱歉，您不符合本次研究的入组条件',
      showCancel: false,
      success: () => {
        // Taro.navigateBack()
        Taro.navigateTo({url: '/pages/index/index'})
      }
    })
  }

  handleSubmit = async (): Promise<void> => {
    try {
      console.log('问卷答案:', this.state)
      console.log('Inmunotek 题目数量:', this.state.inmunotekCount)
      console.log('ALK 题目数量:', this.state.alkCount)
      
      // 移除currentQuestion，它不需要展示在成功页面
      const { currentQuestion, ...formData } = this.state as unknown as UserFormState & { currentQuestion: number }
      
      // 保存表单数据到localStorage
      formDataService.saveFormData(formData)

      // 等待一帧确保数据已保存
      await new Promise(resolve => Taro.nextTick(resolve))

      // 再次确认数据已保存
      const savedData = formDataService.getFormData()
      if (!savedData) {
        throw new Error('数据保存失败')
      }

      // 跳转到成功页面 综合问卷回答结束后跳转
      await Taro.navigateTo({
        url: '/pages/success/general'
      })

      Taro.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      })
    } catch (error) {
      console.error('提交表单失败:', error)
      Taro.showToast({
        title: '提交失败',
        icon: 'error',
        duration: 2000
      })
    }
  }

  handleNextQuestion = (): void => {
    if(this.state.presentValue.length > 0) {
      this.setState({ 
        currentQuestion: this.state.currentQuestion + 1,
        presentValue: []
      })
    } else {
      Taro.showToast({
        title: '请至少选择一个选项',
        icon: 'none',
        duration: 1000
      })
    }
  }

  handlePrevQuestion = (): void => {
    this.setState({ currentQuestion: this.state.currentQuestion - 1 });
  }

  renderQuestion = () => {
    const { currentQuestion } = this.state
    const { questions } = questionsData

    // 将数字转换为字符串键以正确索引问题数据
    const currentQ = questions[String(currentQuestion)]

    if (!currentQ) return null

    return (
      <View className="question-container">
        <View className="question-number">问题 {currentQuestion}/{QUESTION_MAX_NUM}</View>
        <Text className="question-title">{currentQ.title}</Text>
        <View className="options-container">
          {currentQ.options.map((option, index) => {
            // const isMultiSelect = this.isMultiSelectQuestion(currentQ)
            const isMultiSelect = currentQ.multiple || false
            const value = this.state[currentQ.field as keyof UserFormState]
            const isSelected = isMultiSelect
              ? (value as string[]).includes(option.value)
              : value === option.value

              // 有些问题有前置答案的条件
            if(currentQ.depend && currentQ.precondition) {
              if(Array.isArray(currentQ.precondition)) {
                for(let val of this.state[currentQ.depend]) {
                  if(currentQ.precondition.includes(val)) {
                    console.log('pass')
                    break;
                  } else {
                    this.setState({ currentQuestion: this.state.currentQuestion + 1 });
                  }
                }
              } else if(typeof currentQ.precondition === 'string') {
                if(this.state[currentQ.depend] === currentQ.precondition) {
                  console.log('pass')
                } else {
                    this.setState({ currentQuestion: this.state.currentQuestion + 1 });
                }
              }
            }

            return (
                <View
                  key={option.value}
                  className={`option-item ${isSelected ? 'selected' : ''} ${isMultiSelect ? 'multi-select' : ''}`}
                  onClick={() => this.handleChange(currentQ.field, option.value, isMultiSelect,currentQ.research)}
                >
                  <View className={`option-circle ${isMultiSelect ? 'square' : ''}`}>
                    <View className="option-inner" />
                  </View>
                  <Text className="option-label">{option.label}</Text>
                  {option.label.includes('**') && (
                    <Text className="option-note">（请详询医生）</Text>
                  )}
                </View>
              )

            
          })}
        </View>
        <View className="options-buttons">
          <AtButton type='primary' className="next"
          onClick={()=> this.handleNextQuestion() }>下一题</AtButton>
        </View>
      </View>
    )
  }

  render = () => {
    return (
      <View className="user-form">
        <Text className="form-title">入组综合问卷</Text>
        <AtForm onSubmit={this.handleSubmit}>
          {this.renderQuestion()}

        </AtForm>
        <View className="tabbar-placeholder"></View>
        <TabBar current={1} />
      </View>
    )
  }
}