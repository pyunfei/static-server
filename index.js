const Koa = require('koa')
const Router = require("koa-router")
const htmlRender = require("koa-html-render")
const path = require('path')
const content = require('./util/content')
const mimes = require('./util/mimes.js')

const qrcode = require('qrcode-terminal');

const app = new Koa()
const router = new Router()

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './static'

// 解析资源类型
function parseMime(url) {
  let extName = path.extname(url)
  extName = extName ? extName.slice(1) : 'unknown'
  return mimes[extName]
}

app.use(htmlRender())
app.use(router.routes()).use(router.allowedMethods())

router.get("/", async (ctx, next) => {
  console.log('%c [ ctx ]-27', 'font-size:13px; background:pink; color:#bf2c9f;', ctx.host)
  await ctx.html('index.html')
  next()
})

app.use(async (ctx) => {
  // 静态资源目录在本地的绝对路径
  let fullStaticPath = path.join(__dirname, staticPath)
  // 获取静态资源内容，有可能是文件内容，目录，或404
  let _content = await content(ctx, fullStaticPath)
  // 解析请求内容的类型
  let _mime = parseMime(ctx.url)
  // 如果有对应的文件类型，就配置上下文的类型
  if (_mime) {
    ctx.type = _mime
  }
  // 输出静态资源内容
  if (_mime && _mime.indexOf('image/') >= 0) {
    // 如果是图片，则用node原生res，输出二进制数据
    ctx.res.writeHead(200)
    ctx.res.write(_content, 'binary')
    ctx.res.end()
  } else {
    // 其他则输出文本 不允许暴露访问目录
    ctx.body = { error: "Document not found", url: ctx.url }
  }
})

router.get("/", async (ctx) => {
  const ip = ctx.request.ips
  qrcode.setErrorLevel(ip);
  qrcode.generate(ip, { small: true });
})


app.listen(3434)
console.log(`static-server 🚀 http://127.0.0.1:3434 is starting at port 3434`)
