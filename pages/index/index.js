// pages/index/zx/search.js
const listData = require("../../static/data.js");
Page({
  data: {
    current: 0,
    size: 10,
    headerHeight: 0,
    bottomHeight: 0,
    pageList: [
      // {
      //   data: [],//数据
      //   visible: false,// 当前是否显示
      //   top: 0, // 顶部在scroll里的高度
      //   height: 0, // 高度
      //   bottom:0, // 底部在scroll里的高度
      // }
    ]
  },
  onLoad() {
    this.getSearch();
    const query = wx.createSelectorQuery();
    query
      .select("#screenSee")
      .boundingClientRect()
      .exec(res => {
        //找到页面的scroll-view并计算高度
        this.scrollH = res[0].height;
      });
  },
  // 滚动触底
  bindscrolltolower() {
    this.getSearch();
  },
  _curSearch(scrollTop, isSort) {
    let left = 0;
    let right = this.data.pageList.length;
    while (left <= right) {
      var center = Math.floor((left + right) / 2);
      if (
        isSort
          ? scrollTop < this.data.pageList[center].bottom
          : this.data.pageList[center].top > scrollTop + this.scrollH
      ) {
        right = center - 1;
      } else {
        left = center + 1;
      }
    }
    return left;
  },
  // 滚动
  bindscroll(e) {
    console.log(e.detail.scrollTop);
    // 实现虚拟列表
    // let _key = this._curSearch(e.detail.scrollTop, e.detail.deltaY < 0);
    // if (_key != this._indexcur) {
    //   console.warn(this._indexcur, 2333);
    //   this._indexcur = _key;
    //   wx.createIntersectionObserver()
    //     .relativeTo(".lsmap")
    //     .observe(`#listPageId${this._indexcur}`, res => {
    //       console.warn(this._indexcur, res.intersectionRatio, 2333);
    //       this.setData({
    //         [`pageList[${this._indexcur}].visible`]: res.intersectionRatio > 0
    //       });
    //     });
    // }
    for (let index = 0; index < this.data.pageList.length; index++) {
      const item = this.data.pageList[index];
      if (
        e.detail.deltaY < 0 &&
        e.detail.scrollTop > item.bottom &&
        this.data.pageList[index].visible &&
        this.data.pageList[index + 2]
      ) {
        // 手指上滑 且 数据被加载
        this.data.pageList[index].visible = false; // 第一行隐藏头部
        this.data.headerHeight = this.data.headerHeight + item.height; //计算总的需要被隐藏的头部
        if (!this.data.pageList[index + 2].visible) {
          // 手指上滑，且上滑的数据是已加载但未显示的
          this.data.pageList[index + 2].visible = true;
          this.data.bottomHeight =
            this.data.bottomHeight - this.data.pageList[index + 2].height; //计算剩余需要被隐藏的底部
        }
        this.setData({
          pageList: this.data.pageList,
          headerHeight: this.data.headerHeight,
          bottomHeight: this.data.bottomHeight
        });
        break;
      }
      // 手指下滑
      if (
        e.detail.deltaY > 0 &&
        item.top > e.detail.scrollTop + this.scrollH &&
        this.data.pageList[index].visible == true &&
        this.data.pageList[index - 2]
      ) {
        // 隐藏头部
        this.data.pageList[index].visible = false;
        this.data.bottomHeight += item.height;
        if (!this.data.pageList[index - 2].visible) {
          // 显示底部
          this.data.pageList[index - 2].visible = true;
          this.data.headerHeight =
            this.data.headerHeight - this.data.pageList[index - 2].height;
        }
        this.setData({
          pageList: this.data.pageList,
          headerHeight: this.data.headerHeight,
          bottomHeight: this.data.bottomHeight
        });
        break;
      }
    }
  },
  // 搜索
  getSearch() {
    wx.showLoading({ title: "加载中", mask: true });
    setTimeout(() => {
      wx.hideLoading();

      this.data.pageList.push({
        data: +new Date() % 2 ? listData.slice(0, 3) : listData, //数据
        visible: true, // 当前是否显示
        top: 0, // 顶部在scroll里的高度
        height: this.data.virtualHeight || 0, // 高度
        bottom: this.data.virtualHeight || 0 // 底部在scroll里的高度
      });
      this.setData(
        {
          pageList: this.data.pageList
        },
        () => this.initPageHeight()
      );

      // let data = this.data.current % 2 ? listData.slice(0, 3) : listData;
      // this.setData(
      //   {
      //     [`pageList[${this.data.current}]`]: {
      //       data, //数据
      //       visible: true, // 当前是否显示
      //       top: 0, // 顶部在scroll里的高度
      //       height: this.data.virtualHeight || 0, // 高度
      //       bottom: this.data.virtualHeight || 0 // 底部在scroll里的高度
      //     }
      //   },
      //   () => {
      //     this.initPageHeight();
      //   }
      // );
    }, 500);
  },
  // 初始化首页高度
  initPageHeight() {
    let cur = this.data.current;
    console.log("页数:" + cur);
    const query = wx.createSelectorQuery();
    query
      .select(`#listPageId${cur}`)
      .boundingClientRect()
      .exec(res => {
        let pageList = this.data.pageList;
        if (cur > 0) {
          pageList[cur].top = pageList[cur - 1].bottom + 1;
          pageList[cur].bottom = pageList[cur - 1].bottom + 1 + res[0].height;
        } else {
          pageList[cur].top = 0;
          pageList[cur].bottom = res[0].height;
        }
        pageList[cur].height = res[0].height;
        // 顶部在scroll里的高度
        this.data.current++;
        this.setData({ pageList });
      });
  }
});
