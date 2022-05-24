/**
 * 搜索模式 Search Pattern
 * name: string 搜索模式名称
 * trigger: Array<string> 触发关键词
 * placeholder: string 提示语
 * defalut:()=>{return listData} 触发搜索模式后初始化操作，可返回默认候选列表
 * search:(keyword, resovle, reject)=>{return listData} 执行搜索，可返回搜索结果，成功时回调 resolve，失败时回调 reject
 * select:(index, data, resovle, reject)=>{} 选中候选项后执行的操作，成功时回调 resolve，失败时回调 reject
 */

import config from "../config.js"
import { request } from "../utils/network.js"

const douban = {
  name: "豆瓣",
  trigger: ["douban", "豆瓣"],
  placeholder: "请输入书籍名称",
  search: (keyword, resolve, reject) => {
    const url = `https://book.douban.com/j/subject_suggest?q=${keyword}`
    request(url, {}, "get").then((res) => {
      if (res.length > 0) {
        const data = res.map((item) => {
          return {
            title: item.title,
            subtitle: item.author_name + " - " + item.year,
            url: item.url,
            img: item.pic,
            id: item.id,
            author:item.author_name,
            year:item.year
          }
        })
        resolve(data)
      } else {
        reject("没有搜索到相关书籍")
      }
    })
  },
  select: async (index, data, resolve, reject) => {
    const html = await request(
      "https://book.douban.com/subject/" + data.id,
      {},
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
    const content = config.searchBox.template
      .replace("{img}", data.img)
      .replace("{title}", data.title)
      .replace("{author}", data.author)
      .replace("{url}", data.url)
      .replace("{year}", data.year)
      .replace("{dir}", dir)
      .replace("{now}", now)

    const note = {
      notebook: config.searchBox.notebook, //笔记本ID
      path: config.searchBox.path + `《${data.title}》`,
      markdown: content,
    }

    request("/api/filetree/createDocWithMd", note).then((res) => {
      if (res.data) window.open(`siyuan://blocks/${res.data}`)
    })
  },
}

const darkMode = {
  name: "暗黑",
  trigger: ["暗黑", "dark"],
  placeholder: "回车切换暗黑模式",
  search: (keyword, resolve, reject) => {
    request("/api/system/setAppearanceMode", { mode: 1 }).then((res) => {
      window.location.reload()
    })
  },
}

const theme = {
  name: "主题",
  trigger: ["主题", "theme"],
  placeholder: "选择主题回车切换",
  themes: [],
  default: () => {
      const lightThemes = window.siyuan.config.appearance.lightThemes.map(
        (item) => {
          return {
            title: item,
            subtitle: "light",
            url: null,
            id: item,
            mode: 0,
          }
        }
      )

      const darkThemes = window.siyuan.config.appearance.darkThemes.map(
        (item) => {
          return {
            title: item,
            subtitle: "dark",
            url: null,
            id: item,
            mode: 1,
          }
        }
      )

      theme.themes = lightThemes.concat(darkThemes)

      return lightThemes.concat(darkThemes)
  },

  search: (keyword, resolve, reject) => {
    const data = theme.themes.filter((item) => {
      if (item.title.indexOf(keyword) > -1) {
        return item
      }
    })
    if (data.length > 0) {
      resolve(data)
    } else {
      reject("没有搜索到相关主题")
    }
  },

  select: (index, data, resolve, reject) => {
    const appearance = window.siyuan.config.appearance
    appearance.mode = data.mode
    if (data.mode == 1) {
      appearance.themeDark = data.id
    } else {
      appearance.themeLight = data.id
    }
    request("/api/setting/setAppearance", appearance).then((res) => {
      window.location.reload()
    })
  },
}

export const actions = [douban, darkMode, theme]
