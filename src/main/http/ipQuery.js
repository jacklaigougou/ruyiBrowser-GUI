const http = require('http')
const https = require('https')

/**
 * IP 地理信息查询（供「根据 IP 设置」使用）
 *
 * 默认使用国内可访问的太平洋在线接口；可通过环境变量切换或回退到 ip-api.com。
 *
 * - RUYI_IP_GEO_PROVIDER=pconline | ip-api
 *   默认 pconline
 * - RUYI_IP_GEO_FALLBACK=0
 *   设为 0 时绝不请求 ip-api（国内接口失败则直接报错）。未设置时：国内源失败会自动尝试 ip-api。
 */

const REQUEST_TIMEOUT_MS = 12000

/** 太平洋在线对脚本请求较敏感，需模拟浏览器，否则会 HTTP 403 */
const PCONLINE_BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json, text/javascript, */*;q=0.01',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  Referer: 'http://whois.pconline.com.cn/',
  Connection: 'close',
}

const CC_TO_LANG = {
  CN: 'zh-CN,zh',
  TW: 'zh-TW,zh',
  HK: 'zh-HK,zh',
  MO: 'zh-MO,zh',
  JP: 'ja-JP,ja',
  KR: 'ko-KR,ko',
  US: 'en-US,en',
  GB: 'en-GB,en',
  DE: 'de-DE,de',
  FR: 'fr-FR,fr',
  ES: 'es-ES,es',
  PT: 'pt-BR,pt',
  BR: 'pt-BR,pt',
  RU: 'ru-RU,ru',
  IT: 'it-IT,it',
  NL: 'nl-NL,nl',
  PL: 'pl-PL,pl',
  TR: 'tr-TR,tr',
  TH: 'th-TH,th',
  VN: 'vi-VN,vi',
  ID: 'id-ID,id',
  AR: 'ar-SA,ar',
}

function suggestedLanguageFromCountryCode(cc) {
  if (!cc) return 'en-US,en'
  const upper = String(cc).toUpperCase()
  return CC_TO_LANG[upper] || 'en-US,en'
}

function fetchUrl(urlString, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const lib = urlString.startsWith('https:') ? https : http
    const headers = {
      'User-Agent': 'ruyipage-electron',
      Accept: 'application/json,*/*',
      ...extraHeaders,
    }
    const req = lib.get(urlString, { headers }, (res) => {
      let data = ''
      res.on('data', (c) => {
        data += c
      })
      res.on('error', reject)
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }))
    })
    req.on('error', reject)
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error('IP 查询超时'))
    })
  })
}

/** 线路抖动时易出现 ECONNRESET，短暂重试可恢复 */
async function fetchUrlWithRetry(urlString, extraHeaders = {}, attempts = 3) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchUrl(urlString, extraHeaders)
    } catch (e) {
      lastErr = e
      const retryable = ['ECONNRESET', 'ECONNREFUSED', 'EPIPE', 'ETIMEDOUT'].includes(e.code)
      if (!retryable || i === attempts - 1) throw e
      await new Promise((r) => setTimeout(r, 350 * (i + 1)))
    }
  }
  throw lastErr
}

function parseJsonBody(body) {
  const t = body.trim().replace(/^\uFEFF/, '')
  const jsonp = /^\s*\w+\s*\(\s*(\{[\s\S]*\})\s*\)\s*;?\s*$/.exec(t)
  const jsonStr = jsonp ? jsonp[1] : t
  return JSON.parse(jsonStr)
}

/** 太平洋在线：国内常用，返回省市区文本（通常不含经纬度） */
function inferTimezoneFromCnAddr(pro, city, addr) {
  const s = `${pro || ''}${city || ''}${addr || ''}`
  if (/香港|Hong Kong/i.test(s)) return 'Asia/Hong_Kong'
  if (/澳门|Macau|澳門/i.test(s)) return 'Asia/Macau'
  if (/台湾|台灣/i.test(s)) return 'Asia/Taipei'
  if (/新疆|乌鲁木齐|克拉玛依|喀什|伊犁/i.test(s)) return 'Asia/Urumqi'
  return 'Asia/Shanghai'
}

function inferCountryCodeFromPconline(j) {
  const addr = j.addr || ''
  const pro = j.pro || ''
  if (/美国|美國/.test(addr)) return 'US'
  if (/英国|英國|United Kingdom/i.test(addr)) return 'GB'
  if (/日本/.test(addr)) return 'JP'
  if (/韩国|韓國|朝鲜/.test(addr)) return 'KR'
  if (/德国|德國/.test(addr)) return 'DE'
  if (/法国|法國/.test(addr)) return 'FR'
  if (/俄罗斯|俄羅斯/.test(addr)) return 'RU'
  if (/澳大利亚|澳洲/.test(addr)) return 'AU'
  if (/加拿大/.test(addr)) return 'CA'
  if (/新加坡/.test(addr)) return 'SG'
  if (/香港/.test(addr) || /香港/.test(pro)) return 'HK'
  if (/澳门|澳門/.test(addr) || /澳门|澳門/.test(pro)) return 'MO'
  if (/台湾|台灣/.test(addr) || /台湾|台灣/.test(pro)) return 'TW'
  if (pro || /中国|北京|上海|天津|重庆|广东|浙江|江苏|四川|湖北|湖南|河南|河北|山东|山西|陕西|福建|广西|云南|贵州|海南|西藏|内蒙古|辽宁|吉林|黑龙江|青海|甘肃|宁夏|新疆|安徽|江西/.test(addr)) {
    return 'CN'
  }
  return 'CN'
}

function normalizePconline(json) {
  const err = json.err
  if (err != null && String(err).trim() !== '') {
    throw new Error(String(err))
  }
  const pro = json.pro || ''
  const city = json.city || ''
  const addr = json.addr || ''
  const countryCode = inferCountryCodeFromPconline(json)

  return {
    timezone: inferTimezoneFromCnAddr(pro, city, addr),
    countryCode,
    country: countryCode === 'CN' ? 'China' : undefined,
    regionName: pro,
    city,
    lat: undefined,
    lon: undefined,
    query: json.ip,
    suggestedLanguage: suggestedLanguageFromCountryCode(countryCode),
    _source: 'pconline',
  }
}

async function queryIpPconline(ip = '') {
  const buildQuery = () => {
    const q = new URLSearchParams()
    q.set('json', 'true')
    if (ip) q.set('ip', ip)
    return q.toString()
  }
  const query = buildQuery()
  const urls = [
    `http://whois.pconline.com.cn/ipJson.jsp?${query}`,
    `https://whois.pconline.com.cn/ipJson.jsp?${query}`,
  ]
  let lastStatus = 0
  for (const url of urls) {
    const headers =
      url.startsWith('https:')
        ? { ...PCONLINE_BROWSER_HEADERS, Referer: 'https://whois.pconline.com.cn/' }
        : PCONLINE_BROWSER_HEADERS
    const { statusCode, body } = await fetchUrlWithRetry(url, headers)
    lastStatus = statusCode
    if (statusCode === 200) {
      const json = parseJsonBody(body)
      return normalizePconline(json)
    }
  }
  throw new Error(`IP 查询 HTTP ${lastStatus || '失败'}`)
}

/** ip-api.com：境外服务，字段较全（含 lat/lon），作可选回退 */
async function queryIpApi(ip = '') {
  const url = ip ? `http://ip-api.com/json/${encodeURIComponent(ip)}` : 'http://ip-api.com/json/'
  const { statusCode, body } = await fetchUrlWithRetry(url)
  if (statusCode !== 200) {
    throw new Error(`IP 查询 HTTP ${statusCode}`)
  }
  const json = JSON.parse(body)
  if (json.status === 'fail') {
    throw new Error(json.message || 'IP 查询失败')
  }
  return {
    timezone: json.timezone,
    countryCode: json.countryCode,
    country: json.country,
    regionName: json.regionName,
    city: json.city,
    lat: json.lat,
    lon: json.lon,
    query: json.query,
    suggestedLanguage: suggestedLanguageFromCountryCode(json.countryCode),
    _source: 'ip-api',
  }
}

/**
 * 查询指定 IP 的地理信息（留空则查询出口 IP）
 * @param {string} [ip] - 要查询的 IP，留空查当前出口 IP
 */
async function queryIp(ip = '') {
  const provider = (process.env.RUYI_IP_GEO_PROVIDER || 'pconline').toLowerCase()
  const strictNoForeign = process.env.RUYI_IP_GEO_FALLBACK === '0'

  const tryOrder =
    provider === 'ip-api'
      ? [() => queryIpApi(ip)]
      : [() => queryIpPconline(ip), ...(strictNoForeign ? [] : [() => queryIpApi(ip)])]

  let lastErr = null
  for (const fn of tryOrder) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('IP 查询失败')
}

module.exports = { queryIp }
