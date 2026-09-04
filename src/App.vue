<template>
  <div class="app-container">
    <h1>奇门遁甲排盘</h1>

    <!-- 时间选择区 -->
    <div class="time-selector">
      <div class="time-row">
        <label>年：</label>
        <select v-model.number="year">
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>

        <label>月：</label>
        <select v-model.number="month">
          <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
        </select>

        <label>日：</label>
        <select v-model.number="day">
          <option v-for="d in daysInMonth" :key="d" :value="d">{{ d }}</option>
        </select>

        <label>时：</label>
        <select v-model.number="hour">
          <option v-for="h in hourOptions" :key="h.value" :value="h.value">
            {{ h.label }}
          </option>
        </select>
      </div>

      <button class="btn-now" @click="setNow">使用当前时间</button>
    </div>

    <!-- 排盘结果 -->
    <div v-if="result" class="result-area">
      <!-- 四柱与局数信息 -->
      <div class="info-bar">
        <div class="info-item">
          <span class="info-label">年柱</span>
          <span class="info-value">{{ result.yearGanZhi }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">月柱</span>
          <span class="info-value">{{ result.monthGanZhi }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">日柱</span>
          <span class="info-value">{{ result.dayGanZhi }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">时柱</span>
          <span class="info-value">{{ result.hourGanZhi }}</span>
        </div>
        <div class="info-item highlight">
          <span class="info-label">局数</span>
          <span class="info-value">{{ result.juType }}{{ result.juNumber }}局</span>
        </div>
      </div>

      <!-- 九宫格 -->
      <div class="palace-grid">
        <div
          v-for="palace in result.palaces"
          :key="palace.id"
          class="palace-cell"
          :class="{ 'center-palace': palace.id === 5 }"
        >
          <div class="palace-header">
            <span class="palace-shen">{{ palace.shen }}</span>
            <span class="palace-id">{{ palace.id }}宫</span>
          </div>
          <div class="palace-body">
            <div class="palace-xing">{{ palace.xing }}</div>
            <div class="palace-men">{{ palace.men }}</div>
          </div>
          <div class="palace-footer">
            <span class="sky-gan">天{{ palace.skyGan }}</span>
            <span class="earth-gan">地{{ palace.earthGan }}</span>
          </div>
        </div>
      </div>

      <!-- 吉凶分析 -->
      <div v-if="analysis" class="analysis-area">
        <h2>整体运势分析</h2>
        <div class="score-bar">
          <div class="score-label">综合评分</div>
          <div class="score-value" :class="{ positive: analysis.overallScore > 0, negative: analysis.overallScore < 0 }">
            {{ analysis.overallScore > 0 ? '+' : '' }}{{ analysis.overallScore }}
          </div>
        </div>
        <p class="summary">{{ analysis.summary }}</p>

        <div class="detail-list">
          <div v-for="(item, idx) in analysis.details" :key="idx" class="detail-item">
            <span class="detail-category">{{ item.category }}</span>
            <span class="detail-level" :class="{ ji: item.level.includes('吉'), xiong: item.level.includes('凶') }">
              {{ item.level }}
            </span>
            <span class="detail-desc">{{ item.detail }}</span>
          </div>
        </div>

        <div class="advice-box">
          <strong>建议：</strong>{{ analysis.advice }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { paiPan } from './utils/qimen'
import type { QimenResult } from './utils/qimen'
import { analyzeResult } from './utils/analyze'
import type { AnalyzeResult } from './utils/analyze'

// 时间状态
const year = ref(2026)
const month = ref(9)
const day = ref(4)
const hour = ref(14)

// 年份选项（2000~2050）
const yearOptions = Array.from({ length: 51 }, (_, i) => 2000 + i)

// 时辰选项
const hourOptions = [
  { label: '子时 (23-1)', value: 0 },
  { label: '丑时 (1-3)', value: 2 },
  { label: '寅时 (3-5)', value: 4 },
  { label: '卯时 (5-7)', value: 6 },
  { label: '辰时 (7-9)', value: 8 },
  { label: '巳时 (9-11)', value: 10 },
  { label: '午时 (11-13)', value: 12 },
  { label: '未时 (13-15)', value: 14 },
  { label: '申时 (15-17)', value: 16 },
  { label: '酉时 (17-19)', value: 18 },
  { label: '戌时 (19-21)', value: 20 },
  { label: '亥时 (21-23)', value: 22 }
]

// 根据年月计算当月天数
const daysInMonth = computed(() => {
  return new Date(year.value, month.value, 0).getDate()
})

// 排盘结果
const result = ref<QimenResult | null>(null)
// 分析结果
const analysis = ref<AnalyzeResult | null>(null)

// 执行排盘并自动分析
function doPaiPan() {
  result.value = paiPan(year.value, month.value, day.value, hour.value)
  if (result.value) {
    analysis.value = analyzeResult(result.value)
  }
}

// 使用当前时间
function setNow() {
  const now = new Date()
  year.value = now.getFullYear()
  month.value = now.getMonth() + 1
  day.value = now.getDate()
  hour.value = now.getHours()
}

// 监听时间变化自动排盘
watch([year, month, day, hour], () => {
  // 修正日期超出当月天数的情况
  if (day.value > daysInMonth.value) {
    day.value = daysInMonth.value
  }
  doPaiPan()
})

// 初始化
onMounted(() => {
  setNow()
})
</script>

<style scoped>
/* 全局防溢出 */
.app-container, .analysis-area, .detail-list, .detail-item {
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
}

.app-container {
  max-width: 680px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

h1 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 24px;
  color: #333;
}

/* 时间选择区 */
.time-selector {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.time-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.time-row label {
  font-size: 14px;
  color: #666;
}

.time-row select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.btn-now {
  padding: 8px 20px;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-now:hover {
  background: #357abd;
}

/* 四柱信息栏 */
.info-bar {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.info-item {
  text-align: center;
}

.info-item.highlight {
  background: #fff3e0;
  padding: 4px 12px;
  border-radius: 4px;
}

.info-label {
  display: block;
  font-size: 12px;
  color: #999;
}

.info-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-top: 2px;
}

/* 九宫格 */
.palace-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 4px;
  background: #333;
  border-radius: 8px;
  padding: 4px;
}

.palace-cell {
  background: #fff;
  border-radius: 4px;
  padding: 10px 8px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.palace-cell.center-palace {
  background: #f5f5f5;
}

.palace-cell:nth-child(1) { grid-column: 1; grid-row: 1; }
.palace-cell:nth-child(2) { grid-column: 2; grid-row: 1; }
.palace-cell:nth-child(3) { grid-column: 3; grid-row: 1; }
.palace-cell:nth-child(4) { grid-column: 1; grid-row: 2; }
.palace-cell:nth-child(5) { grid-column: 2; grid-row: 2; }
.palace-cell:nth-child(6) { grid-column: 3; grid-row: 2; }
.palace-cell:nth-child(7) { grid-column: 1; grid-row: 3; }
.palace-cell:nth-child(8) { grid-column: 2; grid-row: 3; }
.palace-cell:nth-child(9) { grid-column: 3; grid-row: 3; }

.palace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}

.palace-shen {
  font-size: 13px;
  color: #e65100;
  font-weight: bold;
}

.palace-id {
  font-size: 11px;
  color: #aaa;
}

.palace-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 6px 0;
}

.palace-xing {
  font-size: 15px;
  color: #1565c0;
  font-weight: bold;
}

.palace-men {
  font-size: 15px;
  color: #2e7d32;
  font-weight: bold;
  margin-top: 2px;
}

.palace-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
  padding-top: 4px;
}

.sky-gan {
  font-size: 12px;
  color: #1565c0;
}

.earth-gan {
  font-size: 12px;
  color: #6a1b9a;
}

/* 分析区域 */
.analysis-area {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-sizing: border-box; /* 防止padding撑破容器 */
}

.analysis-area h2 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #333;
}

.score-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.score-label {
  font-size: 14px;
  color: #666;
}

.score-value {
  font-size: 28px;
  font-weight: bold;
}

.score-value.positive { color: #2e7d32; }
.score-value.negative { color: #c62828; }

.summary {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #e8f5e9;
  border-radius: 4px;
}

.detail-list {
  margin-bottom: 16px;
  width: 100%; /* 强制占满父容器 */
}

/* ⚠️【核心修复】彻底放弃flex，改用固定宽度块级布局，根治撑开问题 */
.detail-item {
  display: block;      /* 改为块级元素 */
  padding: 6px 0;
  border-bottom: 1px dashed #eee;
  font-size: 13px;
  width: 100%;
  line-height: 1.5;
  margin-bottom: 6px;
}

.detail-category {
  display: inline-block;
  background: #e3f2fd;
  padding: 2px 8px;
  border-radius: 3px;
  color: #1565c0;
  font-weight: bold;
  margin-right: 10px;
}

.detail-level.ji { color: #2e7d32; font-weight: bold; margin-right: 10px;}
.detail-level.xiong { color: #c62828; font-weight: bold; margin-right: 10px; }

.detail-desc { 
  color: #555;
  display: block;      /* 文字强制换行到下一行 */
  margin-top: 4px;     /* 稍微拉开一点和标签的间距 */
  padding-left: 2px;
}

.advice-box {
  background: #fff8e1;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #5d4037;
  line-height: 1.6;
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  box-sizing: border-box;
}
</style>