// pages/home/feed/feed.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onLikeTap: function (event) {
    // app = getApp()
    var anim = wx.createAnimation({
      
    })

    anim.rotateZ(180).scale3d(0.5, 0.5, 0.5).step({duration: 400})
    anim.scale3d(1, 1, 1).rotateZ(0).step({duration: 400})

    this.setData({
      animation: anim.export()
    })

    console.log("tap")
    console.log(this.data.id)
    wx.request({
      url: app.globalData.HOST + '/home/like_feeds.do',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': app.globalData.token
      },
      method: 'POST',
      data: {
        id: this.data.id
      },
      success: (res) => {
        console.log(res)
        if (res.data.status == 200) {
          wx.showToast({
            title: '点赞成功',
            duration: 800
          })
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  getToken: function () {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id

    this.setData({
      id: id
    })
    console.log(id)
    this.loadData()
    
  },

  loadData: function() {
    var token = app.globalData.token
    var HOST = app.globalData.HOST
    wx.request({
      url: HOST + '/home/article_detail.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      data: {
        id: this.data.id
      },
      success: (res) => {
        console.log(res)
        if (res.data.status == 200) {
          var data = res.data.data
          console.log(data)
          this.setData({
            author_portrait: data.author_portrait,
            pic: data.pic,
            title: data.title,
            author_username: data.author_username,
            order: data.order,
            likes: data.likes
          })
        } else if (res.data.status == 400 && res.data.msg == '身份认证错误！') {
          this.getToken()
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})