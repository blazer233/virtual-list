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
    ],
    pageHeight: [
      // 每一页高度
      // {
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

  // 滚动
  bindscroll(e) {
    // 实现虚拟列表
    this.data.pageList.forEach((item, index) => {
      // 手指上滑
      if (
        e.detail.deltaY < 0 &&
        item.bottom < e.detail.scrollTop &&
        this.data.pageList[index].visible &&
        this.data.pageList[index + 2]
      ) {
        console.warn(111);
        // 隐藏头部
        this.data.pageList[index].visible = false;
        this.data.headerHeight += item.height;
        // 显示底部
        if (!this.data.pageList[index + 2].visible) {
          console.warn(222);
          this.data.pageList[index + 2].visible = true;
          this.data.bottomHeight -= this.data.pageList[index + 2].height;
        }
        this.setData({
          pageList: this.data.pageList,
          headerHeight: this.data.headerHeight,
          bottomHeight: this.data.bottomHeight
        });
        return;
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
          this.data.headerHeight -= this.data.pageList[index - 2].height;
        }
        this.setData({
          pageList: this.data.pageList,
          headerHeight: this.data.headerHeight,
          bottomHeight: this.data.bottomHeight
        });
        return;
      }
      // wx.createIntersectionObserver()
      //   .relativeTo(".lsmap")
      //   .observe(`#wrp_${pageIndex}`, res => {
      //     console.log(res.intersectionRatio, this.pageHeightArr);
      //     if (res.intersectionRatio > 0) {
      //       this.setData({
      //         [`list[${pageIndex}]`]: this.data.allList[pageIndex]
      //       });
      //     } else {
      //       this.setData({
      //         [`list[${pageIndex}]`]: { height: this.pageHeightArr[pageIndex] }
      //       });
      //     }
      //   });
    });
  },
  // 搜索
  getSearch() {
    if (this.data.isLoading) return;
    wx.showLoading({ title: "加载中", mask: true });
    this.data.isLoading = true;
    // 这里可以换成接口请求得到的数据
    setTimeout(() => {
      this.data.isLoading = false;
      wx.hideLoading();
      if (listData.length > 0) {
        this.data.pageList.push({
          data: listData, //数据
          visible: true, // 当前是否显示
          top: 0, // 顶部在scroll里的高度
          height: this.data.virtualHeight || 0, // 高度
          bottom: this.data.virtualHeight || 0 // 底部在scroll里的高度
        });
      }
      console.log(this.data.pageList);
      this.setData(
        {
          pageList: this.data.pageList
        },
        () => {
          this.initPageHeight();
        }
      );
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
        console.log(this.data.pageList, cur);
        this.data.current++;
        this.setData({ pageList });
      });
  }
});
