//@ts-check

import { it, describe } from 'node:test'
import {
    deepEqual as Equal,
    strictEqual as equal,
} from 'node:assert'

import Qurl from '../src/util/qurl.js'

const BASE = 'http://shoshi.dog'

describe('QURL', () => {

    it('should update path', () => {
        const u = new Qurl('/api/one?a=1&b=2', BASE)
        equal(u.path, '/api/one')
        equal(u.search, '?a=1&b=2')

        u.path = '/api/two'
        equal(u.path, '/api/two')
        equal(u.search, '', 'should reset search: u.search === ""')
    })

    it('should update query', () => {
        const u = new Qurl('/api/one?a=1&b=2', BASE)
        Equal(u.query, { a: 1, b: 2 }, 'should return query object: u.quert === { a: 1, b: 2 }')

        u.query = { c: 3, d: 4 }
        Equal(u.query, { a: 1, b: 2, c: 3, d: 4 })
    })

    it('should update query with array', () => {
        const u = new Qurl('/api/one?a=1&b=2', BASE)
        Equal(u.query, { a: 1, b: 2 })

        u.query = { a: 3, b: 4 }
        Equal(u.query, { a: [ 1, 3 ], b: [ 2, 4 ]})
    })

    it('should update query with array 2', () => {
        const u = new Qurl('/api/one?a=1&a=3&b=2&b=4', BASE)
        Equal(u.query, { a: [ 1, 3 ], b: [ 2, 4 ]})

        u.query = { a: 5, b: 6 }
        Equal(u.query, { a: [ 1, 3, 5 ], b: [ 2, 4, 6 ]})
    })

})
