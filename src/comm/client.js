import wepy from 'wepy'
import net from './net'

const API_BASE = 'https://api.lyricwei.cn'
// const API_BASE = 'https://dev.lyricwei.cn'

export default class Client {
  async wxLogin (opts) {
    let loginInfo = await wepy.login()
    return new Promise((resolve, reject) => {
      if (loginInfo.code) {
        let payload = {
          code: loginInfo.code
        }
        if (opts && opts.fullname) {
          payload.fullname = opts.fullname
          payload.avatar = opts.avatar
        }
        // Send code to fox one server
        net.request({
          method: 'POST',
          url: API_BASE + '/api/account/login_wechat',
          data: payload
        }).then((res) => {
          if (res && res.code === 0) {
            wx.setStorageSync('token', res.data.token)
            wx.setStorageSync('fxUserInfo', res.data.user)
            resolve(res)
          } else {
            reject(res)
          }
        }).catch((err) => {
          reject(err)
        })
      } else {
        console.log('Failed to login')
        reject(loginInfo)
      }
    })
  }
  async getUserInfo () {
    let settings = await wepy.getSetting()
    if (settings.authSetting['scope.userInfo']) {
      // 已经授权，可以直接调用 getUserInfo 获取头像昵称
      return await wepy.getUserInfo()
    }
    return null
  }
  async fxLogin (opts) {
    return new Promise((resolve, reject) => {
      // Send code to fox one server
      net.request({
        method: 'POST',
        url: API_BASE + '/api/account/login_request',
        data: {
          tel: opts.phone
        }
      }).then((res) => {
        if (res && res.code === 0) {
          wx.setStorageSync('fxUserInfo', res.data.user)
          resolve(res)
        } else {
          reject(res)
        }
      }).catch((err) => {
        console.log('err', err)
        reject(err)
      })
    })
  }
  async fxLoginCode (opts) {
    let loginInfo = await wepy.login()
    return new Promise((resolve, reject) => {
      // Send code to fox one server
      net.request({
        method: 'POST',
        url: API_BASE + '/api/account/login_code',
        data: {
          tel: opts.phone,
          validationCode: opts.code, // sms code
          validationType: 3, // for wechat based phone login
          weixin: { 
            code: loginInfo.code, // code from wx.login
            nickName: opts.nickName, // nickname
            avatar: opts.avatar // nickname
          }
        }
      }).then((res) => {
        if (res && res.code === 0) {
          wx.setStorageSync('token', res.data.token)
          wx.setStorageSync('fxUserInfo', res.data.user)
          resolve(res)
        } else {
          reject(res)
        }
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async createPacket (opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'POST',
        url: API_BASE + '/api/luckycoin/create',
        pin: opts.pin,
        data: {
          assetId: opts.assetId,
          assetSymbol: opts.assetSymbol,
          assetLogo: opts.assetLogo,
          amount: opts.amount,
          count: opts.count,
          packetType: opts.packetType,
          message: opts.message
        }
      }).then((res) => {
        if (res && res.code === 0) {
          resolve(res)
        } else {
          reject(res)
        }
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async publishPacket (opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'POST',
        url: API_BASE + `/api/luckycoin/publish/${opts.packetId}?uuid=${opts.uuid}`,
        data: {
          formId: opts.formId
        },
        pin: opts.pin
      }).then((res) => {
        if (res && res.code === 0) {
          resolve(res)
        } else {
          reject(res)
        }
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async drawPacket (opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'POST',
        url: API_BASE + `/api/luckycoin/draw/${opts.packetId}`,
        data: {'uuid': opts.uuid}
      }).then((res) => {
        if (res && res.code === 0) {
          resolve(res)
        } else {
          reject(res)
        }
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async getPacketDetail (opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'GET',
        url: API_BASE + `/api/luckycoin/detail/${opts.packetId}?uuid=${opts.uuid}`,
        data: {}
      }).then((res) => {
        if (res && res.code === 0) {
          resolve(res)
        } else {
          reject(res)
        }
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async getPacketRecord(opts) {
    let url = API_BASE + `/api/luckycoin/records/${opts.packetId}?uuid=${opts.uuid}`
    if (opts.cursor) {
      url = url + `&cursor=${opts.cursor}`
    }
    return new Promise((resolve, reject) => {
      net.request({
        method: 'GET',
        url: url,
        data: {}
      }).then((res) => {
        if (res && res.code === 0) {
          resolve(res)
        } else {
          reject(res)
        }
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async getCoinAssets(opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'GET',
        url: API_BASE + '/api/market/coin/wallet-assets'
      }).then((res) => {
        resolve(res)
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async getAssets(opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'GET',
        url: API_BASE + '/api/wallet/assets'
      }).then((res) => {
        resolve(res)
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async getAsset(opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'GET',
        url: API_BASE + '/api/wallet/assets/' + opts.assetId
      }).then((res) => {
        resolve(res)
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async getMyRecords(opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'GET',
        url: API_BASE + '/api/luckycoin/received'
      }).then((res) => {
        resolve(res)
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async getMyPackets(opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'GET',
        url: API_BASE + '/api/luckycoin/mine'
      }).then((res) => {
        resolve(res)
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
  async modifyPin(opts) {
    return new Promise((resolve, reject) => {
      net.request({
        method: 'PUT',
        url: API_BASE + '/api/account/pin',
        data: {
          newPin: opts.newPin,
          pin: opts.pin,
          pinType: opts.pinType
        }
      }).then((res) => {
        resolve(res)
      }).catch((err) => {
        console.log(err)
        reject(err)
      })
    })
  }
}