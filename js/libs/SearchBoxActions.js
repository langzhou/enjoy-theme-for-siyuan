import { request } from "../utils/network.js"
const douban = {
  name: "豆瓣",
  trigger: ["douban", "豆瓣"],
  placeholder: "请输入书籍名称",
  search: (keyword, resolve, reject) => {
    // const result = [
    //   {
    //     title: "三国演义",
    //     subtitle: "罗贯中 - 2021",
    //     url: "https://book.douban.com/j/subject_suggest?q=" + keyword,
    //     img: "https://img3.doubanio.com/f/shire/5522dd1f5b742d1e13ba43a466fb36d162b611d3/pics/book-default-lpic.gif",
    //     id: "sangguo1",
    //   },
    //   {
    //     title: "三国传奇",
    //     subtitle: "李四 - 测试",
    //     url: "https://book.douban.com/j/subject_suggest?q=" + keyword,
    //     img: "https://img3.doubanio.com/f/shire/5522dd1f5b742d1e13ba43a466fb36d162b611d3/pics/book-default-lpic.gif",
    //     id: "sanguo2",
    //   },
    //   ,
    //   {
    //     title: "三国传奇3333",
    //     subtitle: "李四 - 测试",
    //     url: "https://book.douban.com/j/subject_suggest?q=" + keyword,
    //     img: "https://img3.doubanio.com/f/shire/5522dd1f5b742d1e13ba43a466fb36d162b611d3/pics/book-default-lpic.gif",
    //     id: "sanguo2",
    //   },
    // ]

    // resolve(result)

    const url = `https://book.douban.com/j/subject_suggest?q=${keyword}`
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        if (res.length > 0) {
          const data = res.map((item) => {
            return {
              title: item.title,
              subtitle: item.author_name + " - " + item.year,
              url: item.url,
              img: item.pic,
              id: item.id,
            }
          })
          resolve(data)
        } else {
          reject("没有搜索到相关书籍")
        }
      })
  },
  select: (index, data, resolve, reject) => {
    resolve(index)
  },
}

const darkMode = {
  name: "暗黑",
  trigger: ["暗黑", "dark"],
  placeholder: "回车切换暗黑模式",
  search: (keyword, resolve, reject) => {
    console.log("访问暗黑...", keyword)
    // resolve()
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
    if (window.siyuan) {
      const lightThemes = window.siyuan.config.appearance.lightThemes.map(
        (item) => {
          return {
            title: item,
            subtitle: "light",
            url: "none",
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
            url: "none",
            id: item,
            mode: 1,
          }
        }
      )
      theme.themes = lightThemes.concat(darkThemes)

      return lightThemes.concat(darkThemes)
    }
  },

  search: (keyword, resolve, reject) => {
    const data = theme.themes.filter((item) => {
      console.log(item)
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
