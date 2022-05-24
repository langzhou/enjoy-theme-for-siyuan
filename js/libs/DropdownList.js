/**
 * 弹出列表菜单
 */
class DropdownList {
  constructor(list, itemSelector) {
    this.list = document.querySelector(list) //列表
    this.itemSelector = itemSelector //列表项选择器
    this.itemIndex = -1 //选择项 index
    this.listItems = null //列表项: dom 元素
    this.listData = null //列表数据
  }

  /**
   * 创建菜单列表项
   * @param {Object[]} data 数据
   * @param {string} data[].id 唯一标识
   * @param {string} data[].title 标题
   * @param {string} data[].subtitle 副标题
   * @param {string} data[].url 链接
   * @param {string} data[].img 图片
   */
  createItems(data) {
    if (!data) return

    this.listData = data

    let html = ""

    data.forEach((item) => {
      const img = item.img
        ? `<div class="img"><img src="${item.img}" /></div>`
        : ""

      html += `
      <div class="list-item" 
      data-id="${item.id}" 
      data-title="${item.title}" 
      data-img="${item.img}"  
      data-url="${item.url}" >
        ${img}
        <div class="info">
          <div class="title"><a href="${item.url}">${item.title}</a></div>
          <div class="subtitle">${item.subtitle}</div>
        </div>
      </div>`
    })

    this.list.innerHTML = html
    this.itemIndex = -1
    this.listItems = document.querySelectorAll(this.itemSelector)
  }

  /* 创建列表项 */
  // createItems(data){
  //   let html = '', i=0
  //   data.forEach(item => {
  //     i++
  //     html += `
  //     <div class="list-item${i==1?' on':''}" data-id="${item.id}" data-title="${item.title}" data-img="${item.pic}" data-author="${item.author_name}" data-url="${item.url}" data-year="${item.year}">
  //       <div class="img"><img src="${item.pic}" /></div>
  //       <div class="info">
  //         <div class="title"><a href="${item.url}">${item.title}</a></div>
  //         <div class="tips">${item.author_name} - ${item.year}</div>
  //       </div>
  //     </div>`
  //   });

  //   this.list.innerHTML = html
  //   this.itemIndex = 0
  //   this.listItems = document.querySelectorAll(this.itemSelector)
  // }

  /* 方向键移动菜单项 */
  switchItems(e) {
    e.stopPropagation()
    e.preventDefault()
    switch (e.key) {
      case "ArrowUp":
        this.arrowUp(this.listItems)
        this.scrollList()
        break
      case "ArrowDown":
        this.arrowDown(this.listItems)
        this.scrollList()
        break
      case "Tab":
        this.arrowDown(this.listItems)
        this.scrollList()
        break
      default:
        break
    }
  }

  arrowUp(listItems) {
    if (this.itemIndex == -1) {
      this.itemIndex = listItems.length - 1
    } else {
      listItems[this.itemIndex].classList.remove("on")
      this.itemIndex -= 1
    }
    if (this.itemIndex < 0) {
      this.itemIndex = listItems.length - 1
    }
    listItems[this.itemIndex].classList.add("on")
  }

  arrowDown(listItems) {
    if (this.itemIndex == -1) {
      this.itemIndex = 0
    } else {
      listItems[this.itemIndex].classList.remove("on")
      this.itemIndex++
    }
    if (this.itemIndex >= listItems.length) this.itemIndex = 0
    listItems[this.itemIndex].classList.add("on")
  }

  /**
   * @typedef {Object} SelectItem
   * @property {number} index - 序号
   * @property {Object} data - 数据
   * @property {Object} dom - dom 元素
   * @returns {SelectItem | null} 返回选中项
   */
  selectItem() {
    let items = this.listItems
    if (this.itemIndex != -1) {
      return {
        index: this.itemIndex,
        data: this.listData[this.itemIndex],
        dom: items[this.itemIndex],
      }
    } else {
      return null
    }
  }

  // 移除选中项
  removeItemOn() {
    if (this.listItems && this.itemIndex != -1) {
      this.listItems.forEach((item) => {
        item.classList.remove("on")
      })
    }
    this.itemIndex = -1
  }

  /* 循环滚动列表 */
  scrollList() {
    let index = this.itemIndex,
      list = this.list,
      items = this.listItems,
      itemsCount = items.length,
      itemHeight = items[0].scrollHeight,
      listHeight = list.clientHeight,
      listScrollHeight = list.scrollHeight,
      listScrollTop = list.scrollTop

    if ((index + 1) * itemHeight - listScrollTop > listHeight) {
      list.scrollTop += itemHeight
    }
    if (index * itemHeight < listScrollTop) {
      list.scrollTop -= itemHeight
    }
    if (index == 0) {
      list.scrollTop = 0
    }
    if (index == itemsCount - 1) {
      list.scrollTop = listScrollHeight - listHeight
    }
  }
}

export default DropdownList
