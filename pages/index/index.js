const app = getApp()

Page({
  data:{

  },

  getUserInfo: function(event) {
    console.log(event)
    if (event.detail.userInfo) {
      app.globalData.userInfo = event.detail.userInfo
      this.setData({
        avatar: app.globalData.userInfo.avatarUrl
      })
      this.getToken()
    } else {
      wx.showModal({
        title: '授权失败',
        content: '未授权会影响进入小程序噢~',
        showCancel: false,
        confirmText: '重新授权',
      })
    }
  },

  getToken: function () {
    wx.login({
      success: (res) => {
        var code = res.code
        wx.getUserInfo({
          success: (res_user) => {
            console.log("in")
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
                wx.reLaunch({
                  url: '../home/home',
                })
              },
              fail: (res) => {
                console.log("request fail")
              }
            })
          },
          fail: () => {
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
                var token = res.data.data
                wx.setStorage({
                  key: 'token',
                  data: token,
                })
                app.globalData.token = token
              },
              fail: (res) => {
                console.log("getUserInfo Fail && request Fail")
              }
            })
          }
        })
      }
    })
  },

})
