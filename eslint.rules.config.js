
export const rules = {
/* * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
    * * * *     OFF       * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
 * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * */

    class_methods_use_this :   0,
    no_cond_assign         :   0,
    max_lines              : [ 0, { max: 256, skipComments: true }],
    max_statements         : [ 0, 10 ],
    max_nested_callbacks   : [ 0, 2  ],
    max_statements_per_line: [ 0, { max: 2 }],

/* * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
    * * * *    NOPE       * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
 * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * */

    no_unused_vars         : [ 0, {
        args             : 'after-used',
        // caughtErrors     : 'none',
        // argsIgnorePattern: '^_',
        // varsIgnorePattern: '^_',

    }],

    no_empty                        : [ 2, { allowEmptyCatch          : true }],
    no_extra_boolean_cast           : [ 2, { enforceForLogicalOperands: true }],
    no_multiple_empty_lines         : [ 2, { max: 1, maxEOF: 0, maxBOF: 0 }],
    no_var                          :   2,
    no_debugger                     :   2,
    no_lonely_if                    :   2,
    no_else_return                  :   2,
    no_return_await                 :   2,
    no_extra_label                  :   2,
    no_extra_bind                   :   2,
    no_useless_call                 :   2,
    no_useless_catch                :   2,
    no_useless_concat               :   2,
    no_useless_constructor          :   2,
    no_useless_computed_key         :   2,
    no_unused_private_class_members :   2,
    no_constant_binary_expression   :   2,
    no_unneeded_ternary             :   2,
    no_unreachable_loop             :   2,
    no_useless_rename               :   2,
    no_dupe_args                    :   2,
    no_dupe_keys                    :   2,
    no_duplicate_case               :   2,


/* * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
    * * * *     NOPE      * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
 * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * */

    block_scoped_var                :   2,
    func_name_matching              :   2,
    curly                           : [ 2, 'multi-or-nest', 'consistent' ],
    semi                            : [ 2, 'never'                       ],

    new_parens                      : [ 2, 'never'                       ],
    comma_dangle                    : [ 2, 'always-multiline'            ],
    multiline_ternary               : [ 2, 'always-multiline'            ],
    quote_props                     : [ 2, 'as-needed'                   ],
    arrow_body_style                : [ 2, 'as-needed'                   ],
    arrow_parens                    : [ 2, 'as-needed'                   ],
    comma_style                     : [ 2, 'last'                        ],
    eol_last                        : [ 2, 'always'                      ],
    one_var                         : [ 2,               { uninitialized             : 'always'                     }],
    camelcase                       : [ 2,               { properties                : 'never'                      }],
    space_infix_ops                 : [ 2,               { int32Hint                 : true                         }],
    object_shorthand                : [ 2, 'always',     { avoidExplicitReturnArrows : true                         }],
    lines_between_class_members     : [ 2, 'always',     { exceptAfterSingleLine     : true                         }],
    quotes                          : [ 2, 'single',     { allowTemplateLiterals     : true                         }],
    brace_style                     : [ 2, 'stroustrup', { allowSingleLine           : true                         }],
    getter_return                   : [ 2,               { allowImplicit             : true                         }],
    require_atomic_updates          : [ 2,               { allowProperties           : true                         }],
    prefer_arrow_callback           : [ 2,               { allowNamedFunctions       : true, allowUnboundThis: true }],

/* * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
    * * * *    SPACE      * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
 * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * */

    block_spacing                   :   2,
    space_in_parens                 :   2,
    func_call_spacing               :   2,
    template_curly_spacing          : [ 2, 'always'                                                                     ],
    space_before_function_paren     : [ 2,           { named: 'never', anonymous: 'always', asyncArrow: 'always'       }],
    computed_property_spacing       : [ 2, 'always', { enforceForClassMembers   : true                                 }],
    object_curly_spacing            : [ 2, 'always', { arraysInObjects          : false,    objectsInObjects: false    }],
    array_bracket_spacing           : [ 2, 'always', { arraysInArrays           : false,    objectsInArrays : false    }],
    comma_spacing                   : [ 2,           { after                    : true,     before          : false    }],
    key_spacing                     : [ 2,           { afterColon               : true,     beforeColon     : false    }],
    keyword_spacing                 : [ 2,           { after: true,       before: true,     overrides       : {
                                                                                                return: { after: true },
                                                                                                throw : { after: true },
                                                                                                case  : { after: true }}}],

/* * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
    * * * *      MAX      * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
 * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * */

    max_depth              : [ 2, 4  ],
    max_params             : [ 2, 4  ],
    max_lines_per_function : [ 2, { max: 64 , skipComments: true, skipBlankLines: true, IIFEs: true }],
    max_len                : [ 2, 128, 2, {
        ignoreStrings          : false,
        ignoreTemplateLiterals : false,
        ignoreRegExpLiterals   : true,
        ignoreComments         : true,
        ignoreUrls             : true,
    }],

/* * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
    * * * *    IMPORTS    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
 * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * */

    sort_imports: [ 2, {
        ignoreCase            : false,
        ignoreMemberSort      : true,
        allowSeparatedGroups  : true,
        ignoreDeclarationSort : true,
        memberSyntaxSortOrder : [ 'none', 'single', 'all', 'multiple' ],
    }],

/* * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
    * * * *    INDENT     * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
   * * * *               * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
  * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *
 * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * *    * * * */

    indent: [ 2, 4, {
        // ignoreComments            : true,
        StaticBlock         : { body: 2 },
        FunctionExpression  : { body: 1, parameters: 2 },
        FunctionDeclaration : { body: 1, parameters: 2 },
        VariableDeclarator  : { const: 2, var: 2, let: 1 },
        CallExpression      : { arguments: 1 },
        offsetTernaryExpressions  : false,
        flatTernaryExpressions    : true,
        ArrayExpression           : 1,
        ObjectExpression          : 1,
        MemberExpression          : 1,
        ImportDeclaration         : 1,
        outerIIFEBody             : 1,
        SwitchCase                : 1,
    }],
}

export function rename(ctx, a, b) {
    const mv = typeof a == 'function'
        ? a
        : k => k.replaceAll(a, b)

    return Object.entries(ctx).reduce((prev, [ next, val ]) => {
        prev[ mv(next) ] = val
        return prev
    }, {})
}

export default rules