/**
 * 根据语言代码（如 zh-CN）返回对应的 Windows 内置语音配置
 * local: Windows Desktop TTS 语音
 * remote: 浏览器 Web Speech API 远程语音（Google）
 */
const VOICE_MAP = {
  'zh-CN': {
    local: [
      'Microsoft Huihui Desktop - Chinese (Simplified)',
      'Microsoft Kangkang Desktop - Chinese (Simplified)',
      'Microsoft Yaoyao Desktop - Chinese (Simplified)',
    ],
    localLangs: ['zh-CN', 'zh-CN', 'zh-CN'],
    remote: ['Google 普通话（中国大陆）', 'Google 中文（普通话）'],
    remoteLangs: ['zh-CN', 'zh-CN'],
    defaultName: 'Microsoft Huihui Desktop - Chinese (Simplified)',
    defaultLang: 'zh-CN',
  },
  'zh-TW': {
    local: [
      'Microsoft Hanhan Desktop - Chinese (Traditional, Taiwan)',
      'Microsoft Yating Desktop - Chinese (Traditional, Taiwan)',
    ],
    localLangs: ['zh-TW', 'zh-TW'],
    remote: ['Google 中文（台灣）'],
    remoteLangs: ['zh-TW'],
    defaultName: 'Microsoft Hanhan Desktop - Chinese (Traditional, Taiwan)',
    defaultLang: 'zh-TW',
  },
  'zh-HK': {
    local: [
      'Microsoft Tracy Desktop - Chinese (Traditional, Hong Kong S.A.R.)',
      'Microsoft Danny Desktop - Chinese (Traditional, Hong Kong S.A.R.)',
    ],
    localLangs: ['zh-HK', 'zh-HK'],
    remote: ['Google 粵語（香港）'],
    remoteLangs: ['zh-HK'],
    defaultName: 'Microsoft Tracy Desktop - Chinese (Traditional, Hong Kong S.A.R.)',
    defaultLang: 'zh-HK',
  },
  'en-US': {
    local: [
      'Microsoft David Desktop - English (United States)',
      'Microsoft Zira Desktop - English (United States)',
      'Microsoft Mark Desktop - English (United States)',
    ],
    localLangs: ['en-US', 'en-US', 'en-US'],
    remote: ['Google US English', 'Google 英语（美国）'],
    remoteLangs: ['en-US', 'en-US'],
    defaultName: 'Microsoft David Desktop - English (United States)',
    defaultLang: 'en-US',
  },
  'en-GB': {
    local: [
      'Microsoft Hazel Desktop - English (Great Britain)',
      'Microsoft George Desktop - English (Great Britain)',
      'Microsoft Susan Desktop - English (Great Britain)',
    ],
    localLangs: ['en-GB', 'en-GB', 'en-GB'],
    remote: ['Google UK English Female', 'Google UK English Male'],
    remoteLangs: ['en-GB', 'en-GB'],
    defaultName: 'Microsoft Hazel Desktop - English (Great Britain)',
    defaultLang: 'en-GB',
  },
  'ja-JP': {
    local: [
      'Microsoft Haruka Desktop - Japanese',
      'Microsoft Ichiro Desktop - Japanese',
      'Microsoft Ayumi - Japanese (Japan)',
    ],
    localLangs: ['ja-JP', 'ja-JP', 'ja-JP'],
    remote: ['Google 日本語', 'Google 日本語（日本）'],
    remoteLangs: ['ja-JP', 'ja-JP'],
    defaultName: 'Microsoft Haruka Desktop - Japanese',
    defaultLang: 'ja-JP',
  },
  'ko-KR': {
    local: [
      'Microsoft Heami Desktop - Korean',
    ],
    localLangs: ['ko-KR'],
    remote: ['Google 한국의', 'Google 한국어'],
    remoteLangs: ['ko-KR', 'ko-KR'],
    defaultName: 'Microsoft Heami Desktop - Korean',
    defaultLang: 'ko-KR',
  },
  'fr-FR': {
    local: [
      'Microsoft Hortense Desktop - French',
      'Microsoft Julie Desktop - French (France)',
      'Microsoft Paul Desktop - French (France)',
    ],
    localLangs: ['fr-FR', 'fr-FR', 'fr-FR'],
    remote: ['Google français', 'Google français (France)'],
    remoteLangs: ['fr-FR', 'fr-FR'],
    defaultName: 'Microsoft Hortense Desktop - French',
    defaultLang: 'fr-FR',
  },
  'de-DE': {
    local: [
      'Microsoft Hedda Desktop - German',
      'Microsoft Stefan Desktop - German (Germany)',
      'Microsoft Katja - German (Germany)',
    ],
    localLangs: ['de-DE', 'de-DE', 'de-DE'],
    remote: ['Google Deutsch', 'Google Deutsch (Deutschland)'],
    remoteLangs: ['de-DE', 'de-DE'],
    defaultName: 'Microsoft Hedda Desktop - German',
    defaultLang: 'de-DE',
  },
  'es-ES': {
    local: [
      'Microsoft Helena Desktop - Spanish (Spain)',
      'Microsoft Pablo Desktop - Spanish (Spain)',
      'Microsoft Laura - Spanish (Spain)',
    ],
    localLangs: ['es-ES', 'es-ES', 'es-ES'],
    remote: ['Google español', 'Google español (España)'],
    remoteLangs: ['es-ES', 'es-ES'],
    defaultName: 'Microsoft Helena Desktop - Spanish (Spain)',
    defaultLang: 'es-ES',
  },
  'es-MX': {
    local: [
      'Microsoft Sabina Desktop - Spanish (Mexico)',
      'Microsoft Raul Desktop - Spanish (Mexico)',
    ],
    localLangs: ['es-MX', 'es-MX'],
    remote: ['Google español de Estados Unidos', 'Google español (Latinoamérica)'],
    remoteLangs: ['es-MX', 'es-MX'],
    defaultName: 'Microsoft Sabina Desktop - Spanish (Mexico)',
    defaultLang: 'es-MX',
  },
  'pt-BR': {
    local: [
      'Microsoft Maria Desktop - Portuguese (Brazil)',
      'Microsoft Daniel Desktop - Portuguese (Brazil)',
    ],
    localLangs: ['pt-BR', 'pt-BR'],
    remote: ['Google português do Brasil', 'Google português (Brasil)'],
    remoteLangs: ['pt-BR', 'pt-BR'],
    defaultName: 'Microsoft Maria Desktop - Portuguese (Brazil)',
    defaultLang: 'pt-BR',
  },
  'pt-PT': {
    local: [
      'Microsoft Helia Desktop - Portuguese (Portugal)',
    ],
    localLangs: ['pt-PT'],
    remote: ['Google português'],
    remoteLangs: ['pt-PT'],
    defaultName: 'Microsoft Helia Desktop - Portuguese (Portugal)',
    defaultLang: 'pt-PT',
  },
  'ru-RU': {
    local: [
      'Microsoft Irina Desktop - Russian',
      'Microsoft Pavel Desktop - Russian',
    ],
    localLangs: ['ru-RU', 'ru-RU'],
    remote: ['Google русский'],
    remoteLangs: ['ru-RU'],
    defaultName: 'Microsoft Irina Desktop - Russian',
    defaultLang: 'ru-RU',
  },
  'ar-SA': {
    local: [
      'Microsoft Naayf Desktop - Arabic (Saudi Arabia)',
    ],
    localLangs: ['ar-SA'],
    remote: ['Google العربية'],
    remoteLangs: ['ar-SA'],
    defaultName: 'Microsoft Naayf Desktop - Arabic (Saudi Arabia)',
    defaultLang: 'ar-SA',
  },
  'th-TH': {
    local: [
      'Microsoft Pattara Desktop - Thai',
    ],
    localLangs: ['th-TH'],
    remote: ['Google ภาษาไทย'],
    remoteLangs: ['th-TH'],
    defaultName: 'Microsoft Pattara Desktop - Thai',
    defaultLang: 'th-TH',
  },
  'vi-VN': {
    local: [
      'Microsoft An Desktop - Vietnamese (Vietnam)',
    ],
    localLangs: ['vi-VN'],
    remote: ['Google Tiếng Việt'],
    remoteLangs: ['vi-VN'],
    defaultName: 'Microsoft An Desktop - Vietnamese (Vietnam)',
    defaultLang: 'vi-VN',
  },
  'id-ID': {
    local: [
      'Microsoft Andika Desktop - Indonesian',
    ],
    localLangs: ['id-ID'],
    remote: ['Google Bahasa Indonesia'],
    remoteLangs: ['id-ID'],
    defaultName: 'Microsoft Andika Desktop - Indonesian',
    defaultLang: 'id-ID',
  },
  'it-IT': {
    local: [
      'Microsoft Elsa Desktop - Italian (Italy)',
      'Microsoft Cosimo Desktop - Italian (Italy)',
    ],
    localLangs: ['it-IT', 'it-IT'],
    remote: ['Google italiano', 'Google italiano (Italia)'],
    remoteLangs: ['it-IT', 'it-IT'],
    defaultName: 'Microsoft Elsa Desktop - Italian (Italy)',
    defaultLang: 'it-IT',
  },
  'nl-NL': {
    local: [
      'Microsoft Frank Desktop - Dutch (Netherlands)',
    ],
    localLangs: ['nl-NL'],
    remote: ['Google Nederlands'],
    remoteLangs: ['nl-NL'],
    defaultName: 'Microsoft Frank Desktop - Dutch (Netherlands)',
    defaultLang: 'nl-NL',
  },
  'pl-PL': {
    local: [
      'Microsoft Paulina Desktop - Polish',
    ],
    localLangs: ['pl-PL'],
    remote: ['Google polski'],
    remoteLangs: ['pl-PL'],
    defaultName: 'Microsoft Paulina Desktop - Polish',
    defaultLang: 'pl-PL',
  },
  'tr-TR': {
    local: [
      'Microsoft Tolga Desktop - Turkish',
    ],
    localLangs: ['tr-TR'],
    remote: ['Google Türkçe'],
    remoteLangs: ['tr-TR'],
    defaultName: 'Microsoft Tolga Desktop - Turkish',
    defaultLang: 'tr-TR',
  },
}

// countryCode → 主语言代码
const COUNTRY_TO_LANG = {
  CN: 'zh-CN', TW: 'zh-TW', HK: 'zh-HK', MO: 'zh-HK',
  JP: 'ja-JP', KR: 'ko-KR',
  US: 'en-US', GB: 'en-GB', AU: 'en-GB', CA: 'en-US', NZ: 'en-GB',
  IE: 'en-GB', ZA: 'en-GB', IN: 'en-GB', SG: 'en-GB',
  FR: 'fr-FR', BE: 'fr-FR', CH: 'fr-FR',
  DE: 'de-DE', AT: 'de-DE',
  ES: 'es-ES', MX: 'es-MX', AR: 'es-MX', CO: 'es-MX', CL: 'es-MX',
  BR: 'pt-BR', PT: 'pt-PT',
  RU: 'ru-RU', BY: 'ru-RU', KZ: 'ru-RU',
  SA: 'ar-SA', AE: 'ar-SA', EG: 'ar-SA', QA: 'ar-SA',
  TH: 'th-TH', VN: 'vi-VN', ID: 'id-ID',
  IT: 'it-IT', NL: 'nl-NL', PL: 'pl-PL', TR: 'tr-TR',
}

/**
 * 根据 countryCode 获取语音配置，找不到时返回 en-US
 */
function getVoiceConfig(countryCode) {
  const lang = COUNTRY_TO_LANG[countryCode] || 'en-US'
  return VOICE_MAP[lang] || VOICE_MAP['en-US']
}

/**
 * 生成 fpfile 中 speech.* 相关行
 */
function buildSpeechLines(countryCode) {
  const v = getVoiceConfig(countryCode)
  return [
    `speech.voices.local:${v.local.join('|')}`,
    `speech.voices.remote:${v.remote.join('|')}`,
    `speech.voices.local.langs:${v.localLangs.join('|')}`,
    `speech.voices.remote.langs:${v.remoteLangs.join('|')}`,
    `speech.voices.default.name:${v.defaultName}`,
    `speech.voices.default.lang:${v.defaultLang}`,
  ]
}

module.exports = { getVoiceConfig, buildSpeechLines, COUNTRY_TO_LANG }
