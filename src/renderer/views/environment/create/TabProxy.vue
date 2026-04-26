<template>
  <div>
    <div class="form-card">
      <div class="field-row">
        <span class="field-label">代理类型</span>
        <div class="field-control">
          <select v-model="form.proxyType" class="field-input">
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
        <span class="field-label">本地 IPv4</span>
        <div class="field-control">
          <input v-model="form.localIpv4" type="text" class="field-input" placeholder="192.168.1.100" />
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">本地 IPv6</span>
        <div class="field-control">
          <input v-model="form.localIpv6" type="text" class="field-input" placeholder="可选" />
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">公网 IPv4</span>
        <div class="field-control">
          <input v-model="form.publicIpv4" type="text" class="field-input" placeholder="与代理出口一致" />
        </div>
      </div>
      <div class="field-row">
        <span class="field-label">公网 IPv6</span>
        <div class="field-control">
          <input v-model="form.publicIpv6" type="text" class="field-input" placeholder="可选" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ form: Object })
</script>
