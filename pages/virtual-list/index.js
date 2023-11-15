const listData = require('../../static/data.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
  },
  onLoad() {
    this.wholePageIndex = 0;
    this.wholeVideoList = [];
    this.currentRenderIndex = 0;
    this.index = 0;
    this.pageHeightArr = [];

    const query = wx.createSelectorQuery();
    query
      .select('#screenSee')
      .boundingClientRect()
      .exec(res => {
        this.windowHeight = res[0].height;
      });

    this.wholeVideoList[this.wholePageIndex] = listData;
    this.setData({ [`list[${this.wholePageIndex}]`]: listData }, () =>
      this.setHeight()
    );
  },

  setHeight() {
    const wholePageIndex = this.wholePageIndex;
    this.query = wx.createSelectorQuery();
    this.query.select(`#wrp_${wholePageIndex}`).boundingClientRect();
    this.query.exec(res => {
      this.pageHeightArr[wholePageIndex] = res[0] && res[0].height;
    });
  },

  bindscroll(e) {
    // 滚动的时候需要实时去计算当然应该在哪一屏幕
    let tempScrollTop = 0;
    const wholePageIndex = this.wholePageIndex;
    for (var i = 0; i < this.pageHeightArr.length; i++) {
      tempScrollTop = tempScrollTop + this.pageHeightArr[i];
      if (tempScrollTop > e.detail.scrollTop + this.windowHeight) {
        console.log('set this.computedCurrentIndex' + i);
        this.computedCurrentIndex = i;
        break;
      }
    }
    const currentRenderIndex = this.currentRenderIndex;
    if (this.computedCurrentIndex !== currentRenderIndex) {
      // 这里给不渲染的元素占位
      let tempList = new Array(wholePageIndex + 1).fill(0);
      tempList.forEach((item, index) => {
        if (
          this.computedCurrentIndex - 1 <= index &&
          index <= this.computedCurrentIndex + 1
        ) {
          tempList[index] = this.wholeVideoList[index];
        } else {
          tempList[index] = { height: this.pageHeightArr[index] };
        }
      });

      this.currentRenderIndex = this.computedCurrentIndex;
      // 渲染第一屏的时候，如果之前这里有看到这里，并且showVideoIcon，那么需要重新绑定一次。

      this.setData({ list: tempList });
    }
  },

  getVideoInfoData() {
    this.wholePageIndex = this.wholePageIndex + 1;
    const wholePageIndex = this.wholePageIndex;
    this.currentRenderIndex = wholePageIndex;
    this.wholeVideoList[wholePageIndex] = listData;
    let datas = { [`list[${wholePageIndex}]`]: listData };
    let tempList = new Array(wholePageIndex + 1).fill(0);
    if (wholePageIndex > 2) {
      tempList.forEach((item, index) => {
        if (index < tempList.length - 2) {
          tempList[index] = { height: this.pageHeightArr[index] };
        } else {
          tempList[index] = this.wholeVideoList[index];
        }
      });
      datas.list = tempList;
    }

    this.setData(datas, () => this.setHeight());
  },
});
