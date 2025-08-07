import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtForm,AtInput,AtButton } from 'taro-ui'
import { formDataService } from '../../services/formDataService'
// 引入并实际使用UserFormData类型
import type { UserFormData } from '../../models/userForm'
import TabBar from '../../components/TabBar'
import questionsData from './questions.json'
// import questionsData from './rhinitis.json'
import './index.less'

// import "taro-ui/dist/style/components/form.scss"
// import 'taro-ui/dist/style/index.scss'


interface UserFormState {
  // 基础部分
  isAdult: string
  inOtherStudy: string
  pregnancyStatus: string
  physicalStatus: string
  lungCancerTreatment: string
  lungCancerType: string
  cancerStage: string
  systemicTreatment: string[]
  egfrStatus: string
  egfrMutation: string
  egfrTKIDrugs: string[]
  // 洗脱部分
  recentSurgery: string
  recentMedication: string
  // 肺部
  lungProblems: string
  radiationPneumonitis: string
  // 心血管
  heartDisease: string
  hypertension: string
  // 肿瘤
  metastasis: string
  // 病史
  currentDiseases: string[]
  medicalHistory: string[]
  // 其他
  absorptionIssues: string
  currentQuestion: number
}

export default class UserForm extends Component<{}, UserFormState> {
  state: UserFormState = {
    // 基础部分
    isAdult: '',
    inOtherStudy: '',
    pregnancyStatus: '',
    physicalStatus: '',
    lungCancerTreatment: '',
    lungCancerType: '',
    cancerStage: '',
    systemicTreatment: [],
    egfrStatus: '',
    egfrMutation: '',
    egfrTKIDrugs: [],
    // 洗脱部分
    recentSurgery: '',
    recentMedication: '',
    // 肺部
    lungProblems: '',
    radiationPneumonitis: '',
    // 心血管
    heartDisease: '',
    hypertension: '',
    // 肿瘤
    metastasis: '',
    // 病史
    currentDiseases: [],
    medicalHistory: [],
    // 其他
    absorptionIssues: '',
    currentQuestion: 1
  }

  isMultiSelectQuestion = (questionNumber: number): boolean => {
    return [8, 19, 20].includes(questionNumber)
  }

  handleChange = (field: string, value: string): void => {
    if (this.isMultiSelectQuestion(this.state.currentQuestion)) {
      const currentValue = this.state[field as keyof UserFormState] as string[]
      let newValue: string[]
      
      if (currentValue.includes(value)) {
        newValue = currentValue.filter(v => v !== value)
      } else {
        newValue = [...currentValue, value]
      }

      // If user selects '没有以上情况', unselect all others
      if (value === '没有以上情况') {
        newValue = [value]
      } else if (newValue.length > 0 && newValue.includes('没有以上情况')) {
        newValue = newValue.filter(v => v !== '没有以上情况')
      }

      this.setState({
        [field]: newValue
      } as unknown as Pick<UserFormState, keyof UserFormState>, () => {
        if (newValue.length > 0) {
          this.checkExitConditions(field, newValue)
          // Only advance if it's not an exit condition
          if (!this.shouldExit(field, newValue)) {
            const isLastQuestion = this.state.currentQuestion === 21;
            if (isLastQuestion) {
              // 如果是最后一个问题，自动提交表单
              this.handleSubmit();
            } else {
              this.setState({ currentQuestion: this.state.currentQuestion + 1 });
            }
          }
        }
      })
    } else {
      this.setState({
        [field]: value
      } as unknown as Pick<UserFormState, keyof UserFormState>, () => {
        this.checkExitConditions(field, value)
        
        const isLastQuestion = this.state.currentQuestion === 21;
        if (isLastQuestion) {
          // 如果是最后一个问题，自动提交表单
          this.handleSubmit();
        } else {
          this.setState({ currentQuestion: this.state.currentQuestion + 1 });
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
      // // 基础部分
      // isAdult: ['否'],
      // inOtherStudy: ['是'],
      // pregnancyStatus: ['是'],
      // physicalStatus: ['生活仅能部分自理，日间一半以上时间卧床或坐轮椅。', '卧床不起，生活不能自理。'],
      // lungCancerTreatment: ['我患有其他肿瘤', '我未患有肿瘤'],
      // cancerStage: ['I-II期', 'IIIA期'],
      // egfrStatus: ['已确认无EGFR基因突变'],
      // egfrMutation: ['Exon19del', 'L858R', 'T790M', 'G719X', 'S768I', 'L861Q'],
      // egfrTKIDrugs: ['PLB1004', '波奇替尼', 'Mobocertinib', 'CLN-081', 'BDTX-189', 'YK-029A', '舒沃替尼', '伏美替尼', '其他针对EGFR Ex20ins的TKI药物'],
      // // 洗脱部分
      // recentSurgery: ['接受重大手术', '接受针对肺野和全脑的放疗', '接种活疫苗'],
      // recentMedication: ['使用免疫抑制药物', '接受肺部和脑部之外的放疗', '使用具有明确抗肿瘤适应症的中成药', '使用二甲双胍', '使用CYP3A4强抑制剂或强诱导剂', '接受胸腔镜活检', '接受纵隔镜活检'],
      // // 肺部
      // lungProblems: ['曾患有间质性肺病', '曾患有药物性间质性肺病', '当前患有任何肺间质病变'],
      // radiationPneumonitis: ['是'],
      // // 心血管
      // heartDisease: ['是'],
      // hypertension: ['是'],
      // // 病史
      // currentDiseases: ['角膜炎或溃疡性角膜炎', '凝血功能障碍或出血倾向', '任何全身感染，包括细菌、病毒、真菌感染'],
      // medicalHistory: ['自身免疫性疾病史'],
      // // 其他
      // absorptionIssues: ['吞咽困难', '有可能影响药物吸收的其他情况']
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
        Taro.navigateBack()
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

      // 跳转到成功页面
      await Taro.navigateTo({
        url: '/pages/success/index'
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

  renderQuestion = () => {
    const { currentQuestion } = this.state

    const { questions } = questionsData

    console.log(Object.keys(questions).length)

    // 将数字转换为字符串键以正确索引问题数据
    const currentQ = questions[String(currentQuestion)]
    console.log(currentQuestion)
    console.log(currentQ)
    if (!currentQ) return null

    return (
      <View className="question-container">
        <View className="question-number">问题 {currentQuestion}/{Object.keys(questions).length}</View>
        <Text className="question-title">{currentQ.title}</Text>
        <View className="options-container">
          {currentQ.options.map((option, index) => {
            const isMultiSelect = this.isMultiSelectQuestion(currentQuestion)
            const value = this.state[currentQ.field as keyof UserFormState]
            const isSelected = isMultiSelect
              ? (value as string[]).includes(option.value)
              : value === option.value

            return (
              <View
                key={option.value}
                className={`option-item ${isSelected ? 'selected' : ''} ${isMultiSelect ? 'multi-select' : ''}`}
                onClick={() => this.handleChange(currentQ.field, option.value)}
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
      </View>
    )
  }

  render = () => {
    return (
      <View className="user-form">
        <Text className="form-title">入组问卷</Text>
        <AtForm onSubmit={this.handleSubmit}>
          {this.renderQuestion()}

        </AtForm>
        <View className="tabbar-placeholder"></View>
        <TabBar current={1} />
      </View>
    )
  }
}
