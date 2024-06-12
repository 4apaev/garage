import Fs from 'node:fs'
import { constants } from 'node:http2'
import fold from './util/fold.js'

export const MIME = Object.create(null)

export const CONF = fold(constants, '_')

export const {
    HTTP,
    HTTP2,
} = CONF

export const { STATUS } = HTTP
export const {
    HEADER,
    METHOD,
} = HTTP2

export default {
    METHOD,
    STATUS,
    HEADER,
    MIME,
}

;((it, typ) => {
    for (let x of it) {
        if (/-|\//.test(x))
            typ = MIME[ x ] = x
        else
            MIME[ x ] = MIME[ '.' + x ] = typ
    }
})(new Set(`
┌───────────────────────────────────┬───────┬───────────┬─────────┬──────────────┐
│ content-type                      │ ct    │ type      │ ctype   │              │
│ content-length                    │ cl    │ size      │ clength │              │
├───────────────────────────────────┼───────┼───────────┼─────────┘              │
│ multipart/form-data               │ form  │ multipart │                        │
│ application/x-www-form-urlencoded │ query │ urlenc    │                        │
├───────────────────────────────────┼───────┼───────────┼─────────┬─────┬────────┤
│ application/json                  │ map   │ json      │         │     │        │
│ application/javascript            │ js    │ mjs       │         │     │        │
│ application/octet-stream          │ bin   │ dmg       │ iso     │ img │ buffer │
│ application/zip                   │ zip   │ tar       │         │     │        │
├───────────────────────────────────┼───────┼───────────┴─────────┴─────┴────────┤
│ application/font-woff2            │ woff2 │                                    │
│ application/font-woff             │ woff  │                                    │
├───────────────────────────────────┼───────┼───────────┐                        │
│ application/x-font-bdf            │ bdf   │           │                        │
│ application/x-font-otf            │ otf   │           │                        │
│ application/x-font-pcf            │ pcf   │           │                        │
│ application/x-font-snf            │ snf   │           │                        │
│ application/x-font-ttf            │ ttf   │ ttc       │                        │
├───────────────────────────────────┼───────┼───────────┤                        │
│ image/gif                         │ gif   │           │                        │
│ image/jpeg                        │ jpg   │ jpeg      │                        │
│ image/png                         │ png   │           │                        │
│ image/svg+xml                     │ svg   │ svgz      │                        │
│ image/webp                        │ webp  │           │                        │
│ image/x-icon                      │ ico   │           │                        │
├───────────────────────────────────┼───────┼───────────┤                        │
│ text/css                          │ css   │           │                        │
│ text/csv                          │ csv   │           │                        │
├───────────────────────────────────┼───────┼───────────┤                        │
│ text/xml                          │ xml   │           │                        │
│ text/html                         │ html  │           │                        │
├───────────────────────────────────┼───────┼───────────┤                        │
│ text/jsx                          │ jsx   │           │                        │
│ text/less                         │ less  │           │                        │
│ text/yaml                         │ yml   │ yaml      │                        │
│ text/x-markdown                   │ md    │           │                        │
│ text/event-stream                 │ sse   │           │                        │
│ text/plain                        │ txt   │           │                        │
└───────────────────────────────────┴───────┴───────────┴────────────────────────┘
`.match(/[a-z-/]+/g)))

const path = import.meta.dirname + '/const.js'

console.log(path)

Fs.writeFileSync(path, JSON.stringify({  ...CONF, MIME }, 0, 4))

/*
    console.log('HEADER.ACCESS               ', HEADER.ACCESS)
    console.log('HEADER.ACCESS.CONTROL       ', HEADER.ACCESS.CONTROL)
    console.log('HEADER.ACCESS.CONTROL.ALLOW ', HEADER.ACCESS.CONTROL.ALLOW)

    console.log('ACCESS.CONTROL.ALLOW.CREDENTIALS ', HEADER.ACCESS.CONTROL.ALLOW.CREDENTIALS)
    console.log('ACCESS.CONTROL.ALLOW.HEADERS     ', HEADER.ACCESS.CONTROL.ALLOW.HEADERS)
    console.log('ACCESS.CONTROL.ALLOW.METHODS     ', HEADER.ACCESS.CONTROL.ALLOW.METHODS)
    console.log('ACCESS.CONTROL.ALLOW.ORIGIN      ', HEADER.ACCESS.CONTROL.ALLOW.ORIGIN)
    console.log('ACCESS.CONTROL.EXPOSE.HEADERS    ', HEADER.ACCESS.CONTROL.EXPOSE.HEADERS)
    console.log('ACCESS.CONTROL.MAX.AGE           ', HEADER.ACCESS.CONTROL.MAX.AGE)
    console.log('ACCESS.CONTROL.REQUEST.HEADERS   ', HEADER.ACCESS.CONTROL.REQUEST.HEADERS)
    console.log('ACCESS.CONTROL.REQUEST.METHOD    ', HEADER.ACCESS.CONTROL.REQUEST.METHOD)

    HEADERS:
        RESPONSE:
            ACCEPT                              : accept
            ACCEPT_CHARSET                      : accept_charset
            ACCEPT_ENCODING                     : accept_encoding
            ACCEPT_LANGUAGE                     : accept_language
            ACCEPT_RANGES                       : accept_ranges
            ACCESS_CONTROL_ALLOW_CREDENTIALS    : access_control_allow_credentials
            ACCESS_CONTROL_ALLOW_HEADERS        : access_control_allow_headers
            ACCESS_CONTROL_ALLOW_METHODS        : access_control_allow_methods
            ACCESS_CONTROL_ALLOW_ORIGIN         : access_control_allow_origin
            ACCESS_CONTROL_EXPOSE_HEADERS       : access_control_expose_headers
            ACCESS_CONTROL_MAX_AGE              : access_control_max_age
            ACCESS_CONTROL_REQUEST_HEADERS      : access_control_request_headers
            ACCESS_CONTROL_REQUEST_METHOD       : access_control_request_method
            AGE                                 : age
            ALLOW                               : allow
            AUTHORIZATION                       : authorization
            CACHE_CONTROL                       : cache_control
            CDN_CACHE_CONTROL                   : cdn_cache_control
            CONNECTION                          : connection
            CONTENT_DISPOSITION                 : content_disposition
            CONTENT_ENCODING                    : content_encoding
            CONTENT_LANGUAGE                    : content_language
            CONTENT_LENGTH                      : content_length
            CONTENT_LOCATION                    : content_location
            CONTENT_RANGE                       : content_range
            CONTENT_SECURITY_POLICY             : content_security_policy
            CONTENT_SECURITY_POLICY_REPORT_ONLY : content_security_policy_report_only
            COOKIE                              : cookie
            DAV                                 : dav
            DNT                                 : dnt
            DATE                                : date
            ETAG                                : etag
            EXPECT                              : expect
            EXPIRES                             : expires
            FORWARDED                           : forwarded
            FROM                                : from
            HOST                                : host
            IF_MATCH                            : if_match
            IF_MODIFIED_SINCE                   : if_modified_since
            IF_NONE_MATCH                       : if_none_match
            IF_RANGE                            : if_range
            IF_UNMODIFIED_SINCE                 : if_unmodified_since
            LAST_MODIFIED                       : last_modified
            LINK                                : link
            LOCATION                            : location
            MAX_FORWARDS                        : max_forwards
            ORIGIN                              : origin
            PRGAMA                              : prgama
            PROXY_AUTHENTICATE                  : proxy_authenticate
            PROXY_AUTHORIZATION                 : proxy_authorization
            PUBLIC_KEY_PINS                     : public_key_pins
            PUBLIC_KEY_PINS_REPORT_ONLY         : public_key_pins_report_only
            RANGE                               : range
            REFERER                             : referer
            REFERRER_POLICY                     : referrer_policy
            REFRESH                             : refresh
            RETRY_AFTER                         : retry_after
            SEC_WEBSOCKET_ACCEPT                : sec_websocket_accept
            SEC_WEBSOCKET_EXTENSIONS            : sec_websocket_extensions
            SEC_WEBSOCKET_KEY                   : sec_websocket_key
            SEC_WEBSOCKET_PROTOCOL              : sec_websocket_protocol
            SEC_WEBSOCKET_VERSION               : sec_websocket_version
            SERVER                              : server
            SET_COOKIE                          : set_cookie
            STRICT_TRANSPORT_SECURITY           : strict_transport_security
            TE                                  : te
            TRAILER                             : trailer
            TRANSFER_ENCODING                   : transfer_encoding
            USER_AGENT                          : user_agent
            UPGRADE                             : upgrade
            UPGRADE_INSECURE_REQUESTS           : upgrade_insecure_requests
            VARY                                : vary
            VIA                                 : via
            WARNING                             : warning
            WWW_AUTHENTICATE                    : www_authenticate
            X_CONTENT_TYPE_OPTIONS              : x_content_type_options
            X_DNS_PREFETCH_CONTROL              : x_dns_prefetch_control
            X_FRAME_OPTIONS                     : x_frame_options
            X_XSS_PROTECTION                    : x_xss_protection

        REQUEST:
            ACCEPT                              : accept
            ACCEPT_LANGUAGE                     : accept_language
            ACCEPT_PATCH                        : accept_patch
            ACCEPT_RANGES                       : accept_ranges
            ACCESS_CONTROL_ALLOW_CREDENTIALS    : access_control_allow_credentials
            ACCESS_CONTROL_ALLOW_HEADERS        : access_control_allow_headers
            ACCESS_CONTROL_ALLOW_METHODS        : access_control_allow_methods
            ACCESS_CONTROL_ALLOW_ORIGIN         : access_control_allow_origin
            ACCESS_CONTROL_EXPOSE_HEADERS       : access_control_expose_headers
            ACCESS_CONTROL_MAX_AGE              : access_control_max_age
            ACCESS_CONTROL_REQUEST_HEADERS      : access_control_request_headers
            ACCESS_CONTROL_REQUEST_METHOD       : access_control_request_method
            AGE                                 : age
            ALLOW                               : allow
            ALT_SVC                             : alt_svc
            AUTHORIZATION                       : authorization
            CACHE_CONTROL                       : cache_control
            CONNECTION                          : connection
            CONTENT_DISPOSITION                 : content_disposition
            CONTENT_ENCODING                    : content_encoding
            CONTENT_LANGUAGE                    : content_language
            CONTENT_LENGTH                      : content_length
            CONTENT_LOCATION                    : content_location
            CONTENT_RANGE                       : content_range
            CONTENT_TYPE                        : content_type
            COOKIE                              : cookie
            DATE                                : date
            ETAG                                : etag
            EXPECT                              : expect
            EXPIRES                             : expires
            FORWARDED                           : forwarded
            FROM                                : from
            HOST                                : host
            IF_MATCH                            : if_match
            IF_MODIFIED_SINCE                   : if_modified_since
            IF_NONE_MATCH                       : if_none_match
            IF_UNMODIFIED_SINCE                 : if_unmodified_since
            LAST_MODIFIED                       : last_modified
            LOCATION                            : location
            ORIGIN                              : origin
            PRAGMA                              : pragma
            PROXY_AUTHENTICATE                  : proxy_authenticate
            PROXY_AUTHORIZATION                 : proxy_authorization
            PUBLIC_KEY_PINS                     : public_key_pins
            RANGE                               : range
            REFERER                             : referer
            RETRY_AFTER                         : retry_after
            SEC_WEBSOCKET_ACCEPT                : sec_websocket_accept
            SEC_WEBSOCKET_EXTENSIONS            : sec_websocket_extensions
            SEC_WEBSOCKET_KEY                   : sec_websocket_key
            SEC_WEBSOCKET_PROTOCOL              : sec_websocket_protocol
            SEC_WEBSOCKET_VERSION               : sec_websocket_version
            SET_COOKIE                          : set_cookie
            STRICT_TRANSPORT_SECURITY           : strict_transport_security
            TK                                  : tk
            TRAILER                             : trailer
            TRANSFER_ENCODING                   : transfer_encoding
            UPGRADE                             : upgrade
            USER_AGENT                          : user_agent
            VARY                                : vary
            VIA                                 : via
            WARNING                             : warning
            WWW_AUTHENTICATE                    : www_authenticate

*/
