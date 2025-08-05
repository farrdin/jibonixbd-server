import { ServerResponse } from 'http'
import { sendJson } from '.'

type TResponse<T> = {
  statusCode: number
  success: boolean
  message?: string
  token?: string
  data: T
}

export function sendResponse<T>(res: ServerResponse, data: TResponse<T>) {
  sendJson(res, data.statusCode, {
    success: data.success,
    message: data.message,
    statusCode: data.statusCode,
    token: data.token,
    data: data.data
  })
}
