import js from '@eslint/js'
import rules from './eslint.rules.config.js'


export default [
    {
        rules: {
            ...js.configs.recommended.rules,
            ...rules,
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
                Buffer     : 'readonly',
            },
        },
    },
]
