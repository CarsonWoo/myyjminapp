// pages/discover/discover.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    circular: true,
    previousMargin: 30,
    nextMargin: 30,
    card_list: [],
    currentPos: 0,
    isShowDialog: false,
    page: 2,
    currentUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadData()
  },

  loadData: function() {
    var token = app.globalData.token
    console.log("token = " + token)
    var host = app.globalData.HOST
    wx.request({
      url: host + "/various/found_page.do",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      success: (res) => {
        console.log(res)
        if (res.data.status == 200) {
          var list = res.data.data.daily_pic
          this.setData({
            card_list: list,
            page: 2,
            currentUrl: list[0].daily_pic
          })
        } else if (res.data.status == 400 && res.data.msg == '身份认证错误！') {
          this.getToken()
        }

      },
      fail: (res) => {
        console.log("fail")
        console.log(res)
      }
    })
  },

  getToken: function() {
    wx.login({
      success: (res) => {
        var code = res.code
        wx.getUserInfo({
          success: (res_user) => {
            // var token = null
            // console.log("in")
            wx.request({
              url: app.globalData.HOST + '/user/wx_login.do',
              data: {
                code: code,
                username: res_user.userInfo.nickName,
                gender: res_user.userInfo.gender,
                portrait: res_user.userInfo.avatarUrl
              },
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: (res) => {
                console.log(res.data)
                var token = res.data.data
                wx.setStorage({
                  key: 'token',
                  data: token,
                })
                app.globalData.token = token
                this.loadData()
              },
              fail: (res) => {
                console.log("request fail")
              }
            })
            // this.globalData.token = token
          },
          fail: () => {
            // var token = null
            wx.request({
              url: app.globalData.HOST + '/user/wx_login.do',
              data: {
                code: code,
                username: null,
                gender: null,
                portrait: null
              },
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: (res) => {
                console.log(res.data)
                // console.log("test point")
                var token = res.data.data
                wx.setStorage({
                  key: 'token',
                  data: token,
                })
                app.globalData.token = token
                this.loadData()
              },
              fail: (res) => {
                console.log("getUserInfo Fail && request Fail")
              }
            })
            // console.log(token)
            // this.globalData.token = token
          }
        })
      }
    })
  },

  onDownloadTap: function(event) {
    // var url = event.currentTarget.dataset.url
    // console.log(url)
    // console.log(this.data.currentUrl)
    var url = this.data.currentUrl
    if (url.indexOf('http://47.107.62.22') != -1) {
      console.log(url)
      url = url.replace('http://47.107.62.22', 'https://file.ourbeibei.com')
      console.log(url)
    }

    wx.downloadFile({
      url: url,
      success: function(res) {

        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(result) {
            console.log(result)
            wx.showToast({
              title: '下载成功',
              duration: 800
            })
          }
        })
      }
    })
  },

  toWebView: function(event) {
    this.onCloseDialog()
    wx.navigateTo({
      url: 'web/web',
    })
  },

  onSwiperChange: function(event) {
    // console.log(event.detail.current)
    let current = event.detail.current
    let length = this.data.card_list.length
    console.log("current = " + current)
    console.log("length = " + length)
    this.data.currentUrl = this.data.card_list[current].daily_pic
    if (current == length - 1) {
      this.loadMorePics()
    }
  },

  loadMorePics: function() {
    var token = app.globalData.token
    // console.log("token = " + token)
    var host = app.globalData.HOST
    wx.request({
      url: host + "/various/daily_pic.do",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      data: {
        page: this.data.page,
        size: 6
      },
      success: (res) => {
        console.log(res)
        var list = res.data.data
        let origin_list = this.data.card_list
        for (let i = 0; i < list.length; i++) {
          origin_list.splice(origin_list.length, 0, list[i])
        }
        // origin_list.splice(origin_list.length, 0, list)
        console.log(origin_list)
        this.setData({
          card_list: origin_list,
          page: this.data.page + 1
        })
      },
      fail: (res) => {
        console.log("fail")
        console.log(res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  onShowDialog: function(event) {
    let id = event.currentTarget.id
    if (id == 1) {
      this.setData({
        isShowDialog: true,
        alert_type: 1,
        isMiddleClick: false
      })
    } else {
      this.setData({
        isShowDialog: true,
        alert_type: 2,
        isMiddleClick: false
      })
    }
  },

  onCloseDialog: function(event) {
    this.setData({
      isShowDialog: false,
      alert_type: 0
    })
  },

  onMiddleClick: function(event) {
    this.setData({
      isMiddleClick: true,
      isShowDialog: true
    })
    setTimeout(this.onCloseDialog, 1300)
  },

  stopPageScroll: function(e) {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // console.log("refresh")
    this.setData({
      currentPos: 0
    })
    this.loadData()
    setTimeout(this.stopRefresh, 500)
  },

  stopRefresh: function() {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})