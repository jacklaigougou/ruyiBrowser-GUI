<template>
  <div>
    <div class="form-card">
      <div class="field-row">
        <span class="field-label">代理类型</span>
        <div class="field-control">
          <select v-model="form.proxyType" class="field-input" style="width:auto;min-width:200px">
            <option value="none">No Proxy（本地直连）</option>
            <option value="http">HTTP</option>
            <option value="socks5">SOCKS5</option>
          </select>
        </div>
      </div>

      <template v-if="form.proxyType !== 'none'">
        <div class="field-row">
          <span class="field-label">代理 Host</span>
          <div class="field-control">
            <input v-model="form.proxyHost" type="text" class="field-input" placeholder="127.0.0.1" />
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">代理端口</span>
          <div class="field-control">
            <input v-model="form.proxyPort" type="text" class="field-input" placeholder="7890" />
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">用户名</span>
          <div class="field-control">
            <input v-model="form.proxyUser" type="text" class="field-input" placeholder="可选" />
          </div>
        </div>
        <div class="field-row">
          <span class="field-label">密码</span>
          <div class="field-control">
            <input v-model="form.proxyPass" type="password" class="field-input" placeholder="可选" />
          </div>
        </div>
      </template>
    </div>

    <!-- WebRTC -->
    <div class="form-card">
      <div class="field-row">
        <span class="field-label">WebRTC</span>
        <div class="field-control">
          <select v-model="form.webrtcMode" class="field-input" style="width:auto;min-width:140px">
            <option value="disabled">禁用</option>
            <option value="real">真实</option>
            <option value="proxy">使用代理</option>
          </select>
          <span v-if="form.webrtcMode === 'proxy'" style="font-size:12px;color:var(--text-muted);margin-top:6px;display:block">
            将自动使用代理 IP 配置 WebRTC 公网地址
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ form: Object })
</script>
