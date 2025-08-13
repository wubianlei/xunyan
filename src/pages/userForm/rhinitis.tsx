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
  
  inmunotekCount: number
  alkCount: number

  // 每题是否通过
  inmunotekPassFlags: boolean[]
  alkPassFlags: boolean[]

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
    inmunotekPassFlags: [],
    alkPassFlags: [],
    currentQuestion: 1,
    presentValue: []
  }

  handleChange = (
    field: string,
    value: string,
    isMulti: boolean
  ) => {
    if (isMulti) {
      const cur = this.state[field as keyof UserFormState] as string[];
      const newVal = cur.includes(value)
        ? cur.filter(v => v !== value)
        : [...cur, value];

      if (NONE.includes(value)) {
        this.setState({ [field]: [value], presentValue: [value] } as any);
      } else {
        const filtered = newVal.filter(v => !NONE.includes(v));
        this.setState({ [field]: filtered, presentValue: filtered } as any);
      }
    } else {
      this.setState({ [field]: value, presentValue: [value] } as any);
    }
  };

  private accumulateQuestionStats = (): void => {
    const { currentQuestion } = this.state;
    const currentQ = questionsData.questions[String(currentQuestion)];
    if (!currentQ) return;

    const isInm = currentQ.research.includes('Inmunotek');
    const isAlk = currentQ.research.includes('ALK');

    const userValue = this.state[currentQ.field as keyof UserFormState];
    const passValues: string[] = currentQ.pass ?? [];
    let pass = false;

    if (currentQ.multiple) {
      // 多选：用户答案与 pass 数组至少有一个交集
      const arr = Array.isArray(userValue) ? userValue : [userValue];
      pass = passValues.length === 0
            ? true // 空数组视为全部通过
            : arr.some(v => passValues.includes(v));
    } else {
      // 单选：只要用户值在 pass 数组即可
      pass = passValues.length === 0
            ? true
            : passValues.includes(userValue as string);
    }

    // 更新计数 & pass 标志
    this.setState(prev => ({
      inmunotekCount: prev.inmunotekCount + (isInm ? 1 : 0),
      alkCount: prev.alkCount + (isAlk ? 1 : 0),
      inmunotekPassFlags: isInm
        ? [...prev.inmunotekPassFlags, pass]
        : prev.inmunotekPassFlags,
      alkPassFlags: isAlk
        ? [...prev.alkPassFlags, pass]
        : prev.alkPassFlags
    }));
  };

  handleNextQuestion = (): void => {
    if (this.state.presentValue.length === 0) {
      Taro.showToast({ title: '请至少选择一个选项', icon: 'none', duration: 1000 });
      return;
    }

    // ① 统计本题
    this.accumulateQuestionStats();

    // ② 前进
    if (this.state.currentQuestion === QUESTION_MAX_NUM) {
      this.handleSubmit();
    } else {
      this.setState(prev => ({
        currentQuestion: prev.currentQuestion + 1,
        presentValue: []
      }));
    }
  };

  handleSubmit = async (): Promise<void> => {
    try {
      console.log('问卷答案:', this.state)
      const { inmunotekPassFlags, alkPassFlags } = this.state;
      const inmPass = inmunotekPassFlags.filter(Boolean).length;
      const alkPass = alkPassFlags.filter(Boolean).length;

      const inmRate = this.state.inmunotekCount
        ? (inmPass / this.state.inmunotekCount).toFixed(2)
        : '-';
      const alkRate = this.state.alkCount
        ? (alkPass / this.state.alkCount).toFixed(2)
        : '-';

      console.log(`Inmunotek 通过率: ${inmRate} (${inmPass}/${this.state.inmunotekCount})`);
      console.log(`ALK 通过率: ${alkRate} (${alkPass}/${this.state.alkCount})`);
      
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
                  onClick={() => this.handleChange(currentQ.field, option.value, Boolean(currentQ.multiple))}
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