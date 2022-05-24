import config from "../config.js"
import dropdownList from "./DropdownList.js"
import { request } from "../utils/network.js"
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
          const action = actions.find(
            (item) => item.trigger.indexOf(actionName) > -1
          )
          if (action) {
            this.createAction(action)
          }
        }
      }
    }
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
    this.showList(false)
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
