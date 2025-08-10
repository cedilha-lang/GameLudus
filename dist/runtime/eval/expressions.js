import Environment from "../environment.js";
import { evaluate } from "../interpreter.js";
import { MK_NULL, MK_NUMBER, MK_STRING, MK_BOOL, MK_OBJECT } from "../values.js";
//  Evaulate numeric / string / comparison opebrations with binary operators.
function eval_generic_binary_expr(lhs, rhs, operator) {
    let result;
    // avoid JavaScript's broken comparasions
    switch (operator) {
        case "or": {
            //  If the operation in the condition doesn't return true/false, there is something wrong
            if (lhs.type !== "boolean" || rhs.type !== "boolean") {
                return MK_BOOL(false);
            }
            return MK_BOOL(lhs.value || rhs.value);
        }
        case "and": {
            if (lhs.type !== "boolean" || rhs.type !== "boolean") {
                return MK_BOOL(false);
            }
            return MK_BOOL(lhs.value && rhs.value);
        }
        default: {
            if (lhs === undefined || rhs === undefined) {
                return MK_BOOL(false);
            }
            else {
                // Handle binary operators
                const expression = `lhs.value ${operator} rhs.value`;
                // JavaScript native function to process operators (handles division by zero)
                result = eval(expression);
            }
        }
    }
    return wrapResult(result);
}
export function eval_mathematical_binary_expr(binop, env) {
    const lhs = evaluate(binop.left, env), rhs = evaluate(binop.right, env);
    //  console.log(binop)
    return eval_generic_binary_expr(lhs, rhs, binop.operator);
}
export function eval_unary_expr(unop, env) {
    const arg = evaluate(unop.argument, env);
    // Handle unary operators
    const expression = `${unop.operator} arg.value`;
    const result = eval(expression);
    return wrapResult(result);
}
function wrapResult(result) {
    switch (typeof (result)) {
        case "number":
            return MK_NUMBER(result);
        case "string":
            return MK_STRING(result);
        case "boolean":
            return MK_BOOL(result);
        case "object":
            //  typeof() can also return "object" in some cases...
            return MK_OBJECT(new Map(Object.entries(result).map(([key, value]) => [key, value])));
        default:
            throw `Unhandled type in binary/assignment/unary expression: ${typeof (result)}`;
    }
}
export function eval_identifier(ident, env) {
    const val = env.lookupVar(ident.symbol);
    return val;
}
export function eval_assignment(node, env) {
    if (node.assigne.kind === "MemberExpr") {
        return eval_member_expr(env, node);
    }
    if (node.assigne.kind !== "Identifier") {
        throw new Error(`Invalid LHS inside assignment expr ${JSON.stringify(node.assigne)}`);
    }
    //  check if it is constant
    if (env.isConstant(node.assigne.symbol)) {
        throw new Error(`Cannot reasign to variable "${node.assigne.symbol}" as it was declared constant.`);
    }
    return eval_generic_binary_expr(evaluate(node.assigne, env), evaluate(node.value, env), node.operator);
}
export function eval_object_expr(obj, env) {
    const object = { properties: new Map(), type: "object" };
    for (const { key, value } of obj.properties) {
        /*
          Manipulates the const key by Locating it so it is defined as a value
        */
        const runtimeVal = (value == undefined) ? env.lookupVar(key) : evaluate(value, env);
        object.properties.set(key, runtimeVal);
    }
    return object;
}
export function eval_array_expr(obj, env) {
    const array = { values: [], type: "array" };
    for (const value of obj.values) {
        // Evaluates the array vals
        const runtimeVal = evaluate(value, env);
        array.values.push(runtimeVal);
    }
    return array;
}
export function eval_function(func, args) {
    const scope = new Environment(func.declarationEnv);
    // Create the variables for the parameters list
    for (let i = 0; i < func.parameters.length; i++) {
        // TODO check the bounds here
        // verify arity of function
        const varname = func.parameters[i];
        scope.declareVar(varname, args[i], false);
    }
    let result = MK_NULL();
    // Evaluate the function body line by line
    for (const stmt of func.body) {
        result = evaluate(stmt, scope);
    }
    return result;
}
export function eval_call_expr(expr, env) {
    const args = expr.args.map((arg) => evaluate(arg, env)), fn = evaluate(expr.caller, env);
    if (fn.type == "native-fn") {
        return fn.call(args, env);
    }
    if (fn.type == "function") {
        const func = fn;
        const scope = new Environment(func.declarationEnv);
        // Create the variables for the parameters list
        for (let i = 0; i < func.parameters.length; i++) {
            // TODO Check the bounds here.
            // verify arity of function
            const varname = func.parameters[i];
            scope.declareVar(varname, args[i], false);
        }
        let result = MK_NULL();
        // Evaluate the function body line by line
        for (const stmt of func.body) {
            result = evaluate(stmt, scope);
        }
        return result;
    }
    // Error if the call is not for a valid function
    throw new Error(`Unable to call a value that isn't a function: ${JSON.stringify(fn)}`);
}
export function eval_member_expr(env, node, expr) {
    if (expr) {
        return env.mutate_or_lookup_obj(expr);
    }
    if (node) {
        return env.mutate_or_lookup_obj(node.assigne, evaluate(node.value, env));
    }
    // Error if there is no member or assignment expression
    throw new Error(`Evaluating a member expression is not possible without a member or assignment expression.`);
}
