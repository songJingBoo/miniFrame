import Cookies from 'js-cookie'

const TokenKey = 'My-Token'

export function getToken () {
  return Cookies.get(TokenKey)
}
