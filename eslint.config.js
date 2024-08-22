import js from '@eslint/js'
import rules, { rename } from './eslint.rules.config.js'


export default [
    {
        rules: {
            ...js.configs.recommended.rules,
            ...rename(rules, '_', '-'),
        },

        files: [
            'index.js',
            'src/**/*.js',
            'test/**/*.js',
            'scripts/**/*.js',
            // 'eslint.rules.config.js',
            // 'eslint.config.js',
        ],
        ignores: [],
        languageOptions: {
            ecmaVersion   : 'latest',
            sourceType    : 'module',
            parserOptions : {},
            globals       : {
                URL        : 'readonly',
                fetch      : 'readonly',
                console    : 'readonly',
                process    : 'readonly',
                setTimeout : 'readonly',
                setInterval: 'readonly',
                Buffer     : 'readonly',
            },
        },
    },
]
