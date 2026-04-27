const { Resvg } = require('@resvg/resvg-js')
const fs = require('fs')
const path = require('path')

const svgData = fs.readFileSync('C:\\Users\\Administrator\\Desktop\\如意1.svg')

// 复制 SVG
fs.copyFileSync(
  'C:\\Users\\Administrator\\Desktop\\如意1.svg',
  path.join('assets', 'icon.svg')
)
console.log('icon.svg copied')

// 渲染各尺寸 PNG
const sizes = [256, 128, 64, 48, 32, 16]
for (const size of sizes) {
  const r = new Resvg(svgData, { fitTo: { mode: 'width', value: size } })
  const png = r.render().asPng()
  const outPath = path.join('assets', `icon_${size}.png`)
  fs.writeFileSync(outPath, png)
  console.log(`saved icon_${size}.png (${png.length} bytes)`)
}

// 保存主 256px
const r256 = new Resvg(svgData, { fitTo: { mode: 'width', value: 256 } })
fs.writeFileSync(path.join('assets', 'icon.png'), r256.render().asPng())
console.log('icon.png saved')
