const listData = require('../../static/data.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    allList: [],
  },
  onLoad() {
    /**
     * 1、将列表通过每次请求为一页转为嵌套数组
     * 2、setData之后异步计算每次渲染的页面高度
     * 3、通过API relativeToViewport检测是否在可视区域内的，如果该页面出现在可视区域内
     *    则从嵌套列表中取出对应的数据渲染到视图，如果没有出现在可视区间内用空白div填充
     *    并设置对应页面的高度
     *
     * 只有可视区域内的div渲染高度，隐藏的div用空白填充高度
     */
    this.pageIndex = 0;
    this.pageHeightArr = [];
    const query = wx.createSelectorQuery();
    query
      .select('#screenSee')
      .boundingClientRect()
      .exec(res => {
        this.windowHeight = res[0].height;
      });
    this.data.allList[this.pageIndex] = listData;
    this.setData({ [`list[${this.pageIndex}]`]: listData }, () => {
      this.setHeight();
    });
  },

  onUnload() {
    console.log(this._observer);
    if (this._observer) this._observer.disconnect();
  },
  setHeight() {
    wx.createSelectorQuery()
      .select(`#wrp_${this.pageIndex}`)
      .boundingClientRect()
      .exec(res => {
        this.pageHeightArr[this.pageIndex] = res[0] && res[0].height;
      });
    this.observePage(this.pageIndex);
  },

  observePage(pageIndex) {
    console.log(pageIndex); //每一屏渲染完成后，监听当前这一屏是否在可视区域内
    this._observer = wx
      .createIntersectionObserver()
      .relativeToViewport({
        top: 2 * this.windowHeight,
        bottom: 2 * this.windowHeight,
      })
      .observe(`#wrp_${pageIndex}`, res => {
        console.log(res.intersectionRatio);
        if (res.intersectionRatio <= 0) {
          // 未出现在可视区域
          this.setData({
            [`list[${pageIndex}]`]: { height: this.pageHeightArr[pageIndex] },
          });
        } else {
          // 出现在可视区域
          this.setData({
            [`list[${pageIndex}]`]: this.data.allList[pageIndex],
          });
        }
      });
  },

  getVideoInfoData() {
    let loadList = this.pageIndex % 2 ? listData : listData.slice(0, 3);
    this.pageIndex = this.pageIndex + 1;
    this.data.allList[this.pageIndex] = loadList;
    this.setData({ [`list[${this.pageIndex}]`]: listData }, () => {
      this.setHeight();
    });
  },
});
