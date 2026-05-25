import type { MWare } from './types.js'

export function composeProd(mware: MWare[]): MWare
export function composeDev(...middleware: Array<MWare | MWare[]>): MWare

export default composeDev