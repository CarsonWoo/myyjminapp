// pages/home/sign/sign.js
const app = getApp()
const monthStr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_sign: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showShareMenu({
      withShareTicket: true
    })

    var word_challenge_status = wx.getStorageSync('word_challenge_status')
    this.setData({
      word_challenge_status: parseInt(word_challenge_status)
    })

    // this.getCalendar(clock_list)

    // console.log(weekList)

    this.loadData(wx.getStorageSync('token'))
    // this.getToken()
  },

  getCalendar(clock_list) {
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth()
    //获取当前月份总天数
    var days = new Date(year, month + 1, 0).getDate();
    //获取当前月份第一日开始在周几
    var startDay = new Date(year, month, 1).getDay();
    console.log(year)
    console.log(month)
    console.log(days)
    console.log(startDay)

    //计算行数
    let rows = parseInt((days + startDay) / 7);
    console.log(rows)
    if ((days + startDay) % 7 != 0) {
      //还有余
      rows = rows + 1
    }

    var weekList = []

    for (let i = 0, dayNum = 1; i < rows; i++) {
      var list = []
      if (i == 0) {
        for (let j = 1; j <= 7; j++) {
          if (j >= startDay) {
            if (clock_list.indexOf(dayNum) != -1) {
              //表示已打卡
              list[j - 1] = '*'
            } else {
              list[j - 1] = dayNum
            }
            dayNum = dayNum + 1
          } else {
            list[j - 1] = ''
          }
        }
      } else {
        for (let j = 0; j < 7; j++) {
          if (dayNum <= days) {
            if (clock_list.indexOf(dayNum) != -1) {
              list[j] = '*'
            } else {
              list[j] = dayNum
            }
            dayNum = dayNum + 1
          } else {
            list[j] = ''
          }

        }
      }
      weekList.push(list)
    }

    this.setData({
      year: year,
      month: monthStr[month],
      weekList: weekList,
    })
  },

  loadData: function(token) {
    wx.request({
      url: app.globalData.HOST + "/home/clock_history.do",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      success: (res) => {
        console.log(res.data)
        var data = res.data
        if (data.status == 400 && data.msg == '身份认证错误！') {
          this.getToken()
        } else if (data.status == 200) {
          let clock_list = data.data[0]
          console.log(clock_list)
          this.setData({
            clock_list: clock_list
          })
          this.getCalendar(clock_list)
        }
      },
      fail: (res) => {

      }
    })
  },

  getToken: function() {
    wx.login({
      success: (res) => {
        var code = res.code
        console.log(res)
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
                // console.log("token = " + token)
                // this.globalData.token = token
                // wx.setStorage({
                //   key: 'token',
                //   data: token,
                // })
                // app.globalData.token = token
                this.loadData(token)
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
                console.log("test point")
                var token = res.data.data
                // console.log(token)
                // console.log(this)
                // this.globalData.token = token
                // wx.setStorage({
                //   key: 'token',
                //   data: token,
                // })
                // app.globalData.token = token
                this.loadData(token)
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

  // onSignTap: function(event) {
  //   console.log(event.detail.formId)
  //   let form_id = event.detail.formId
  //   var token = app.globalData.token
  //   var HOST = app.globalData.HOST
  //   wx.request({
  //     url: HOST + '/various/collect_form_id.do',
  //     method: 'POST',
  //     header: {
  //       'content-type': 'application/x-www-form-urlencoded',
  //       'token': token
  //     },
  //     data: {
  //       form_id: form_id
  //     },
  //     success: (res) => {
  //       if (res.data.status == 200) {
  //         console.log("success")
  //       } else {
  //         console.log(res)
  //       }
  //     },
  //     fail: (res) => {
  //       console.log(res)
  //     }
  //   })
  // },

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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    // if (this.data.requestToSign) {
    //   var pages = getCurrentPages()
    //   let beforePage = pages[0]
    //   beforePage.loadData(app.globalData.token)
    //   beforePage.doSignWork()
    // }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    if (res.form) {
      if (res.form == 'button') {
        console.log(res.target)
      }
    }
    return {
      title: '我正在背呗背单词赢奖品，快来跟我一起背~',
      path: '/pages/home/home',
      imageUrl: 'https://file.ourbeibei.com/l_e/common/brother.jpg',
      success: (res) => {
        if (!this.data.is_sign) {
          this.doSignWork()
        }
      },
      fail: (res) => {
        if (!this.data.is_sign) {
          wx.showModal({
            title: '提示',
            content: '分享失败了噢...成功分享赢奖品~',
          })
        }
      }
      // success: (res) => {
      //   //getSystemInfo是为了获取当前设备信息，判断是android还是ios，如果是android
      //   //还需要调用wx.getShareInfo()，只有当成功回调才是转发群，ios就只需判断shareTickets
      //   //获取用户设备信息
      //   wx.getSystemInfo({
      //     success: (d) => {
      //       console.log(d)
      //       //判断是Android还是IOS
      //       if (d.platform == 'android') {
      //         wx.getShareInfo({
      //           shareTicket: res.shareTickets,
      //           success: (info) => {
      //             //记录打卡
      //             // this.doSignWork()
      //             this.setData({
      //               requestToSign: true
      //             })
      //             wx.navigateBack({

      //             })
      //           },
      //           fail: (info) => {
      //             wx.showModal({
      //               title: '提示',
      //               content: '分享到好友无效噢',
      //               showCancel: false
      //             })
      //           }
      //         })
      //       }
      //       if (d.platform == 'ios') {
      //         if (res.shareTickets != undefined) {
      //           console.log("分享到群")
      //           wx.getShareInfo({
      //             shareTicket: res.shareTickets,
      //             success: (info) => {
      //               //打卡
      //               // this.doSignWork()
      //               this.setData({
      //                 requestToSign: true
      //               })
      //               wx.navigateBack({

      //               })
      //             }
      //           })
      //         } else {
      //           //分享到个人
      //           wx.showModal({
      //             title: '提示',
      //             content: '分享到好友无效噢',
      //             showCancel: false
      //           })
      //         }
      //       }
      //     },
      //   })
      // },
      // fail: (res) => {
      //   console.log(res)
      // }
    }
  },

  onFeedScroll: function() {
    wx.reLaunch({
      url: '../home?action=onFeedScroll',
    })
  },

  doSignWork: function() {
    var token = app.globalData.token
    var HOST = app.globalData.HOST
    wx.request({
      url: HOST + '/home/clock_in.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      success: (res) => {
        if (res.data.status == 200) {
          // wx.reLaunch({
          //   url: '../home',
          // })
          this.setData({
            is_sign: true
          })
          this.loadData(token)
          var beforePage = getCurrentPages()[0]
          beforePage.loadData(app.globalData.token)
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },
})