import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import { formDataService } from '../../services/formDataService'
import type { InmunotekFormData } from '../../models/InmunotekForm'
import TabBar from '../../components/TabBar'

import questionsData from './mock/inmunotekQuestions.json'
import './core.less'

// 问题总数
const QUESTION_MAX_NUM = Object.keys(questionsData.questions).length

interface CoreFormState extends InmunotekFormData {
  currentQuestion: number
  presentValue: string
}

export default class CoreForm extends Component<{}, CoreFormState> {
  state: CoreFormState = {
    /* ===== 初始值全部置空字符串（单选场景） ===== */
    informedConsent: '',
    ageRange: '',
    protocolCompliance: '',
    smartphoneOwnership: '',
    dustMiteAllergicRhinitis: '',
    skinPrickTestResult: '',
    dustMiteIgELevel: '',
    baselineRCSMSScore: '',
    specificAllergenRestriction: '',
    excludedAllergenSensitivity: '',
    nonPregnancyStatus: '',
    contraceptionAgreement: '',
    pregnancyOrLactationStatus: '',
    pastFiveYearDustMiteImmunotherapy: '',
    pastTwoYearDesensitizationTreatment: '',
    currentOtherAllergenImmunotherapy: '',
    partiallyControlledAsthma: '',
    fev1Below80Percent: '',
    uncontrolledAsthmaGINA: '',
    severeAsthmaStep4or5Treatment: '',
    lowerRespiratoryDiseaseOtherThanAsthma: '',
    autoimmuneDiseaseinRemission: '',
    immunodeficiency: '',
    severeAutoimmuneDisease: '',
    immunodeficiencyUnresponsiveToTreatment: '',
    cardiovascularDisease: '',
    epinephrineContraindicationHyperthyroidism: '',
    epinephrineContraindicationCardiacOrHypertension: '',
    hivInfectionABStage: '',
    aidsConfirmed: '',
    chronicInfection: '',
    psychiatricDisease: '',
    unableToFollowProtocolOrSeverePsychiatric: '',
    tumorRelatedDisease: '',
    betaBlockerOrACEInhibitorTreatment: '',
    currentImmunosuppressantTreatment: '',
    currentBiologicTreatment: '',
    recentH1AntihistamineUse: '',
    recentKetotifenUse: '',
    recentAntipsychoticUse: '',
    corticosteroidRestrictions: '',
    recentAntiIgEMedicationUse: '',
    recentAntiInterleukinMedicationUse: '',
    recentOtherImmunosuppressantUse: '',
    recentRespiratoryInfection: '',
    recentUnstableAsthmaExacerbation: '',
    pastTwoYearChronicUrticariaOrSevereReaction: '',
    hereditaryAngioedemaHistory: '',
    severeSystemicAdverseReactionHistory: '',
    allergyToStudyMedicationComponents: '',
    nasalDiseaseComplicationsAffectingStudy: '',
    pastSixMonthNasalSurgery: '',
    plannedNasalSurgeryDuringStudy: '',
    oralLesionsAffectingSafetyAssessment: '',
    needAntihistamineOrCorticosteroidForOtherPurposes: '',
    researcherDirectRelative: '',
    pastThirtyDayOtherStudyParticipation: '',
    concurrentOtherStudyParticipation: '',
    expectedSignificantEnvironmentalChange: '',
    plannedMiteProofBeddingUse: '',
    unrelatedSeriousDiseasesAffectingStudy: '',
    investigatorAssessmentUnsuitability: '',
    /* =========================================== */
    currentQuestion: 1,
    presentValue: ''
  }

  /* -------------------- 选择处理 -------------------- */
  handleChange = (field: string, value: string): void => {
    this.setState({ [field]: value, presentValue: value } as any)
  }

  /* -------------------- 下一题 -------------------- */
  handleNextQuestion = (): void => {
    const { presentValue } = this.state
    if (!presentValue) {
      Taro.showToast({ title: '请选择一个选项', icon: 'none', duration: 1000 })
      return
    }

    if (this.state.currentQuestion === QUESTION_MAX_NUM) {
      this.handleSubmit()
    } else {
      this.setState(prev => ({
        currentQuestion: prev.currentQuestion + 1,
        presentValue: ''
      }))
    }
  }

  /* -------------------- 提交 -------------------- */
  handleSubmit = async (): Promise<void> => {
    try {
      // 过滤掉 currentQuestion / presentValue
      const { currentQuestion, presentValue, ...formData } = this.state
      formDataService.saveFormData(formData)

      await Taro.nextTick()
      if (!formDataService.getFormData()) throw new Error('保存失败')

      await Taro.navigateTo({ url: '/pages/success/general' })
      Taro.showToast({ title: '提交成功', icon: 'success', duration: 2000 })
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '提交失败', icon: 'error', duration: 2000 })
    }
  }

  /* -------------------- 渲染问题 -------------------- */
  renderQuestion = () => {
    const { currentQuestion, presentValue } = this.state
    const currentQ = questionsData.questions[String(currentQuestion)]
    if (!currentQ) return null

    return (
      <View className="question-container">
        <View className="question-number">
          问题 {currentQuestion}/{QUESTION_MAX_NUM}
        </View>
        <Text className="question-title">{currentQ.title}</Text>

        <View className="options-container">
          {currentQ.options.map(option => (
            <View
              key={option.value}
              className={`option-item ${presentValue === option.value ? 'selected' : ''}`}
              onClick={() => this.handleChange(currentQ.field, option.value)}
            >
              <View className="option-circle">
                <View className="option-inner" />
              </View>
              <Text className="option-label">{option.label}</Text>
            </View>
          ))}
        </View>

        <View className="options-buttons">
          <AtButton type="primary" className="next" onClick={this.handleNextQuestion}>
            下一题
          </AtButton>
        </View>
      </View>
    )
  }

  /* -------------------- 渲染 -------------------- */
  render() {
    return (
      <View className="user-form">
        <Text className="form-title">Inmunotek 临床独立问卷</Text>
        {this.renderQuestion()}
        <View className="tabbar-placeholder" />
        <TabBar current={1} />
      </View>
    )
  }
}
