// pages/home/home.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // flag: 1,
    type: 0,
    storage: false,
    isShowDialog: false,
    alert_type: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var token = app.globalData.token
    wx.showShareMenu({
      withShareTicket: true
    })
    wx.showToast({
      title: '加载中..',
      icon: 'loading'
    })
    if (token) {
      console.log(token)
      this.loadData(token)
    } else {
      // console.log(token)
      this.getToken()
    }
    let action = options.action
    if (action != undefined && action != null) {
      this.setData({
        action: action
      })
    }
  },

  onDrawProgress: function() {
    var ctx = wx.createCanvasContext('progress-canvas')
    ctx.setStrokeStyle("#edeff3")
    // ctx.setStrokeStyle("black")
    ctx.setLineWidth(1.5)
    ctx.setLineCap("round")

    // ctx.beginPath()
    ctx.beginPath()

    ctx.moveTo(39, 194)

    ctx.arc(120, 120, 110, 0.75 * Math.PI, 2.25 * Math.PI, false)

    ctx.moveTo(54, 187)

    ctx.arc(120, 120, 95, 0.75 * Math.PI, 2.25 * Math.PI, false)

    ctx.moveTo(54, 187)

    ctx.quadraticCurveTo(55, 200, 40, 197)

    ctx.moveTo(186, 187)

    ctx.quadraticCurveTo(185, 200, 200, 197)

    ctx.stroke()

    ctx.setLineWidth(1)
    ctx.setStrokeStyle("#5ee1c9")
    ctx.beginPath()

    ctx.moveTo(46.5, 190.5)

    ctx.arc(120, 120, 102.5, 0.75 * Math.PI, 2.25 * Math.PI, false)

    ctx.stroke()

    ctx.setLineWidth(4)
    ctx.setStrokeStyle("#5ee1c9")
    ctx.beginPath()

    ctx.moveTo(44.5, 188.5)

    var progress = this.data.learned_word / this.data.plan_number

    // console.log(progress)

    ctx.arc(120, 120, 102.5, 0.75 * Math.PI, (0.75 + 1.5 * progress) * Math.PI, false)

    ctx.stroke()

    ctx.beginPath()

    ctx.moveTo(90, 70)

    ctx.setFontSize(15)
    ctx.setFillStyle("black")
    ctx.fillText("已背单词", 90, 70)

    ctx.fill()

    ctx.beginPath()

    ctx.moveTo(50, 150)

    var length = this.data.learned_word.toString().length
    // console.log(length)

    ctx.setFontSize(60)
    ctx.setFillStyle("#5ee2c9")
    //还需要对font-size进行转换
    ctx.fillText(this.data.learned_word.toString(), 120 - length / 2 * 60 * 0.6, 150)

    ctx.fill()

    ctx.draw()
  },

  onPrizeTap: function(event) {
    wx.navigateTo({
      url: 'prize/prize?level=' + this.data.level + '&flag=' + this.data.flag,
    })
  },

  onPlanTap: function(event) {
    wx.navigateTo({
      url: '../user/plan/plan',
    })
  },

  onStartTap: function(event) {
    console.log(event)
    wx.navigateTo({
      url: 'word/word?level=' + this.data.level,
    })
  },

  onJoinTap: function() {
    wx.navigateTo({
      url: '../word/word',
    })
  },

  onShareTap: function() {
    console.log("onShare")
    // wx.showShareMenu({
    //   withShareTicket: true
    // })
    // this.onShareAppMessage()
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
    // this.loadData()
    // this.onDrawProgress()
    this.setData({
      storage: wx.getStorageSync('currentPointer')
    })
  },

  onFeedsClick: function(event) {
    var id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: 'feed/feed?id=' + id,
    })
  },

  loadData: function(token) {
    wx.request({
      url: app.globalData.HOST + "/home/home_page_info.do",
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      success: (res) => {
        console.log(res.data)
        var data = res.data
        if (data.status == 200) {
          // console.log("in")
          let homeData = data.data
          let flag = homeData.flag
          let learned_word = homeData.learned_word
          let insist_days = homeData.insist_days
          let rest_days = homeData.rest_days
          let level = homeData.level
          let plan_number = homeData.plan_number
          let feeds = homeData.feeds
          let word_challenge_status = homeData.word_challenge_status

          wx.setStorage({
            key: 'word_challenge_status',
            data: word_challenge_status,
          })

          for (let i in feeds) {
            let comments = parseInt(feeds[i].comments)
            let likes = parseInt(feeds[i].likes)

            if (comments < 5) {
              comments = comments + Math.floor(Math.random() * 4) + Math.floor(Math.random() * 30 + 102)
            } else if (comments < 10) {
              comments = comments + Math.floor(Math.random() * 10 + 238)
            } else if (comments < 20) {
              comments = comments + Math.floor(Math.random() * 5) + Math.floor(Math.random() * 10 + 331)
            } else if (comments < 50) {
              comments = comments + Math.floor(Math.random() * 10 + 402)
            } else if (comments < 100) {
              comments = comments + Math.floor(Math.random() * 100 + 400)
            }

            feeds[i]['comments'] = comments

            if (likes < 5) {
              likes = likes + Math.floor(Math.random() * 10 + 109)
            } else if (likes < 10) {
              likes = likes + Math.floor(Math.random() * 20 + 170)
            } else if (likes < 20) {
              likes = likes + Math.floor(Math.random() * 15 + 280)
            } else if (likes < 40) {
              likes = likes + Math.floor(Math.random() * 30 + 309)
            } else if (likes < 100) {
              likes = likes + Math.floor(Math.random() * 100 + 300)
            }

            feeds[i]['likes'] = likes + likes
          }

          var portraits = homeData.head_user_portrait
          let whether_template = parseInt(homeData.whether_template)
          wx.setStorage({
            key: 'whether_template',
            data: whether_template,
          })

          this.setData({
            flag: flag,
            learned_word: learned_word,
            insist_days: insist_days,
            rest_days: rest_days,
            level: level,
            plan_number: plan_number,
            feeds: feeds,
            user_default_portrait_1: portraits[0],
            user_default_portrait_2: portraits[3],
            user_default_portrait_3: portraits[5],
            whether_reminder: parseInt(homeData.whether_reminder),
            word_challenge_status: parseInt(word_challenge_status)
          })
          if (flag == 1) {
            this.onDrawProgress()
            if (this.data.action != undefined && this.data.action != null) {
              console.log(this.data.action)
              switch (this.data.action) {
                case 'onStartTap':
                  if (parseInt(this.data.level) < 3) {
                    this.onStartTap()
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: '今天已经双倍完成任务了噢~',
                      showCancel: false
                    })
                  }
                  break
                case 'onFeedScroll':
                  setTimeout(() => {
                    wx.pageScrollTo({
                      scrollTop: 600,
                      duration: 800
                    })
                  }, 1000)
                  break
                default:
                  break
              }
              this.setData({
                action: ''
              })
            }
          } else {
            this.onPlanTap()
          }

        } else {
          if (data.status == 400 && data.msg == '身份认证错误！') {
            this.getToken()
          }
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
    // console.log(app.globalData.HOST + "/home/home_page_info.do")
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
                wx.setStorage({
                  key: 'token',
                  data: token,
                })
                app.globalData.token = token
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
                wx.setStorage({
                  key: 'token',
                  data: token,
                })
                app.globalData.token = token
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

  onCanvasTap: function(event) {
    wx.navigateTo({
      url: 'word_list/word_list',
    })
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
    // console.log("onRefresh");
    // this.setData({
    //   action: ''
    // })
    this.loadData(app.globalData.token)
    setTimeout(this.stopPullDownRefresh, 500)
  },

  stopPullDownRefresh: function() {
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
  onShareAppMessage: function(res) {
    console.log("onShare")
    if (res != undefined) {
      if (res.form != undefined) {
        if (res.form == 'button') {
          console.log(res.target)
        }
      }
    }

    if (this.data.level == 1) {
      this.doSignWork()
    }

    // console.log(res)
    return {
      title: '我正在背呗背单词赢奖品，快来跟我一起背~',
      path: '/pages/home/home',
      imageUrl: 'https://file.ourbeibei.com/l_e/common/brother.jpg',
    }
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
          this.setData({
            level: this.data.level + 1
          })
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  onCloseDialog: function(event) {
    this.setData({
      isShowDialog: false
    })

  },

  onMoneyTap: function(event) {
    this.setData({
      isShowDialog: true,
      alert_type: 1
    })
    setTimeout(this.onCloseDialog, 1500)
  },

  onEventTap: function(event) {
    this.setData({
      isShowDialog: true,
      alert_type: 2
    })
  },

  toWebView: function(event) {
    this.onCloseDialog()
    wx.navigateTo({
      url: '../discover/web/web',
    })
  },

  onFishTap: function(event) {
    this.setData({
      isShowDialog: true,
      alert_type: 3
    })
  },

  onSubmitAppoint: function(event) {
    this.onCloseDialog()
    //预约提醒
    let token = app.globalData.token
    let HOST = app.globalData.HOST
    wx.request({
      url: HOST + '/various/appointment_to_remind.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      success: (res) => {
        if (res.data.status == 200) {
          this.setData({
            whether_reminder: 1
          })
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  onPostChance: function(event) {
    // console.log(event.detail.formId)
    let form_id = event.detail.formId
    var token = app.globalData.token
    var HOST = app.globalData.HOST
    wx.request({
      url: HOST + '/various/collect_form_id.do',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': token
      },
      data: {
        form_id: form_id
      },
      success: (res) => {
        if (res.data.status == 200) {
          console.log("success")
        }
      },
      fail: (res) => {
        console.log(res)
      }
    })
  },

  stopPageScroll() {

  }
})