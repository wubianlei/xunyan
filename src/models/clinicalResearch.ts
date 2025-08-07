/**
 * 临床研究数据模型
 * 用于定义临床研究的信息结构和入排标准
 */

/**
 * 入组标准类型
 * INCLUSION: 入组标准 - 必须满足的条件
 * EXCLUSION: 排除标准 - 满足任一将被排除
 */
export enum CriteriaType {
  INCLUSION = 'inclusion',
  EXCLUSION = 'exclusion'
}

/**
 * 标准条件
 * 描述研究的入组/排除标准的具体条件
 */
export interface ResearchCriteria {
  id: string
  type: CriteriaType
  description: string
  formField?: string // 对应用户表单中的字段
  acceptedValues?: string[] // 满足条件的值（针对入组标准）
  rejectedValues?: string[] // 不满足条件的值（针对排除标准）
  weight: number // 条件权重，用于计算匹配度
  required: boolean // 是否为必须满足的条件
}

/**
 * 临床研究信息
 */
export interface ClinicalResearch {
  id: string
  name: string
  description: string
  phase: string // 临床试验阶段，如 I期、II期等
  sponsor: string // 赞助方/申办方
  locations: string[] // 研究开展地点
  status: 'recruiting' | 'active' | 'completed' | 'suspended'
  startDate?: string // 研究开始日期
  estimatedEndDate?: string // 预计结束日期
  targetEnrollment: number // 目标入组人数
  priority: number // 优先级，用于同等匹配度情况下的排序
  criteria: ResearchCriteria[] // 入组和排除标准
  primaryContact?: { // 主要联系人
    name: string
    phone?: string
    email?: string
  }
}

/**
 * 研究匹配结果
 */
export interface ResearchMatch {
  researchId: string
  name: string
  matchScore: number // 匹配得分
  maxPossibleScore: number // 最大可能得分
  matchPercentage: number // 匹配百分比
  priority: number // 优先级
  metCriteria: string[] // 满足的标准
  unmetCriteria: string[] // 未满足的标准
  description: string
  requirements: string[] // 简要要求列表，用于UI展示
}
