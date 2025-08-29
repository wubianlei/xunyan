/**
 * Inmunotek问卷表单数据模型
 * 基于inmunotekQuestions.json中的field字段生成的接口
 * 用于定义Inmunotek问卷提交的表单信息结构
 */

export interface InmunotekFormData {
  // === 基础资格标准 ===
  
  // 知情同意和基础要求
  informedConsent: string                    // 是否已签署知情同意书
  ageRange: string                          // 年龄是否在12-65岁之间
  protocolCompliance: string                // 是否同意遵守试验方案
  smartphoneOwnership: string               // 是否拥有智能手机
  
  // 过敏相关核心标准
  dustMiteAllergicRhinitis: string          // 是否有1年以上屋尘螨或粉尘螨过敏性鼻炎/鼻结膜炎
  skinPrickTestResult: string               // 屋尘螨/粉尘螨皮肤点刺风团直径是否≥5 mm
  dustMiteIgELevel: string                  // 屋尘螨或粉尘螨IgE检测是否≥3.5 kU/L
  baselineRCSMSScore: string                // 基线评估期RCSMS是否至少有10天大于3分
  
  // 过敏原限制
  specificAllergenRestriction: string       // 是否仅对屋尘螨/粉尘螨过敏，或仅对皮屑和地方性花粉过敏
  excludedAllergenSensitivity: string       // 是否不对霉菌、蟑螂、热带螨或其他地域相关螨虫过敏
  
  // 妊娠和生育相关
  nonPregnancyStatus: string                // 是否处于非妊娠状态
  contraceptionAgreement: string            // 有生育能力女性是否同意避孕
  pregnancyOrLactationStatus: string        // 是否处于妊娠或哺乳期
  
  // === 排除标准 - 治疗史 ===
  
  // 免疫治疗史
  pastFiveYearDustMiteImmunotherapy: string // 是否在5年内接受过屋尘螨或粉尘螨免疫治疗
  pastTwoYearDesensitizationTreatment: string // 是否在2年内接受任何脱敏治疗
  currentOtherAllergenImmunotherapy: string // 是否当下接受屋尘螨和粉尘螨之外过敏原的免疫治疗
  
  // === 排除标准 - 疾病状况 ===
  
  // 呼吸系统疾病
  partiallyControlledAsthma: string         // 是否为哮喘（部分受控）
  fev1Below80Percent: string                // FEV1是否<80%
  uncontrolledAsthmaGINA: string           // 是否存在根据GINA 2022未受控制的哮喘或症状控制不佳
  severeAsthmaStep4or5Treatment: string    // 是否存在根据GINA 2022患有严重哮喘且正在接受第4步或第5步治疗
  lowerRespiratoryDiseaseOtherThanAsthma: string // 是否患有哮喘以外的下呼吸道疾病
  
  // 免疫系统疾病
  autoimmuneDiseaseinRemission: string      // 是否为自身免疫疾病-缓解中
  immunodeficiency: string                  // 是否有免疫缺陷
  severeAutoimmuneDisease: string          // 是否患有重度自身免疫性疾病（如甲状腺炎，狼疮等）
  immunodeficiencyUnresponsiveToTreatment: string // 是否患有免疫功能缺陷且对治疗无反应
  
  // 心血管和内分泌疾病
  cardiovascularDisease: string             // 是否有心血管疾病
  epinephrineContraindicationHyperthyroidism: string // 是否有使用肾上腺素的禁忌症（甲状腺功能亢进症）
  epinephrineContraindicationCardiacOrHypertension: string // 是否有使用肾上腺素的禁忌症（心脏病或高血压）
  
  // 感染相关
  hivInfectionABStage: string              // 是否有HIV（A，B阶段；CD4+ > 200/ul）
  aidsConfirmed: string                    // 是否确诊为AIDS
  chronicInfection: string                 // 是否有慢性感染
  
  // 精神和神经系统
  psychiatricDisease: string               // 是否有精神疾病
  unableToFollowProtocolOrSeverePsychiatric: string // 是否无法遵循研究方案或患有严重精神疾病
  
  // 肿瘤相关
  tumorRelatedDisease: string              // 是否患有肿瘤相关疾病
  
  // === 排除标准 - 药物治疗 ===
  
  // 心血管药物
  betaBlockerOrACEInhibitorTreatment: string // 是否正在接受β受体阻滞剂或血管紧张素转化酶（ACE）抑制剂治疗
  
  // 免疫抑制治疗
  currentImmunosuppressantTreatment: string // 是否正在接受免疫抑制剂治疗
  currentBiologicTreatment: string         // 是否正在接受生物制剂治疗
  
  // 近期用药 - 抗组胺药和镇静剂
  recentH1AntihistamineUse: string         // 是否在5天内使用过H1抗组胺药
  recentKetotifenUse: string               // 是否在14天内使用过酮替芬
  recentAntipsychoticUse: string           // 是否在14天内使用过抗精神病药物
  
  // 近期用药 - 激素类
  corticosteroidRestrictions: string        // 是否存在糖皮质激素使用限制要求
  
  // 近期用药 - 生物制剂和免疫治疗
  recentAntiIgEMedicationUse: string       // 是否在3个月内使用过抗IgE药物
  recentAntiInterleukinMedicationUse: string // 是否在3个月内使用过抗白介素药物
  recentOtherImmunosuppressantUse: string  // 是否在3个月内使用过其他免疫抑制剂
  
  // === 排除标准 - 近期健康状况 ===
  
  // 近期感染和急性发作
  recentRespiratoryInfection: string       // 是否在4周内患有呼吸道感染
  recentUnstableAsthmaExacerbation: string // 是否在4周内哮喘急性发作病情不稳定
  
  // 过敏反应史
  pastTwoYearChronicUrticariaOrSevereReaction: string // 是否在2年内有慢性荨麻疹或严重速发过敏反应
  hereditaryAngioedemaHistory: string      // 是否有遗传性血管性水肿病史
  severeSystemicAdverseReactionHistory: string // 是否对食物、膜翅目昆虫毒液或药物等有严重全身不良反应史
  allergyToStudyMedicationComponents: string // 是否对研究过敏原以外的任何研究治疗药物成分过敏
  
  // === 排除标准 - 手术和解剖因素 ===
  
  // 鼻部相关
  nasalDiseaseComplicationsAffectingStudy: string // 是否患有可能影响有效性和/或安全性合理评估的鼻部疾病并发症
  pastSixMonthNasalSurgery: string         // 是否在6个月内进行过鼻腔手术
  plannedNasalSurgeryDuringStudy: string   // 是否计划在研究期间接受鼻腔手术
  
  // 口腔相关
  oralLesionsAffectingSafetyAssessment: string // 是否患有口腔病变可能会影响研究治疗药物安全性评估
  
  // === 排除标准 - 其他治疗需求和限制 ===
  
  // 药物需求
  needAntihistamineOrCorticosteroidForOtherPurposes: string // 是否需要使用抗组胺药和/或皮质类固醇治疗用于除缓解变应性鼻炎症状以外的其他目的
  
  // 研究相关
  researcherDirectRelative: string         // 是否为研究者直系亲属
  pastThirtyDayOtherStudyParticipation: string // 是否在30天内参加过其他研究
  concurrentOtherStudyParticipation: string // 是否同时正在参与其他研究
  
  // 生活环境变化
  expectedSignificantEnvironmentalChange: string // 是否预计在研究期间生活环境会发生明显变化（例如搬家）
  plannedMiteProofBeddingUse: string       // 是否计划在研究期间开始使用防螨床上用品或类似相关装备
  
  // 综合排除因素
  unrelatedSeriousDiseasesAffectingStudy: string // 是否患有与变应性鼻炎或哮喘无关的其他严重疾病且可能会影响研究治疗或随访
  investigatorAssessmentUnsuitability: string // 根据研究者评估是否被认为不适合参与本研究
}

export interface InmunotekFormSubmission {
  id: string
  timestamp: string
  data: InmunotekFormData
}