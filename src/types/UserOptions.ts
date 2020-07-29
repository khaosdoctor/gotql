import { Got as GotInstance } from 'got'

/**
 * @typedef {object} userOpts User Options
 * @prop {boolean} debug Sets debug mode on/off
 * @prop {number} errorStatusCode Default error code to send back to the user on error (defaults to 500)
 * @prop {headerObj} headers Custom headers to be sent along
 */
export type UserOptions = {
  errorStatusCode?: number,
  headers?: {
    [name: string]: string
  },
  gotInstance?: GotInstance
}
