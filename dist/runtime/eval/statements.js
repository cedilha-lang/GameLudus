import Environment from "../environment.js";
import { evaluate } from "../interpreter.js";
import { MK_NULL } from "../values.js";
import { eval_assignment } from "./expressions.js";


export function eval_program(program, env) {
    let lastEvaluated = MK_NULL();
    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env);
    }
    return lastEvaluated;
}
export function eval_var_declaration(declaration, env) {
    const value = evaluate(declaration.value, env);
    return env.declareVar(declaration.identifier, value, declaration.constant);
}
export function eval_func_declaration(declaration, env) {
    // Create new function scope
    const fn = { name: declaration.name, parameters: declaration.parameters, declarationEnv: env, body: declaration.body, type: "function" };
    return env.declareVar(declaration.name, fn, true);
}
export function eval_if_statement(declaration, env) {
    const test = evaluate(declaration.condition, env);
    if (test.value === true) {
        return eval_body(declaration.body, env);
    }
    else if (declaration.alternate) {
        return eval_body(declaration.alternate, env);
    }
    else {
        return MK_NULL();
    }
}
export function eval_for_statement(declaration, env) {
    env = new Environment(env);
    eval_var_declaration(declaration.init, env);
    let test = evaluate(declaration.condition, env);
    // If the loop did not start...
    if (test.value !== true) {
        return MK_NULL();
    }
    const outputs = [];
    while (test.value) {
        const result = eval_body(declaration.body, new Environment(env), false);
        //  eval loop count
        eval_assignment(declaration.update, env);
        //  Reevaluate the condition after the body's execution
        test = evaluate(declaration.condition, env);
    }
    return result;
}
export function eval_while_statement(declaration, env) {
    env = new Environment(env);
    let test = evaluate(declaration.condition, env);
    // If the loop did not start...
    if (test.value !== true) {
        return MK_NULL();
    }
    const outputs = [];
    while (test.value) {
        const result = eval_body(declaration.body, env, false);
    }
    return result;
}
export function eval_return_statement(statement, env) {
    const ret = statement.value ? evaluate(statement.value, env) : MK_NULL();
    return ret;
}
function eval_body(body, env, newEnv = true) {
    /*
      If newEnv is true, a new environment is created.
      This is useful for isolating variables (ensuring that changes made within the body of the code won't affect the external environment)
    */
    const scope = newEnv ? new Environment(env) : env;
    const outputs = [];
    let result = MK_NULL();
    // Evaluate each line of the if statement body in sequence
    for (const stmt of body) {
        result = evaluate(stmt, scope);
    }
    
    return result;
}
function isDisplayVal(val) {
    return (val &&
        typeof val === "object" &&
        val.print === true &&
        "value" in val);
}
