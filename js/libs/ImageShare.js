/* 选择文本后以图片形式进行分享 */
import html2canvas from "../packages/html2canvas.esm.js"
import { createOverlay, snackbar } from "../utils/utils.js"
class ImageShare {
  constructor() {
    this.box = null
    this.container = null
    this.image = null
  }

  showBox() {
    if (!this.box) this.createBox()
    this.createImage()
    this.overlay.style.display = "block"
    this.box.style.display = "block"
  }

  hiddenBox() {
    if (this.box) {
      this.box.style.display = "none"
      this.boxBody.innerHTML = '<div class="tips">图片生成中...<div>'
      this.container.innerHTML = ""
    }
    if (this.overlay) {
      this.overlay.style.display = "none"
    }
  }

  createBox() {
    // console.log("create box...", new Date().getTime())
    this.importFonts() //导入字体
    let fragment = document.createDocumentFragment()
    this.box = document.createElement("div")
    this.box.id = "lz-image-box"
    let header = document.createElement("div")
    header.className = "header"
    header.innerHTML = `
      <div style="display:flex">
        <div class="title">分享图片</div>
        <div class="themes">
          <div class="theme image-theme-white on"></div>
          <div class="theme image-theme-black"></div>
          <div class="theme image-theme-yellow"></div>
          <div class="theme image-font-font1 on">A</div>
          <div class="theme image-font-font2">A</div>
        </div>
      </div>
      <div style="display:flex">
        <div class="copy btn">复制</div>
        <div class="save btn">保存</div>
      </div>
    `
    header.addEventListener("click", (e) => this.handleEvents(e))
    this.boxBody = document.createElement("div")
    this.boxBody.className = "image"
    this.boxBody.innerHTML = '<div class="tips">图片生成中...<div>'
    this.box.appendChild(header)
    this.box.appendChild(this.boxBody)
    fragment.appendChild(this.box)

    createOverlay(this, "black")
    fragment.appendChild(this.overlay)
    this.overlay.addEventListener("click", () => this.hiddenBox())
    this.container = document.createElement("div")
    this.container.id = "lz-image-container"
    this.container.className = "image-theme-white image-font-font1"
    fragment.appendChild(this.container)
    document.body.appendChild(fragment)
    // console.log("end create box...", new Date().getTime())
  }

  handleEvents(e) {
    let target = e.target
    if (target.classList.contains("copy")) {
      this.copy()
      return
    }

    if (target.classList.contains("save")) {
      this.save()
      return
    }

    if (target.classList.contains("image-theme-white")) {
      document.querySelector('.on[class*="image-theme"]').classList.remove("on")
      target.classList.add("on")
      this.container.classList.remove("image-theme-black")
      this.container.classList.remove("image-theme-yellow")
      this.container.classList.add("image-theme-white")
      this.createImage()
      return
    }

    if (target.classList.contains("image-theme-black")) {
      document.querySelector('.on[class*="image-theme"]').classList.remove("on")
      target.classList.add("on")
      this.container.classList.remove("image-theme-white")
      this.container.classList.remove("image-theme-yellow")
      this.container.classList.add("image-theme-black")
      this.createImage()
      return
    }

    if (target.classList.contains("image-theme-yellow")) {
      document.querySelector('.on[class*="image-theme"]').classList.remove("on")
      target.classList.add("on")
      this.container.classList.remove("image-theme-black")
      this.container.classList.remove("image-theme-white")
      this.container.classList.add("image-theme-yellow")
      this.createImage()
      return
    }

    if (target.classList.contains("image-font-font1")) {
      document.querySelector('.on[class*="image-font"]').classList.remove("on")
      target.classList.add("on")
      this.container.classList.remove("image-font-font2")
      this.container.classList.add("image-font-font1")
      this.createImage()
      return
    }

    if (target.classList.contains("image-font-font2")) {
      document.querySelector('.on[class*="image-font"]').classList.remove("on")
      target.classList.add("on")
      this.container.classList.remove("image-font-font1")
      this.container.classList.add("image-font-font2")
      this.createImage()
      return
    }
  }

  createImage() {
    this.createImgContainer()
    html2canvas(this.container).then((canvas) => {
      this.img = this.canvasToImage(canvas)
      this.boxBody.innerHTML = ""
      this.boxBody.appendChild(this.img)
    })
  }

  createImgContainer() {
    // console.log("start create img container...", new Date().getTime())
    let blocks = document.querySelectorAll(".protyle-wysiwyg--select")
    let html = ""
    if (blocks.length > 0) {
      blocks.forEach((item, index, node) => {
        // html += `<p>${item.innerText}</p>`
        html += item.innerHTML
      })
    } else {
      let txt = ""
      let selection = getSelection()
      let rangeTxt = selection.getRangeAt(0).toString()
      txt = rangeTxt || this.lastSelection
      if (rangeTxt) this.lastSelection = rangeTxt
      html += `<p>${txt}</p>`
    }
    this.container.innerHTML = html

    // console.log("end create img container...", new Date().getTime())
  }

  canvasToImage(canvas) {
    var image = new Image()
    image.src = canvas.toDataURL("image/png")
    return image
  }

  save() {
    let a = document.createElement("a")
    let event = new MouseEvent("click")
    a.download = "思源笔记分享"
    a.href = this.img.src
    a.dispatchEvent(event)
  }

  /* 导入排版需要的字体 */
  importFonts() {
    let font = document.createElement("style")
    font.className = "image-share-font"
    font.innerHTML = `
      @font-face{
        font-family: 'LXGWWenKai';
        src : url('/appearance/themes/enjoy/assets/LXGWWenKai-Regular.ttf'),
              url('/appearance/themes/enjoy/assets/LXGWWenKai-Medium.ttf');
      }`
    document.head.appendChild(font)
  }

  /* 代码参考：https://segmentfault.com/a/1190000038507601 */
  copy() {
    let base64Data = this.img.src.split(",")
    const blobInput = this.convertBase64ToBlob(base64Data[1], "image/png")
    const clipboardItemInput = new ClipboardItem({ "image/png": blobInput })
    navigator.clipboard.write([clipboardItemInput])
    snackbar("复制成功", "success")
  }

  /* 代码来源：https://segmentfault.com/a/1190000038507601 */
  convertBase64ToBlob(base64, type) {
    var bytes = window.atob(base64)
    var ab = new ArrayBuffer(bytes.length)
    var ia = new Uint8Array(ab)
    for (var i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i)
    }
    return new Blob([ab], { type: type })
  }
}

export default ImageShare
