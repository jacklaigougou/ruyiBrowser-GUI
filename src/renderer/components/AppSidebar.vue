<template>
  <aside class="sidebar">
    <div class="sidebar-title">
      <span>导航</span>
      <button class="devtools-btn" title="打开 DevTools" @click="openDevTools">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      </button>
    </div>

    <!-- 可折叠分组 -->
    <div v-for="group in navGroups" :key="group.label" class="nav-group">
      <div class="nav-group-header" @click="toggle(group)">
        <span>{{ group.label }}</span>
        <span class="arrow" :class="{ open: group.open }">▾</span>
      </div>
      <div class="nav-children" :style="{ maxHeight: group.open ? group.children.length * 44 + 'px' : '0' }">
        <RouterLink
          v-for="item in group.children"
          :key="item.to"
          class="nav-item"
          :to="item.to"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </div>
    </div>

    <div class="status-bar">
      <span class="dot" :class="online ? 'dot--on' : 'dot--off'"></span>
      <span>{{ online ? 'Python服务已连接' : '服务未连接' }}</span>
    </div>
  </aside>
</template>

<script setup>
import { reactive } from 'vue'
import { useHealthStore } from '../composables/useHealth'

const { online } = useHealthStore()

const navGroups = reactive([
  {
    label: '浏览器控制',
    open: true,
    children: [
      { to: '/dashboard', label: '控制台',    icon: '⊞' },
      { to: '/sessions',  label: '会话管理',  icon: '◈' },
      { to: '/browser',   label: '浏览器操作', icon: '◉' },
    ],
  },
  {
    label: '系统设置',
    open: false,
    children: [
      { to: '/settings', label: '服务配置', icon: '⚙' },
    ],
  },
])

function toggle(group) {
  group.open = !group.open
}

function openDevTools() {
  window.ruyi.devtools()
}
</script>
