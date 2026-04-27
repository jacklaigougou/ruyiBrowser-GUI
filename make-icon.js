const { Resvg } = require('@resvg/resvg-js')
const fs = require('fs')
const path = require('path')

const sourceSvg = process.argv[2] || path.join(process.env.USERPROFILE || '', 'Desktop', '如意1.svg')
const assetsDir = path.join(__dirname, 'assets')

if (!fs.existsSync(sourceSvg)) {
  throw new Error(`SVG 文件不存在: ${sourceSvg}`)
}

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true })
}

const svgData = fs.readFileSync(sourceSvg)

// 复制 SVG
fs.copyFileSync(
  sourceSvg,
  path.join(assetsDir, 'icon.svg')
)
console.log('icon.svg copied')

// 渲染各尺寸 PNG
const sizes = [256, 128, 64, 48, 32, 16]
for (const size of sizes) {
  const r = new Resvg(svgData, { fitTo: { mode: 'width', value: size } })
  const png = r.render().asPng()
  const outPath = path.join(assetsDir, `icon_${size}.png`)
  fs.writeFileSync(outPath, png)
  console.log(`saved icon_${size}.png (${png.length} bytes)`)
}

// 保存主 256px
const r256 = new Resvg(svgData, { fitTo: { mode: 'width', value: 256 } })
fs.writeFileSync(path.join(assetsDir, 'icon.png'), r256.render().asPng())
console.log('icon.png saved')

// 生成 Windows 图标
async function buildIco() {
  const { default: pngToIco } = await import('png-to-ico')
  const pngPaths = sizes
    .slice()
    .reverse()
    .map(size => path.join(assetsDir, `icon_${size}.png`))
  const icoBuffer = await pngToIco(pngPaths)
  fs.writeFileSync(path.join(assetsDir, 'icon.ico'), icoBuffer)
  console.log('icon.ico saved')
}

buildIco().catch((err) => {
  console.error('生成 icon.ico 失败:', err)
  process.exit(1)
})
