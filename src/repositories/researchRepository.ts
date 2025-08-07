/**
 * 临床研究数据仓库
 * 负责管理临床研究数据的存储和检索
 */

import Taro from '@tarojs/taro'
import { 
  ClinicalResearch, 
  CriteriaType, 
  ResearchCriteria 
} from '../models/clinicalResearch'

// 本地存储键
const RESEARCH_DATA_KEY = 'xunyan_research_data'

/**
 * 临床研究数据默认集合
 * 系统初始预设的临床研究数据
 */
const DEFAULT_RESEARCH_DATA: ClinicalResearch[] = [
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
]

class ResearchRepository {
  private static instance: ResearchRepository

  private constructor() {
    // 初始化时，如果本地存储中没有研究数据，则加载默认数据
    this.initializeDefaultData()
  }

  static getInstance(): ResearchRepository {
    if (!ResearchRepository.instance) {
      ResearchRepository.instance = new ResearchRepository()
    }
    return ResearchRepository.instance
  }

  /**
   * 初始化默认研究数据
   * 仅在本地没有数据时执行
   */
  private initializeDefaultData(): void {
    try {
      const existingData = Taro.getStorageSync(RESEARCH_DATA_KEY)
      if (!existingData) {
        Taro.setStorageSync(RESEARCH_DATA_KEY, JSON.stringify(DEFAULT_RESEARCH_DATA))
      }
    } catch (error) {
      console.error('[ResearchRepository] 初始化默认研究数据失败:', error)
    }
  }

  /**
   * 获取所有临床研究
   * @returns 临床研究列表
   */
  getAllResearch(): ClinicalResearch[] {
    try {
      const data = Taro.getStorageSync(RESEARCH_DATA_KEY)
      if (!data) {
        return DEFAULT_RESEARCH_DATA
      }
      return JSON.parse(data)
    } catch (error) {
      console.error('[ResearchRepository] 获取研究数据失败:', error)
      return DEFAULT_RESEARCH_DATA
    }
  }

  /**
   * 通过ID获取特定临床研究
   * @param id 研究ID
   * @returns 研究信息，未找到则返回null
   */
  getResearchById(id: string): ClinicalResearch | null {
    const allResearch = this.getAllResearch()
    const research = allResearch.find(r => r.id === id)
    return research || null
  }

  /**
   * 添加或更新临床研究
   * @param research 研究信息
   */
  saveResearch(research: ClinicalResearch): void {
    try {
      const allResearch = this.getAllResearch()
      const index = allResearch.findIndex(r => r.id === research.id)
      
      if (index >= 0) {
        // 更新现有研究
        allResearch[index] = research
      } else {
        // 添加新研究
        allResearch.push(research)
      }
      
      Taro.setStorageSync(RESEARCH_DATA_KEY, JSON.stringify(allResearch))
    } catch (error) {
      console.error('[ResearchRepository] 保存研究数据失败:', error)
    }
  }

  /**
   * 删除临床研究
   * @param id 研究ID
   * @returns 是否删除成功
   */
  deleteResearch(id: string): boolean {
    try {
      const allResearch = this.getAllResearch()
      const filteredResearch = allResearch.filter(r => r.id !== id)
      
      if (filteredResearch.length < allResearch.length) {
        Taro.setStorageSync(RESEARCH_DATA_KEY, JSON.stringify(filteredResearch))
        return true
      }
      
      return false
    } catch (error) {
      console.error('[ResearchRepository] 删除研究数据失败:', error)
      return false
    }
  }
}

export const researchRepository = ResearchRepository.getInstance()
