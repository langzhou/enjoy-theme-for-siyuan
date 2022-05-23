

const douban = {
  name: "豆瓣",
  placeholder: "请输入书籍名称",
  search: function (keyword) {
   
    return [{
      title: "三国演义",
      subtitle: "罗贯中 - 2021",
      url: "https://book.douban.com/j/subject_suggest?q=" + keyword,
      pic:"https://img3.doubanio.com/f/shire/5522dd1f5b742d1e13ba43a466fb36d162b611d3/pics/book-default-lpic.gif",
      id: "sangguo1"
    },{
      title: "三国传奇",
      subtitle: "李四 - 测试",
      url: "https://book.douban.com/j/subject_suggest?q=" + keyword,
      pic:"https://img3.doubanio.com/f/shire/5522dd1f5b742d1e13ba43a466fb36d162b611d3/pics/book-default-lpic.gif",
      id: "sanguo2"
    }]
  },
  select:function(index,data){
    console.log(index,data)
  }

}

const darkMode = {
  name: "暗黑",
  placeholder: "回车切换暗黑模式",
  enter: function (keyword) {
    // console.log('访问暗黑...');
    return []
  }
}

export const  actions = [douban,darkMode]