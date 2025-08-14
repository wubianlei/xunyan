/**
 * 用户表单数据模型
 * 用于定义用户提交的表单信息结构
 */

export interface UserFormData {
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

  // 答题数量
  inmunotekCount: number
  alkCount: number

  // 每题是否通过
  inmunotekPassFlags: boolean[]
  alkPassFlags: boolean[]
}

export interface UserFormSubmission {
  id: string
  timestamp: string
  data: UserFormData
}