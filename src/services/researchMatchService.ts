/**
 * 临床研究匹配服务
 * 负责处理用户表单数据与临床研究之间的匹配计算
 */

import Taro from '@tarojs/taro'
import { UserFormData } from '../models/userForm'
import { 
  ClinicalResearch, 
  ResearchMatch, 
  ResearchCriteria, 
  CriteriaType 
} from '../models/clinicalResearch'

// 不再使用导入，而是直接使用 Taro 存储API 获取研究数据
// 在实际项目中，如果有完整的服务器API，可以替换为调用API获取研究数据

// 研究数据存储键名
const RESEARCH_DATA_KEY = 'xunyan_research_data'

class ResearchMatchService {
  private static instance: ResearchMatchService

  private constructor() {}

  static getInstance(): ResearchMatchService {
    if (!ResearchMatchService.instance) {
      ResearchMatchService.instance = new ResearchMatchService()
    }
    return ResearchMatchService.instance
  }

  /**
   * 获取所有可用的临床研究
   * @returns 返回所有可用的临床研究
   */
  private getAllResearch(): ClinicalResearch[] {
    try {
      const data = Taro.getStorageSync(RESEARCH_DATA_KEY)
      if (!data) {
        return this.getDefaultResearchData()
      }
      return JSON.parse(data)
    } catch (error) {
      console.error('[算法服务] 获取研究数据失败:', error)
      return this.getDefaultResearchData()
    }
  }

  /**
   * 获取默认研究数据
   * @returns 返回默认研究数据
   */
  private getDefaultResearchData(): ClinicalResearch[] {
    return [
      {
        id: 'study1',
        name: 'ALK鼻炎研究',
        description: 'ALK鼻炎临床研究',
        phase: 'II',
        sponsor: '明德生物医药',
        locations: ['上海', '北京', '广州'],
        status: 'recruiting',
        targetEnrollment: 120,
        priority: 1,
        criteria: [
          {
            id: 'c1_1',
            type: CriteriaType.INCLUSION,
            description: 'EGFR Ex20ins突变',
            formField: 'egfrMutation',
            acceptedValues: ['Ex20ins'],
            weight: 5,
            required: true
          },
          {
            id: 'c1_2',
            type: CriteriaType.INCLUSION,
            description: '非小细胞肺癌',
            formField: 'lungCancerType',
            acceptedValues: ['非小细胞肺癌（NSCLC）'],
            weight: 3,
            required: true
          },
          {
            id: 'c1_3',
            type: CriteriaType.INCLUSION,
            description: 'IIIB期或IV期',
            formField: 'cancerStage',
            acceptedValues: ['IIIB期', 'IV期'],
            weight: 2,
            required: true
          },
          {
            id: 'c1_4',
            type: CriteriaType.EXCLUSION,
            description: '其他临床试验',
            formField: 'inOtherStudy',
            rejectedValues: ['是'],
            weight: 1,
            required: true
          }
        ]
      },
      {
        id: 'study2',
        name: 'Inmunotek鼻炎研究',
        description: 'Inmunotek鼻炎临床研究',
        phase: 'III',
        sponsor: '海德医药研究',
        locations: ['上海', '北京', '成都', '重庆'],
        status: 'recruiting',
        targetEnrollment: 200,
        priority: 2,
        criteria: [
          {
            id: 'c2_1',
            type: CriteriaType.INCLUSION,
            description: '非小细胞肺癌',
            formField: 'lungCancerType',
            acceptedValues: ['非小细胞肺癌（NSCLC）'],
            weight: 3,
            required: true
          },
          {
            id: 'c2_2',
            type: CriteriaType.INCLUSION,
            description: 'IIIB期或IV期',
            formField: 'cancerStage',
            acceptedValues: ['IIIB期', 'IV期'],
            weight: 2,
            required: true
          },
          {
            id: 'c2_3',
            type: CriteriaType.EXCLUSION,
            description: '自身免疫性疾病史',
            formField: 'medicalHistory',
            rejectedValues: ['自身免疫性疾病史'],
            weight: 3,
            required: true
          },
          {
            id: 'c2_4',
            type: CriteriaType.INCLUSION,
            description: '生活完全可以自理',
            formField: 'physicalStatus',
            acceptedValues: ['生活完全可以自理，从事轻度体力活动也没有障碍。'],
            weight: 2,
            required: false
          }
        ]
      }
    ];
  }

  /**
   * 获取与用户表单数据匹配的临床研究
   * @param formData 用户表单数据
   * @returns 匹配的研究列表，按匹配度排序
   */
  getMatchingResearch(formData: UserFormData): ResearchMatch[] {
    // 获取所有临床研究
    const allResearch = this.getAllResearch()
    
    // 计算每个研究的匹配度
    const matches: ResearchMatch[] = allResearch.map(research => 
      this.calculateMatchScore(research, formData)
    )
    
    // 按匹配度百分比从高到低排序
    return matches.sort((a, b) => {
      // 首先按照匹配百分比排序
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage
      }
      
      // 如果百分比相同，按优先级排序
      return a.priority - b.priority
    })
  }

  /**
   * 计算特定研究与用户表单数据的匹配度
   * @param research 临床研究
   * @param formData 用户表单数据
   * @returns 匹配结果
   */
  private calculateMatchScore(research: ClinicalResearch, formData: UserFormData): ResearchMatch {
    let matchScore = 0
    let maxPossibleScore = 0
    const metCriteria: string[] = []
    const unmetCriteria: string[] = []
    
    // 计算每个入组/排除标准的匹配情况
    for (const criterion of research.criteria) {
      // 跳过没有关联表单字段的标准（可能是人工判断的标准）
      if (!criterion.formField) continue
      
      // 获取表单中的值
      const formValue = this.getFormFieldValue(formData, criterion.formField)
      const weight = criterion.weight
      
      // 累加最大可能分数
      maxPossibleScore += weight
      
      if (this.criterionMatches(criterion, formValue)) {
        // 标准匹配，增加分数
        matchScore += weight
        metCriteria.push(criterion.description)
      } else {
        // 标准不匹配
        unmetCriteria.push(criterion.description)
      }
    }
    
    // 计算匹配百分比
    const matchPercentage = maxPossibleScore > 0 
      ? (matchScore / maxPossibleScore) * 100 
      : 0
    
    return {
      researchId: research.id,
      name: research.name,
      matchScore,
      maxPossibleScore,
      matchPercentage,
      priority: research.priority,
      metCriteria,
      unmetCriteria,
      description: research.description,
      requirements: research.criteria
        .filter(c => c.required && c.type === CriteriaType.INCLUSION)
        .map(c => c.description)
    }
  }

  /**
   * 检查特定标准是否与表单值匹配
   * @param criterion 研究标准
   * @param formValue 表单值
   * @returns 是否匹配
   */
  private criterionMatches(criterion: ResearchCriteria, formValue: any): boolean {
    // 没有值的情况
    if (formValue === undefined || formValue === null || formValue === '') {
      return false
    }
    
    // 根据标准类型进行不同的匹配判断
    if (criterion.type === CriteriaType.INCLUSION) {
      // 入组标准 - 需要满足接受的值
      if (Array.isArray(formValue) && Array.isArray(criterion.acceptedValues)) {
        // 如果是多选，至少有一个值匹配即可
        return formValue.some(value => criterion.acceptedValues!.includes(value))
      } else if (Array.isArray(criterion.acceptedValues)) {
        // 单选值需要在接受列表中
        return criterion.acceptedValues.includes(formValue)
      }
    } else if (criterion.type === CriteriaType.EXCLUSION) {
      // 排除标准 - 不应满足拒绝的值
      if (Array.isArray(formValue) && Array.isArray(criterion.rejectedValues)) {
        // 如果是多选，所有值都不应在拒绝列表中
        return !formValue.some(value => criterion.rejectedValues!.includes(value))
      } else if (Array.isArray(criterion.rejectedValues)) {
        // 单选值不应在拒绝列表中
        return !criterion.rejectedValues.includes(formValue)
      }
    }
    
    // 默认返回，未定义明确匹配规则的情况
    return false
  }

  /**
   * 从表单数据中获取特定字段的值
   * 支持点号表示法获取嵌套字段
   * @param formData 表单数据
   * @param fieldPath 字段路径
   * @returns 字段值
   */
  private getFormFieldValue(formData: any, fieldPath: string): any {
    // 使用点号表示法获取嵌套字段
    const pathParts = fieldPath.split('.')
    let value = formData
    
    for (const part of pathParts) {
      if (value === undefined || value === null) {
        return undefined
      }
      value = value[part]
    }
    
    return value
  }
}

export const researchMatchService = ResearchMatchService.getInstance()
