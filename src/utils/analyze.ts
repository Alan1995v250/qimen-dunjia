import type { QimenResult } from './qimen'

// ========== 基础数据表 ==========

const MEN_JI_XIONG: Record<string, { level: string; desc: string }> = {
  '开门': { level: '大吉', desc: '事业顺利，利于求职、开业、出行' },
  '休门': { level: '中吉', desc: '利于休养、谈判、见贵人' },
  '生门': { level: '大吉', desc: '利于求财、投资、置业' },
  '伤门': { level: '小凶', desc: '主伤灾、争斗，不利出行' },
  '杜门': { level: '小凶', desc: '主闭塞、阻隔，利于隐藏' },
  '景门': { level: '中平', desc: '利于文书、考试，但防口舌' },
  '死门': { level: '大凶', desc: '诸事不利，主衰败、疾病' },
  '惊门': { level: '小凶', desc: '主惊恐、官非、口舌是非' }
}

const XING_JI_XIONG: Record<string, { level: string; desc: string }> = {
  '天蓬星': { level: '大凶', desc: '主盗贼、破财，水性之星' },
  '天任星': { level: '中吉', desc: '主信义、稳重，利于农耕' },
  '天冲星': { level: '小吉', desc: '主果断、勇猛，利于军事' },
  '天辅星': { level: '大吉', desc: '主文昌、学业，利于考试' },
  '天英星': { level: '小凶', desc: '主血光、火灾，性烈' },
  '天芮星': { level: '大凶', desc: '主疾病、灾祸，为病符星' },
  '天柱星': { level: '小凶', desc: '主破坏、口舌，为破军星' },
  '天心星': { level: '大吉', desc: '主谋略、医术，利于求医' }
}

const SHEN_JI_XIONG: Record<string, { level: string; desc: string }> = {
  '值符': { level: '大吉', desc: '诸神之首，百事皆宜' },
  '腾蛇': { level: '小凶', desc: '主虚惊、怪异、缠绕' },
  '太阴': { level: '中吉', desc: '主暗中相助，利于密谋' },
  '六合': { level: '中吉', desc: '主和合、婚姻、合作' },
  '白虎': { level: '大凶', desc: '主凶险、疾病、刑伤' },
  '玄武': { level: '小凶', desc: '主盗窃、欺骗、暗昧' },
  '九地': { level: '中吉', desc: '主稳固、持久，利于守成' },
  '九天': { level: '中吉', desc: '主远行、升迁，利于进取' }
}

const GONG_WUXING: Record<number, string> = {
  1: '水', 2: '土', 3: '木', 4: '木', 5: '土',
  6: '金', 7: '金', 8: '土', 9: '火'
}

function wuxingRelation(a: string, b: string): string {
  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }
  if (a === b) return '比和'
  if (sheng[a] === b) return '相生'
  if (sheng[b] === a) return '被生'
  if (ke[a] === b) return '相克'
  if (ke[b] === a) return '被克'
  return '无关系'
}

// ========== 分析结果类型 ==========

export interface AnalyzeItem {
  category: string
  level: string
  detail: string
}

export interface AnalyzeResult {
  summary: string
  overallScore: number
  details: AnalyzeItem[]
  advice: string
}

// ========== 核心分析函数 ==========

export function analyzeResult(result: QimenResult): AnalyzeResult {
  let totalScore = 0
  // 用 Map 按 category 合并，每个维度最多保留一条
  const detailMap = new Map<string, AnalyzeItem>()

  // 1. 分析日干落宫（代表求测人）
  const dayGan = result.dayGanZhi?.charAt(0) || ''
  const dayPalace = result.palaces?.find(p => p.earthGan === dayGan || p.skyGan === dayGan)

  if (dayPalace) {
    // 八门
    const menInfo = MEN_JI_XIONG[dayPalace.men]
    if (menInfo) {
      const score = levelToScore(menInfo.level, 20)
      totalScore += score
      detailMap.set('八门', {
        category: '八门',
        level: menInfo.level,
        detail: `${dayPalace.men}落${dayPalace.id}宫，${menInfo.desc}`
      })
    }

    // 九星
    const xingInfo = XING_JI_XIONG[dayPalace.xing]
    if (xingInfo) {
      const score = levelToScore(xingInfo.level, 20)
      totalScore += score
      detailMap.set('九星', {
        category: '九星',
        level: xingInfo.level,
        detail: `${dayPalace.xing}临${dayPalace.id}宫，${xingInfo.desc}`
      })
    }

    // 八神
    const shenInfo = SHEN_JI_XIONG[dayPalace.shen]
    if (shenInfo) {
      const score = levelToScore(shenInfo.level, 15)
      totalScore += score
      detailMap.set('八神', {
        category: '八神',
        level: shenInfo.level,
        detail: `${dayPalace.shen}临${dayPalace.id}宫，${shenInfo.desc}`
      })
    }

    // 天地盘干关系
    if (dayPalace.skyGan && dayPalace.earthGan) {
      const relation = wuxingRelation(
        getGanWuxing(dayPalace.skyGan),
        getGanWuxing(dayPalace.earthGan)
      )
      const relScore = relation === '相生' || relation === '比和' ? 10 : relation === '被生' ? 5 : relation === '相克' ? -10 : -5
      totalScore += relScore
      detailMap.set('天地盘', {
        category: '天地盘',
        level: relScore > 0 ? '吉' : '凶',
        detail: `天盘${dayPalace.skyGan}与地盘${dayPalace.earthGan}，${relation}关系`
      })
    }
  }

  // 2. 值符值使（大局）
  const zhiFuPalace = result.palaces?.find(p => p.shen === '值符')
  if (zhiFuPalace) {
    const gongWuxing = GONG_WUXING[zhiFuPalace.id] || '土'
    const menWuxing = getMenWuxing(zhiFuPalace.men)
    const relation = wuxingRelation(menWuxing, gongWuxing)
    if (relation === '相生' || relation === '比和') {
      totalScore += 10
      detailMap.set('值符', {
        category: '值符',
        level: '吉',
        detail: `值符落${zhiFuPalace.id}宫，门宫${relation}，大局有利`
      })
    } else if (relation === '相克') {
      totalScore -= 10
      detailMap.set('值符', {
        category: '值符',
        level: '凶',
        detail: `值符落${zhiFuPalace.id}宫，门宫${relation}，大局受阻`
      })
    }
  }

  // 3. 特殊格局（只取最重要的一条）
  const patterns = checkPatterns(result)
  if (patterns.length > 0) {
    // 按绝对值排序，取影响最大的一条
    const best = patterns.sort((a, b) => Math.abs(b.score) - Math.abs(a.score))[0]
    totalScore += best.score
    detailMap.set('格局', {
      category: '格局',
      level: best.score > 0 ? '吉格' : '凶格',
      detail: best.desc
    })
  }

  // 限制分数范围
  totalScore = Math.max(-100, Math.min(100, totalScore))

  // 转为数组（最多6条）
  const details = Array.from(detailMap.values()).slice(0, 6)

  const summary = generateSummary(totalScore)
  const advice = generateAdvice(totalScore, details)

  return { summary, overallScore: totalScore, details, advice }
}

// ========== 辅助函数 ==========

function levelToScore(level: string, max: number): number {
  if (level.includes('大吉')) return max
  if (level.includes('中吉')) return Math.round(max * 0.5)
  if (level.includes('小吉')) return Math.round(max * 0.25)
  if (level.includes('中平')) return 0
  if (level.includes('小凶')) return -Math.round(max * 0.5)
  return -max
}

function getGanWuxing(gan: string): string {
  const map: Record<string, string> = {
    '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
    '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
  }
  return map[gan] || '土'
}

function getMenWuxing(men: string): string {
  const map: Record<string, string> = {
    '开门': '金', '休门': '水', '生门': '土', '伤门': '木',
    '杜门': '木', '景门': '火', '死门': '土', '惊门': '金'
  }
  return map[men] || '土'
}

function checkPatterns(result: QimenResult): { score: number; desc: string }[] {
  const patterns: { score: number; desc: string }[] = []

  result.palaces?.forEach(palace => {
    const sky = palace.skyGan
    const earth = palace.earthGan
    const combo = sky + earth

    if (combo === '乙丙' || combo === '丙丁' || combo === '乙丁') {
      patterns.push({ score: 15, desc: `${palace.id}宫见三奇相佐（${combo}），主贵人相助` })
    }
    if (sky === '丁' && earth === '丙') {
      patterns.push({ score: 12, desc: `${palace.id}宫见"星奇朱雀"格，利于文书考试` })
    }
    if (sky === '庚' && earth === '庚') {
      patterns.push({ score: -15, desc: `${palace.id}宫见"太白同宫"格，主战事不利` })
    }
    if (sky === '庚' && earth === '甲') {
      patterns.push({ score: -12, desc: `${palace.id}宫见"太白入局"格，主官非口舌` })
    }
  })

  return patterns
}

function generateSummary(score: number): string {
  if (score >= 60) return '大吉之象，诸事顺遂，可积极行动'
  if (score >= 30) return '中吉之象，整体顺利，把握机遇即可'
  if (score >= 10) return '小吉之象，有利有弊，需谨慎行事'
  if (score >= -10) return '平象，吉凶参半，宜静观其变'
  if (score >= -30) return '小凶之象，多有阻碍，不宜冒进'
  if (score >= -60) return '中凶之象，诸事不顺，宜守不宜攻'
  return '大凶之象，百事不宜，宜韬光养晦'
}

function generateAdvice(score: number, details: AnalyzeItem[]): string {
  const advices: string[] = []

  if (score >= 30) {
    advices.push('当前运势较好，适合主动出击、推进重要事务。')
  } else if (score <= -30) {
    advices.push('当前运势偏弱，建议暂缓重大决策，以守为主。')
  } else {
    advices.push('当前运势平稳，可处理日常事务，重大决策宜再三斟酌。')
  }

  const hasMenXiong = details.some(d => d.category === '八门' && d.level.includes('凶'))
  if (hasMenXiong) {
    advices.push('八门见凶，出行办事需注意安全，避免与人争执。')
  }

  const hasXingXiong = details.some(d => d.category === '九星' && d.level.includes('凶'))
  if (hasXingXiong) {
    advices.push('九星见凶，注意身体健康，定期体检。')
  }

  return advices.join('')
}