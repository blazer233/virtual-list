import { mockData } from "../../static/data";

Page({
  data: {
    list: [],
    pageIndex: 0
  },
  onLoad() {
    this.getVideoInfoData();
  },

  getVideoInfoData() {
    wx.showLoading({ title: "加载中", mask: true });
    setTimeout(() => {
      wx.hideLoading();
      this.data.list = this.data.list.concat(mockData);
      this.data.pageIndex++;
      this.setData({ list: this.data.list, pageIndex: this.data.pageIndex });
    }, 500);
  },
  onReachBottom() {
    this.getVideoInfoData();
  }
});
