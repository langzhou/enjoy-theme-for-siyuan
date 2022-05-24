const douban = {
  name: "豆瓣",
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
          reject('没有搜索到相关书籍')
        }
      })
  },
  select: (index, data, resolve, reject) => {
    resolve(data)
  },
}

const darkMode = {
  name: "暗黑",
  placeholder: "回车切换暗黑模式",
  search: (keyword,resolve, reject) => {
    console.log('访问暗黑...',keyword);
    // resolve()
    reject("出错啦")
    
  },
  select: (index, data, resolve, reject) => {
    console.log(index, data)
    resolve(data)
  }
}

export const actions = [douban, darkMode]
