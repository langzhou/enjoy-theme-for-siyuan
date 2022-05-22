import InlineComment from "./libs/InlineComment.js";
import LinkCard from "./libs/LinkCard.js";
import config from "./config.js";

class SiyuanPlugin {
  constructor() {
    this.themeName = this.getThemeName();
    if (this.themeName) {
      // this.appendStyleSheet()
      this.inlineComment = new InlineComment();
      this.linkCard = new LinkCard();
      this.domWatcher();
      this.handleEvents();
      setTimeout(() => this.appendToolbarBtn(), 1000); //添加 toolbar 评论按钮
    }
  }

  /* 事件委托 */
  handleEvents() {
    // 按键按下事件
    window.addEventListener("keydown", (e) => {
      // this.shortcutKey(e)
      if (this.inlineComment) this.inlineComment.handleKeyDown(e);
    });

    // 输入防抖
    // window.addEventListener('keyup',lodash.debounce(e =>{
    //   if(this.searchBox) this.searchBox.handleInput(e)
    // },800))

    // 按键弹起事件
    // window.addEventListener('keyup',e =>{
    //   if(this.searchBox) this.searchBox.actionTrigger(e)
    // })

    // 鼠标单击事件
    window.addEventListener("click", (e) => {
      if (this.inlineComment) this.inlineComment.showBox(e);
    });

    // 鼠标松开事件
    window.addEventListener("mouseup", (e) => {
      if (this.inlineComment) this.inlineComment.handleSelectionEvent(e);
      // if (this.linkCard) this.linkCard.handleSelectionEvent(e);
    });
  }

  /* 检测 dom 变动，用于动态插入元素 */
  domWatcher() {
    var targetNode = document.querySelector(
      ".layout__center.fn__flex.fn__flex-1"
    );
    if (!targetNode) {
      setTimeout(() => {
        this.domWatcher();
      }, 300);
    } else {
      const config = { attributes: false, childList: true, subtree: true };
      const callback = (mutationsList, observer) => {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList") {
            this.childListChangedHook(mutation);
          } else if (mutation.type === "attributes") {
            console.log(
              "The " + mutation.attributeName + " attribute was modified."
            );
          }
        }
      };
      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);
      // observer.disconnect();
    }
  }

  /* 处理观察对象节点变动事件 */
  childListChangedHook(mutation) {
    // 添加工具条按钮
    if (mutation.addedNodes) {
      let node = mutation.addedNodes.item(0);
      // 新增 protyle 节点，即判断为打开了新文档
      if (node && node.className == "fn__flex-1 protyle") {
        // 因为 dom 树可能没有完全加载，需要延迟处理
        setTimeout(() => {
          this.appendToolbarBtn();
        }, 1000);
      }
    }

    if (this.inlineComment) this.inlineComment.domWatcher(mutation);
    if (this.linkCard) this.linkCard.domWatcher(mutation);
  }

  //添加工具条按钮
  appendToolbarBtn() {
    // 初始化时找到所有 protyle-toolbar
    let toolbars = document.querySelectorAll(".protyle-toolbar");
    const data = {
      type: "test",
      label: "添加评论",
      divider: false,
      icon: "comment",
      func: (e) => {
        console.log(e);
      },
    };

    if (toolbars) {
      toolbars.forEach((item, index, node) => {
        // console.log(item);
        if (!item.querySelector(`[data-type="${data.type}"]`)) {
          let fragment = this.createToolbarBtn(data);
          item.appendChild(fragment);
        }
      });
    }
  }

  createToolbarBtn(data) {
    let fragment = document.createDocumentFragment();
    let divider = document.createElement("div");
    divider.className = "protyle-toolbar__divider";
    let btn = document.createElement("button");
    btn.className = "protyle-toolbar__item b3-tooltips b3-tooltips__n";
    btn.setAttribute("data-type", data.type);
    btn.setAttribute("aria-label", data.label);
    btn.innerHTML = config.icons[data.icon] || config.icons.common;
    btn.addEventListener("click", (e) => {
      btn.parentElement.classList.add("fn__none"); //关闭 toolbar
      data.func(e);
    });
    if (data.divider) fragment.appendChild(divider);
    fragment.appendChild(btn);
    return fragment;
  }

  // 获取当前主题名称
  getThemeName() {
    let themeStyle = document.querySelector("#themeStyle");
    if (themeStyle) {
      let url = themeStyle.getAttribute("href").split("/");
      return url[url.length - 2];
    } else {
      setTimeout(() => this.getThemeName(), 500);
    }
  }

  // 插入样式表
  appendStyleSheet() {
    let node = document.querySelector("#protyleHljsStyle");
    if (!node) {
      setTimeout(() => {
        this.appendStyleSheet();
      }, 500);
    } else {
      let fragment = document.createDocumentFragment();
      let css = document.createElement("link");
      css.setAttribute("rel", "stylesheet");
      css.setAttribute("type", "text/css");
      css.setAttribute(
        "href",
        "./appearance/themes/" + this.themeName + "/style/siyuan-utils.css"
      );
      fragment.appendChild(css);
      document.head.insertBefore(fragment, node);
    }
  }
}

new SiyuanPlugin();
