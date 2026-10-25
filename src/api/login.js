import request from '@/utils/request'
// export function getPicCode () {
//   return request.get('/captcha/image')
// }
export const getPicCode = () => {
  return request.get('/captcha/image')
}
export const getMsgCode = (captchaCode, captchaKey, mobile) => {
  return request.post('/captcha/sendSmsCaptcha', {
    form: {
      captchaCode,
      captchaKey,
      mobile
    }
  })
}
