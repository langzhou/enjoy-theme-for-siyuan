import dropdownList from "./DropdownList.js"
import { request } from "../utils/network.js"
import config from "../config.js"
import { actions } from "./SearchBoxActions.js"
import { snackbar } from "../utils/utils.js"

class SearchBox {
  constructor() {
    this.searchBox = null
    this.box = null
    this.mask = null
    this.isShow = false
    this.actionName = ""
    this.action = null
    this.defaultPlaceHolder = "请输入命令"
  }

  handelKeyUp(e) {
    // 输入框为空则收起列表项
    // if (this.isShow && this.input.innerText == "") this.showList(false)
    this.handleInput(e)
    this.actionTrigger(e)
  }

  handleKeyDown(e) {
    // 移除 action
    if (
      this.isShow &&
      this.actionName &&
      (e.key == "Delete" || e.key == "Backspace")
    ) {
      if (this.input.innerText == "") this.removeAction()
    }

    // esc 关闭搜索框
    if (this.isShow && e.key == "Escape") {
      this.showBox(false)
    }

    // 切换列表项
    if (
      this.isShow &&
      (e.key == "ArrowUp" ||
        e.key == "ArrowDown" ||
        e.key == "Enter" ||
        e.key == "Tab")
    ) {
      this.dropdownList.switchItems(e)
    }

    // 选择列表项
    if (this.isShow && e.key == "Enter") {
      if (this.dropdownList.itemIndex > -1) {
        this.handleSelect(this.dropdownList.selectItem())
      } else {
        this.handleSearch()
      }
    }
  }

  handleSearch() {
    this.showLoading()
    if (this.action && this.action.search) {
      this.action.search(
        this.input.innerText,
        this.searchResolve.bind(this),
        this.searchReject.bind(this)
      )
    } else {
      this.showLoading(false)
    }
  }

  /**
   * 搜索成功
   * @param {Array<object> | undefined} data
   */
  searchResolve(data) {
    console.log(data)
    if (data) {
      this.dropdownList.createItems(data) //创建列表项
      this.showList()
    } else {
      // 如果没有返回数据，则关闭搜索框
      this.showBox(false)
    }
    this.showLoading(false)
  }

  /**
   * 搜索出错
   * @param {string | undefined} err
   */
  searchReject(err) {
    snackbar(err || "出错啦", "warning")
    this.showList(false)
    this.showLoading(false)
  }

  /**
   * 选中菜单项
   * @param {object} item
   * @param {number} item.index
   * @param {object} item.data
   * @param {object} item.dom
   */
  handleSelect(item) {
    this.showLoading()
    this.showList(false) //关闭列表项
    window.getSelection().removeAllRanges() //移除输入框焦点

    if (this.action && this.action.select) {
      this.action.select(
        item.index,
        item.data,
        this.selectResolve.bind(this),
        this.selectReject.bind(this)
      )
    }

    this.showLoading(false)
    this.showBox(false)
    item.dom.classList.remove("on")
  }

  /**
   * 选中菜单项操作成功
   * @param {string} msg toast提示信息
   */
  selectResolve(msg) {
    if (msg) {
      snackbar(msg, "success")
    }
  }

  /**
   * 选中菜单项操作失败
   * @param {string | undefined} err toast提示信息
   */
  selectReject(err) {
    snackbar(err || "出错啦", "warning")
  }

  handleInput(e) {
    // 屏蔽功能键
    let keys = [
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "Escape",
      "Enter",
      "Tab",
    ]

    if (keys.indexOf(e.key) > -1) return

    // 输入时移除选中项
    if (this.input) this.dropdownList.removeItemOn()
  }

  create() {
    this.searchBox = document.querySelector("#lz-search-box")
    if (!this.searchBox) {
      let fragement = document.createDocumentFragment()
      this.box = document.createElement("div")
      this.box.className = "box"
      this.mask = document.createElement("div")
      this.mask.className = "mask"
      this.mask.addEventListener("click", () => {
        this.showBox(false)
      })

      this.input = document.createElement("div")
      this.input.id = "lz-search-box-input"
      this.input.className = "input"
      this.input.setAttribute("contenteditable", true)
      this.input.setAttribute("placeholder", this.defaultPlaceHolder)
      this.input.setAttribute("spellcheck", false)

      this.icon = document.createElement("div")
      this.icon.className = "icon"

      this.list = document.createElement("div")
      this.list.className = "list"

      this.box.appendChild(this.input)
      this.box.appendChild(this.icon)
      this.searchBox = document.createElement("div")
      this.searchBox.id = "lz-search-box"
      this.searchBox.appendChild(this.box)
      this.searchBox.appendChild(this.list)
      this.searchBox.appendChild(this.mask)
      fragement.appendChild(this.searchBox)
      document.body.append(fragement)

      this.dropdownList = new dropdownList(
        "#lz-search-box .list",
        "#lz-search-box .list-item"
      )
    }
  }

  async selectItem(item) {
    this.showLoading()
    this.showList(false) //关闭列表项
    window.getSelection().removeAllRanges() //移除输入框焦点

    // let id = item.getAttribute("data-id"),
    //   pic = item.getAttribute("data-img"),
    //   title = item.getAttribute("data-title"),
    //   author = item.getAttribute("data-author"),
    //   url = item.getAttribute("data-url"),
    //   year = item.getAttribute("data-year")

    let html = await request(
      "https://book.douban.com/subject/" + item.data.id,
      "",
      "get"
    ) //访问豆瓣书目主页
    // 正则匹配获取目录信息
    let reg =
      /<div class="indent" id="dir_\d+_full" style="display:none">([\s\S]*?)\(<a/
    let result = html.match(reg),
      dir = ""
    if (result) {
      dir = result[1].replace(/\s/g, "").replace(/<br\/>/g, "\n\n")
    }
    let now = new Date().toDateString()
    // let content = `![img](${pic})\n\n**书目**：[${title}](${url})\n\n**作者**：${author} \n\n**出版年份**：${year}\n\n**标签**：\n\n**阅读日期**：${now}\n\n**在线阅读**：微信阅读\n\n### 推荐语\n\n\n\n### 阅读心得\n\n\n\n### 书摘\n\n\n\n### 知识应用\n\n\n\n### 相关阅读\n\n\n\n### 书籍目录\n\n\n\n${dir}`
    const content = config.searchBox.template
      .replace("{pic}", item.data.pic)
      .replace("{title}", item.data.title)
      .replace("{author}", item.data.author)
      .replace("{url}", item.data.url)
      .replace("{year}", item.data.year)
      .replace("{dir}", item.data.dir)
      .replace("{now}", now)

    this.createDoc({ title: `《${item.data.title}》`, content: content })
    this.showLoading(false)
    this.showBox(false)
    item.dom.classList.remove("on")
  }

  /* 创建文档 */
  createDoc(doc) {
    let data = {
      notebook: "20220317102842-0fpuxs6", //笔记本ID
      path: "/读书笔记/" + doc.title,
      markdown: doc.content,
    }
    request("/api/filetree/createDocWithMd", data).then((res) => {
      if (res.data) window.open(`siyuan://blocks/${res.data}`)
    })
  }

  showBox(show = true) {
    if (show) {
      this.isShow = true
      this.searchBox.style.display = "block"
      this.input.focus()
    } else {
      this.isShow = false
      this.searchBox.style.display = "none"
      this.input.innerText = ""
      this.input.setAttribute("placeholder", this.defaultPlaceHolder)
      this.list.innerHTML = ""
      this.removeAction()
    }
  }

  showLoading(show = true) {
    if (show) {
      this.icon.classList.add("loading")
    } else {
      this.icon.classList.remove("loading")
    }
  }

  actionTrigger(e) {
    if (this.isShow) {
      let txt = this.input.innerText
      if (!this.actionName && txt) {
        const reg = /^(\S+)\s/gi
        const res = reg.exec(txt)
        if (res) {
          const actionName = res[1]
          const action = actions.find((item) => item.trigger.indexOf(actionName) > -1)
          console.log(action)
          if (action) {
            this.createAction(action)
          }
        }
      }
    }
  }

  getBooks(keyword) {
    // console.log('访问豆瓣...');
    let url = `https://book.douban.com/j/subject_suggest?q=${keyword}`
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (res.length > 0) {
          this.dropdownList.createItems(res) //创建列表项
          this.showList()
        } else {
          this.showList(false)
        }
      })
  }

  createAction(action) {
    this.action = action
    this.actionName = action.name
    this.actionElement = document.createElement("div")
    this.actionElement.className = "action"
    this.actionElement.innerText = action.name
    this.input.innerText = ""
    this.input.setAttribute(
      "placeholder",
      action.placeholder || this.defaultPlaceHolder
    )
    this.box.insertBefore(this.actionElement, this.input)

    if (action.default) {
      this.dropdownList.createItems(action.default()) //创建列表项
      this.showList()
    }
  }

  removeAction() {
    if (this.actionElement) this.actionElement.remove()
    this.actionName = ""
    this.action = null
    this.input.setAttribute("placeholder", this.defaultPlaceHolder)
  }

  showList(show = true) {
    if (show) {
      this.list.style.display = "block"
      this.list.style.opacity = 1
    } else {
      this.list.style.display = "none"
      this.list.style.opacity = 0
    }
    this.dropdownList.itemIndex = -1
  }
}

export default SearchBox
