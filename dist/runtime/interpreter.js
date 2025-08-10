import { MK_NULL } from "./values.js";
import { eval_func_declaration, eval_if_statement, eval_program, eval_var_declaration, eval_return_statement, eval_for_statement, eval_while_statement } from "./eval/statements.js";
import { eval_array_expr, eval_assignment, eval_mathematical_binary_expr, eval_call_expr, eval_identifier, eval_member_expr, eval_object_expr, eval_unary_expr } from "./eval/expressions.js";
export function evaluate(astNode, env) {
    switch (astNode.kind) {
        case "NumericLiteral":
            return { value: (astNode.value), type: "number", };
        case "StringLiteral":
            return { value: (astNode.value), type: "string" };
        case "Identifier":
            return eval_identifier(astNode, env);
        case "ObjectLiteral":
            return eval_object_expr(astNode, env);
        case "ArrayLiteral":
            return eval_array_expr(astNode, env);
        case "CallExpr":
            return eval_call_expr(astNode, env);
        case "AssignmentExpr":
            return eval_assignment(astNode, env);
        case "BinaryExpr":
            return eval_mathematical_binary_expr(astNode, env);
        case "UnaryExpr":
            return eval_unary_expr(astNode, env);
        case "Program":
            return eval_program(astNode, env);
        case "MemberExpr":
            return eval_member_expr(env, undefined, astNode);
        //Handle statements
        case "VarDeclaration":
            return eval_var_declaration(astNode, env);
        case "FuncDeclaration":
            return eval_func_declaration(astNode, env);
        case "IfStmt":
            return eval_if_statement(astNode, env);
        case "ForStmt":
            return eval_for_statement(astNode, env);
        case "WhileStmt":
            return eval_while_statement(astNode, env);
        case "ReturnStmt":
            return eval_return_statement(astNode, env);
        case "BreakStmt":
            return MK_NULL();
        case "ContinueStmt":
            return MK_NULL();
        // Handle unimplimented ast types as error.
        default:
            throw new Error(`This AST Node has not yet been setup for interpretation. ${astNode}`);
    }
}
