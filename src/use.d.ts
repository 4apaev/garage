import type { MWare } from './types.js'

export type Method =
    | 'GET'
    | 'COPY'
    | 'PUT'
    | 'PATCH'
    | 'UPDATE'
    | 'POST'
    | 'MERGE'
    | 'DELETE'
    | 'MOVE'
    | 'HEAD'
    | 'OPTIONS'
    | 'TRACE'
    | 'SEARCH'
    | 'BIND'
    | 'UNBIND'
    | 'LINK'
    | 'UNLINK'

export type MethodName = Method | Uppercase<Method>
export type Pattern = string
export type Filter = MethodName | Pattern
export type UseArg = Filter | MWare
export type ArgsWithHandler<T extends readonly UseArg[]> =
    T extends readonly [ infer Head, ...infer Tail ]
        ? Head extends MWare
            ? T
            : Head extends Filter
                ? readonly [ Head, ...ArgsWithHandler<Extract<Tail, readonly UseArg[]>> ]
                : never
        : never

export function use(...f: MWare[]): MWare
export function use(method: MethodName, ...f: MWare[]): MWare
export function use(method: MethodName, pattern: string, ...f: MWare[]): MWare
export function use(pattern: string, ...f: MWare[]): MWare

export default function use<const T extends readonly UseArg[]>(
    ...args: T & ArgsWithHandler<T>
): MWare


