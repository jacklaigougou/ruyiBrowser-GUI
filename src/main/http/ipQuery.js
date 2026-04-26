const http = require('http')
const https = require('https')

/**
 * 查询指定 IP 的地理信息（留空则查询出口 IP）
 * 使用 ip-api.com 免费接口，HTTP only，限速 45次/分钟
 * @param {string} [ip] - 要查询的 IP，留空查当前出口 IP
 * @returns {Promise<{timezone, country, countryCode, regionName, city, lat, lon, query}>}
 */
function queryIp(ip = '') {
  const url = ip ? `http://ip-api.com/json/${ip}` : 'http://ip-api.com/json/'
  return new Promise((resolve, reject) => {
    http.get(url, { headers: { 'User-Agent': 'ruyipage-electron' } }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.status === 'fail') {
            reject(new Error(json.message || 'IP 查询失败'))
          } else {
            resolve(json)
          }
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', reject)
  })
}

module.exports = { queryIp }
