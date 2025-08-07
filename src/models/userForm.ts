/**
 * 用户表单数据模型
 * 用于定义用户提交的表单信息结构
 */

export interface UserFormData {
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
}

export interface UserFormSubmission {
  id: string
  timestamp: string
  data: UserFormData
}