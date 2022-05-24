import { request } from "../utils/network.js";
import { snackbar, copyText } from "../utils/utils.js";

export default class LinkBookmark {
  async domWatcher(mutation) {
    if (mutation.target.childNodes.length == 1) {
      let node = mutation.target.childNodes[0];
      // 首先获取弹框元素，然后判断是否为网络链接
      if (node.className && node.className == "b3-form__space--small") {
        const span = node.querySelector("label > span"); //获取第一个span元素
        if (span && span.innerText == "链接") {
          const link = node.querySelector("label > input").value;
          if (link.indexOf("http") == -1) return; //不是网络链接则返回
          const boxFooter = node.querySelectorAll("div.fn__flex:last-child")[0];
          const fragment = document.createDocumentFragment();
          const span = document.createElement("span");
          span.classList.add("fn__space");
          const btn = document.createElement("button");
          btn.className = "b3-button b3-button--cancel";
          btn.innerText = "复制网页书签";
          btn.addEventListener("click", () => {
            this.createLinkBookmark(link);
          });
          fragment.appendChild(span);
          fragment.appendChild(btn);
          boxFooter.appendChild(fragment);
        }
      }
    }
  }

  /**
   * 处理文本选择事件
   * @param {event} e
   */
  // async handleSelectionEvent(e) {
  //   let node = e.target,
  //     inProtyle = false;
  //   // 判断事件是否发生在 protyle 中
  //   while (node != document) {
  //     if (node.classList.contains("protyle-wysiwyg")) {
  //       inProtyle = true;
  //       break;
  //     }
  //     node = node.parentNode;
  //   }

  //   if (inProtyle) {
  //     let selection = getSelection().toString();
  //     if (selection.indexOf("https://") >= 0) {
  //       this.createLinkBookmark(selection);
  //     }
  //   }
  // }

  /**
   * 根据 url 生成网页书签 html 内容块，并复制到剪贴板
   * @param {string} url
   */
  async createLinkBookmark(url) {
    let data = await this.getUrlInfor(url);
    copyText(this.createHTML(data));
    snackbar("网页书签已生成，请进行粘贴", "success");
  }

  /**
   *
   * @param {Object} data 
   * @param {string} data.title  网页标题
   * @param {string} data.intro  网页正文摘要
   * @param {string} data.url  http://www.baidu.com
   * @param {string} data.img  http://www.baidu.com/pic.png
   * @returns
   */
  createHTML(data) {
    let img = data.image
      ? `<div class="cover"><img src="${data.image}" /></div>`
      : "";
    return `<div class="link-card" onclick="window.open('${data.url}')">
    <div class="main">
    <div>
      <div class="title">${data.title}</div>
      <div class="intro">${data.intro}</div>
    </div>
    <div class="url">${data.url}</div>
    </div>
    ${img}
    </div>
    <style>
    .link-card{ 
    display:flex; 
    padding:14px;
    text-decoration:none;
    border:1px solid rgba(222,222,222,0.1);
    border-radius:4px;
    background:rgba(0,0,0,0.01);
    }
    .main{
    flex:1;
    display:flex;
    flex-direction:column;
    justify-content:space-between;
    }
    .title{
    font-weight:bold;
    }
    .intro{
    font-size:0.9em;
    opacity:0.8;
    margin-top:5px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: box;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    }
    .url{
    font-size:0.8em;
    margin-top:5px;
    opacity:0.6;
    }
    .cover{
    width:120px;
    height:90px;
    margin-left:10px;
    background:#fafafa;
    }
    img{
    width:100%;
    height:100%;
    border-radius:2px;
    object-fit:cover;
    }
    </style>`;
  }

  /**
   * 获取网页相关信息：标题、摘要、图片
   * @param {string} url
   * @returns 返回生成 html 所需字段的
   * @todo 获取页面信息的方式需要优化，防止 403
   */
  getUrlInfor(url) {
    let self = this;
    return new Promise(function (resolve, reject) {
      request(url, {}, "GET")
        .then((res) => {
          // 将获取到的 html 文本转化成 dom，然后调用 querySelector 方法
          let iframe = document.createElement("div");
          iframe.innerHTML = res;
          let nodes = iframe.querySelectorAll("p"); //获取页面中的所有p标签
          let intro = "";
          // 拼接摘要，大于阈值时停止
          for (let node of nodes) {
            intro += node.innerText;
            if (intro.length > 150) {
              break;
            }
          }
          // 当获取不到 title 标签时尝试取 h1 的文本值
          let title =
            iframe.querySelector("title").innerText != ""
              ? iframe.querySelector("title").innerText
              : iframe.querySelector("h1").innerText;
          let image = iframe.querySelector("img");
          if (image) image = image.getAttribute("src");
          resolve({
            title: self.clearText(title),
            url: url,
            intro: self.clearText(intro, 150),
            image: image,
          });
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  }

  /**
   * 去除文本中的空格、换行符，同时支持字符串截取
   * @param {string} text 需要处理的文本
   * @param {number} length 截取的长度
   * @returns 处理后的字符串
   */
  clearText(text, length = 0) {
    text = text.replace(/[\r\n]/g, "").replace(/\ +/g, "");
    if (length > 0) {
      return text.substr(0, length);
    } else {
      return text;
    }
  }
}

