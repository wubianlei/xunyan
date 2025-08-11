import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtForm,AtInput,AtButton } from 'taro-ui'
import { formDataService } from '../../services/formDataService'
// 引入并实际使用UserFormData类型
import type { UserFormData } from '../../models/userForm'
import TabBar from '../../components/TabBar'
// import questionsData from './questions.json'
import questionsData from './mock/rhinitis.json'
import './index.less'

// import "taro-ui/dist/style/components/form.scss"
// import 'taro-ui/dist/style/index.scss'


interface UserFormState {
  // 核心 4
  dustMiteAllergy: string
  additionalAllergens: string[]
  occasionalPetExposure: string
  persistentSymptomsOnMedication: string
  // 其他 3
  eligibleAge: string
  gender: string
  pregnancyOrLactation: string
  // 病史 9
  respiratoryCardiovascularConditions: string[]
  cardiacEndocrineConditions: string[]
  mentalOralOncologyConditions: string[]
  immuneSystemDisorders: string[]
  chronicInfections: string[]
  severeAllergicReactionHistory: string[]
  onlyDustMiteAllergy: string
  eosinophilicEsophagitis: string
  systemicAllergicReactionHistory: string[]
  // 治疗史 1
  antidepressantAntipsychoticUse: string
  // 洗脱 11  (18-)
  noDesensitizationHistory: string
  recentImmunosuppressiveMedication: string[]
  recentKetotifenUse: string
  recentRespiratoryIssues: string[]
  recentSevereAllergicEvents: string[]
  noNasalSurgeryHistory: string
  noDustMiteImmunotherapyHistory: string
  recentOralCorticosteroidUse: string[]
  recentLongActingCorticosteroidUse: string[]
  recentAsthmaExacerbation: string[]
  recentBiologicTherapy: string[]
  // 承诺 0
  // 停用药 5
  currentBetaBlockerOrACEInhibitorUse: string[]
  currentImmunosuppressantUse: string
  currentBiologicTherapy: string
  currentAntihistamineOrCorticosteroidUse: string
  currentAllergenSpecificImmunotherapy: string
  currentQuestion: number
}

export default class UserForm extends Component<{}, UserFormState> {
  state: UserFormState = {
    dustMiteAllergy: '', // 核心 4
    additionalAllergens: [],
    occasionalPetExposure: '',
    persistentSymptomsOnMedication: '',
    eligibleAge: '', // 其他 3
    gender: '',
    pregnancyOrLactation: '',
    respiratoryCardiovascularConditions: [], // 病史 9 
    cardiacEndocrineConditions: [],
    mentalOralOncologyConditions: [],
    immuneSystemDisorders: [],
    chronicInfections: [],
    severeAllergicReactionHistory: [],
    onlyDustMiteAllergy: '',
    eosinophilicEsophagitis: '',
    systemicAllergicReactionHistory: [],
    antidepressantAntipsychoticUse: '', // 治疗史 1
    noDesensitizationHistory: '', // 洗脱 11
    recentImmunosuppressiveMedication: [],
    recentKetotifenUse: '',
    recentRespiratoryIssues: [],
    recentSevereAllergicEvents: [],
    noNasalSurgeryHistory: '',
    noDustMiteImmunotherapyHistory: '',
    recentOralCorticosteroidUse: [],
    recentLongActingCorticosteroidUse: [],
    recentAsthmaExacerbation: [],
    recentBiologicTherapy: [],
    // 承诺 0
    // 停用药 5
    currentBetaBlockerOrACEInhibitorUse: [],
    currentImmunosuppressantUse: '',
    currentBiologicTherapy: '',
    currentAntihistamineOrCorticosteroidUse: '',
    currentAllergenSpecificImmunotherapy: '',
    currentQuestion: 1
  }

  // isMultiSelectQuestion = (currentQ: any): boolean => {
  //   return currentQ.multiple
  // }

  handleChange = (field: string, value: string, isMultiSelect: boolean): void => {
    if (isMultiSelect) {
      const currentValue = this.state[field as keyof UserFormState] as string[]
      let newValue: string[]
      
      if (currentValue.includes(value)) {
        newValue = currentValue.filter(v => v !== value)
      } else {
        newValue = [...currentValue, value]
      }

      // If user selects '以上均没有', unselect all others
      if (value === '以上均没有') {
        newValue = [value]
      } else if (newValue.length > 0 && newValue.includes('以上均没有')) {
        newValue = newValue.filter(v => v !== '以上均没有')
      }

      console.log('newV', newValue)

      this.setState({
        [field]: newValue
      } as unknown as Pick<UserFormState, keyof UserFormState>, () => {
        if (newValue.length > 0) {
          // 退出问卷流程 暂时不走这个逻辑
          // this.checkExitConditions(field, newValue)
          // Only advance if it's not an exit condition
          if (!this.shouldExit(field, newValue)) {
            const isLastQuestion = this.state.currentQuestion === 33;
            if (isLastQuestion) {
              // 如果是最后一个问题，自动提交表单
              this.handleSubmit();
            } else {
              // this.setState({ currentQuestion: this.state.currentQuestion + 1 });
            }
          }
        }
      })
    } else {
      this.setState({
        [field]: value
      } as unknown as Pick<UserFormState, keyof UserFormState>, () => {
        // 退出问卷流程 暂时不走这个逻辑
        // this.checkExitConditions(field, value)
        
        const isLastQuestion = this.state.currentQuestion === 33;
        if (isLastQuestion) {
          // 如果是最后一个问题，自动提交表单
          this.handleSubmit();
        } else {
          // this.setState({ currentQuestion: this.state.currentQuestion + 1 });
        }
      })
    }
  }

  shouldExit = (field: string, value: string | string[]): boolean => {
    const exitConditions = this.getExitConditions()
    if (field in exitConditions) {
      const condition = exitConditions[field as keyof typeof exitConditions]
      if (Array.isArray(value)) {
        return value.some(v => condition.includes(v))
      }
      return condition.includes(value)
    }
    return false
  }

  getExitConditions = () => {
    return {
      dustMiteAllergy: '', // 核心 4
      additionalAllergens: [],
      occasionalPetExposure: '',
      persistentSymptomsOnMedication: '',
      eligibleAge: '', // 其他 3
      gender: '',
      pregnancyOrLactation: '',
      respiratoryCardiovascularConditions: [], // 病史 9 
      cardiacEndocrineConditions: [],
      mentalOralOncologyConditions: [],
      immuneSystemDisorders: [],
      chronicInfections: [],
      severeAllergicReactionHistory: [],
      onlyDustMiteAllergy: '',
      eosinophilicEsophagitis: '',
      systemicAllergicReactionHistory: [],
      antidepressantAntipsychoticUse: '', // 治疗史 1
      noDesensitizationHistory: '', // 洗脱 11
      recentImmunosuppressiveMedication: [],
      recentKetotifenUse: '',
      recentRespiratoryIssues: [],
      recentSevereAllergicEvents: [],
      noNasalSurgeryHistory: '',
      noDustMiteImmunotherapyHistory: '',
      recentOralCorticosteroidUse: [],
      recentLongActingCorticosteroidUse: [],
      recentAsthmaExacerbation: [],
      recentBiologicTherapy: [],
      // 承诺 0
      // 停用药 5
      currentBetaBlockerOrACEInhibitorUse: [],
      currentImmunosuppressantUse: '',
      currentBiologicTherapy: '',
      currentAntihistamineOrCorticosteroidUse: '',
      currentAllergenSpecificImmunotherapy: '',
    }
  }

  checkExitConditions = (field: string, value: string | string[]): void => {
    if (this.shouldExit(field, value)) {
      this.exitQuestionnaire()
    }
  }

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
    this.setState({ currentQuestion: this.state.currentQuestion + 1 });
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
        <View className="question-number">问题 {currentQuestion}/{Object.keys(questions).length}</View>
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
                  onClick={() => this.handleChange(currentQ.field, option.value, isMultiSelect)}
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
          {/* { currentQuestion>1 && <AtButton type='secondary' 
          onClick={()=> this.handlePrevQuestion() }>上一题</AtButton> } */}
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