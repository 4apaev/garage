export type THead =
    | { get(k: string): string | null | undefined }
    | { 'content-type'?: string | null | undefined }

export const MIME: Record<string, string>

export function get(s: string): string | undefined
export function get(s: string, fallback: string): string

export function fromHead(ctx?: THead | null): string | undefined
export function fromHead(ctx: THead | null | undefined, fallback: string): string

export function fromPath(s: string | URL): string | undefined
export function fromPath(s: string | URL, fallback: string): string

export function extname(file: string | URL): string
export function is(expected: string, actual?: string | THead | null): boolean
