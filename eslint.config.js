import js               from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals          from 'globals'

const rules = {
    'class-methods-use-this': 0,
    'no-cond-assign'        : 0,
    'no-unused-vars'        : [ 0, { args: 'after-used', caughtErrors: 'none', argsIgnorePattern: '^-', varsIgnorePattern: '^-' }],
    'max-lines'             : [ 0, { max: 256, skipComments: true }],
    'max-statements'        : [ 0, 10 ],
    'max-lines-per-function': [ 0, {
        max           : 64,
        skipComments  : true,
        skipBlankLines: true,
        IIFEs         : true,
    }],
    'max-len': [ 0, 128, 2, {
        ignoreStrings         : false,
        ignoreTemplateLiterals: false,
        ignoreRegExpLiterals  : true,
        ignoreComments        : true,
        ignoreUrls            : true,
    }],

    'comma-spacing'  : [ 0, { after: true, before: false }],
    'no-multi-spaces': [ 0, { ignoreEOLComments: true, exceptions: { BinaryExpression: true, ImportDeclaration: true }}],

    'max-depth' : [ 2, 4 ],
    'max-params': [ 2, 4 ],

    'no-var'                         : 2,
    'no-lonely-if'                   : 2,
    'no-else-return'                 : 2,
    'no-return-await'                : 2,
    'no-extra-label'                 : 2,
    'no-extra-bind'                  : 2,
    'no-useless-call'                : 2,
    'no-useless-catch'               : 2,
    'no-useless-concat'              : 2,
    'no-useless-constructor'         : 2,
    'no-unused-private-class-members': 2,
    'no-useless-computed-key'        : 2,
    'no-unneeded-ternary'            : 2,
    'no-unreachable-loop'            : 2,
    'no-useless-rename'              : 2,
    'no-undef'                       : 2,
    'no-empty'                       : [ 2, { allowEmptyCatch: true }],
    'no-extra-boolean-cast'          : [ 2, { enforceForLogicalOperands: true }],
    'no-multiple-empty-lines'        : [ 2, { max: 1, maxEOF: 0, maxBOF: 0 }],

    'block-scoped-var'           : 2,
    'func-name-matching'         : 2,
    'comma-dangle'               : [ 2, 'always-multiline' ],
    'multiline-ternary'          : [ 2, 'always-multiline' ],
    'eol-last'                   : [ 2, 'always' ],
    'object-shorthand'           : [ 2, 'always', { avoidExplicitReturnArrows: true }],
    'lines-between-class-members': [ 2, 'always', { exceptAfterSingleLine: true }],

    'one-var'         : [ 2, { uninitialized: 'always' }],
    'brace-style'     : [ 2, 'stroustrup', { allowSingleLine: true }],
    'comma-style'     : [ 2, 'last' ],
    'arrow-body-style': [ 2, 'as-needed' ],
    'quote-props'     : [ 2, 'as-needed' ],
    'arrow-parens'    : [ 2, 'as-needed' ],

    'new-parens'     : [ 2, 'never' ],
    semi             : [ 2, 'never' ],
    curly            : [ 2, 'multi-or-nest', 'consistent' ],
    quotes           : [ 2, 'single', { allowTemplateLiterals: true }],
    camelcase        : [ 2, { properties: 'never' }],
    'space-infix-ops': [ 2, { int32Hint: true }],

    'getter-return'         : [ 2, { allowImplicit: true }],
    'require-atomic-updates': [ 2, { allowProperties: true }],
    'prefer-arrow-callback' : [ 2, { allowNamedFunctions: true, allowUnboundThis: true }],

    'sort-imports': [ 2, {
        ignoreCase           : false,
        ignoreMemberSort     : true,
        allowSeparatedGroups : true,
        ignoreDeclarationSort: true,
        memberSyntaxSortOrder: [ 'none', 'single', 'all', 'multiple' ],
    }],

    indent: [ 2, 4, {
        StaticBlock             : { body: 1 },
        FunctionExpression      : { body: 1, parameters: 2 },
        FunctionDeclaration     : { body: 1, parameters: 2 },
        VariableDeclarator      : { const: 2, var: 2, let: 1 },
        CallExpression          : { arguments: 1 },
        offsetTernaryExpressions: false,
        flatTernaryExpressions  : true,
        ArrayExpression         : 1,
        ObjectExpression        : 1,
        MemberExpression        : 1,
        ImportDeclaration       : 1,
        outerIIFEBody           : 1,
        SwitchCase              : 1,
    }],

    'space-in-parens'       : 2,
    'block-spacing'         : 2,
    'func-call-spacing'     : 2,
    'generator-star-spacing': [ 2, {
        after : true,
        before: true,
        method: {
            after : true,
            before: true,
        },
    }],

    'key-spacing'                : [ 2, { afterColon: true, beforeColon: false, align: 'colon' }],
    'keyword-spacing'            : [ 2, { after: true, before: true, overrides: { return: { after: true }, throw: { after: true }, case: { after: true }}}],
    'space-before-function-paren': [ 2, { named: 'never', anonymous: 'always', asyncArrow: 'always' }],
    'template-curly-spacing'     : [ 2, 'always' ],
    'computed-property-spacing'  : [ 2, 'always', { enforceForClassMembers: true }],

    'object-curly-spacing' : [ 2, 'always', { arraysInObjects: false, objectsInObjects: false }],
    'array-bracket-spacing': [ 2, 'always', { arraysInArrays: false, objectsInArrays: false }],
}

export default defineConfig([
    {
        rules,
        plugins: { js },
        extends: ['js/recommended'],
        files  : [ 'src/**/*.js', 'test/**/*.js' ],
        languageOptions: { globals: globals.node },
    },
])
