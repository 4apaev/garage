import {
    Req,
    Res,
} from './garage.js'

export type Next      = () => Promise<unknown>
export type MWare     = (rq: Req, rs: Res, next?: Next) => Promise<unknown> | unknown
export type Validator = (rq: Req) => boolean