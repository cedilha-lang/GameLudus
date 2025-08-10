import { eval_function } from './eval/expressions.js';
import { evaluate } from "./interpreter.js";
import { MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, MK_STRING, MK_ARRAY } from "./values.js";

export function createGlobalEnv() {
    const env = new Environment();
    // Creating Default Global Enviornment
    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);
    env.declareVar("null", MK_NULL(), true);
    // Defining native builtin methods
    env.declareVar("print", MK_NATIVE_FN((args) => {
        console.log(...args);

        return MK_NULL();
    }), true);
    /*
        env.declareVar("input", MK_NATIVE_FN((args) => {
            const fn_call = args[1] as FunctionVal;
    
            // function that asks for users input and processess it
            new Promise<string>((resolve) => {
                const read_input = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
    
                read_input.question([], (response: string) => {
                    resolve(response);
    
                    const numericResponse = parseFloat(response),
                        isNumber = !isNaN(numericResponse);
    
                    // Set the variable type based on the input (readline does not return type)
                    (args[0] as StringVal | NumberVal).value = isNumber ? numericResponse : response;
    
                    args[0].type = isNumber ? "number" : "string";  // Determine input type
    
                    //console.log(typeof(response)); // Returns a string anyway
    
                    // Call the fuction inside the arguments - works like an async function
                    eval_function(fn_call, []);
    
                    read_input.close();
                });
            });
    
            return MK_NULL();
        }), true);
        */
    //function to make nagative nums equals positive ones
    env.declareVar("abs", MK_NATIVE_FN((args) => {
        const arg = args[0].value;
        return MK_NUMBER(Math.abs(arg));
    }), true);
    //Round decimal numbers to nearest whole number
    env.declareVar("round", MK_NATIVE_FN((args) => {
        const val = args[0].value, decimal_places = args[1].value;
        //  JavaScript doesn't actually cut the numbers decimal places and it instead just stringifies it and formats it
        //  That is why I have to convert it into a float number back
        return MK_NUMBER(parseFloat(val.toFixed(decimal_places)));
    }), true);
    //  function to round decimal numbers to smaller whole number
    env.declareVar("floor", MK_NATIVE_FN((args) => {
        const arg = args[0].value;
        return MK_NUMBER(Math.floor(arg));
    }), true);
    //  Randomize number between user specified values
    env.declareVar("random", MK_NATIVE_FN((args) => {
        const minNum = args.shift().value, maxNum = args.shift().value;
        return MK_NUMBER(Math.random() * (maxNum - minNum + 1));
    }), true);
    //  Converts a string to a floating-point number
    env.declareVar("toNumber", MK_NATIVE_FN((args) => {
        const str = args.shift().value;
        return MK_NUMBER(parseFloat(str));
    }), true);
    //  Returns the number of milliseconds elapsed since the epoch
    env.declareVar("timeNow", MK_NATIVE_FN(() => MK_NUMBER(Date.now())), true);
    //  Delays
    env.declareVar("setTimeout", MK_NATIVE_FN((args) => {
        //track which timeouts are active, this way we can cancel them or check their status
        let active_timeouts = 0;
        const numberArgs = [];
        //  Calculate the number of functions present in setTimeout
        for (const l of args) {
            numberArgs.push(args.shift());
        }
        const time = args.shift(); // the amount of time the program will wait
        active_timeouts++;
        setTimeout(() => {
            for (let c = 0; c < numberArgs.length; c++) {
                eval_function(numberArgs[c], []); // No args can be present here, as none are able to be given.
            }
            active_timeouts--;
            if (active_timeouts == 0) {
                return;
            }
        }, time.value);
        return MK_NULL();
    }), true);
    //Returns the number of variables indexes
    env.declareVar("length", MK_NATIVE_FN((args) => {
        const arg = args.shift();
        switch (arg.type) {
            case "array":
                return MK_NUMBER(arg.values.length);
            case "object":
                return MK_NUMBER(arg.properties.size);
            case "string":
                return MK_NUMBER(arg.value.length);
            case "number":
                return MK_NUMBER(arg.value.toString().length); // Convert the number to a string and return its length
            default:
                throw new Error(`Cannot get length from ${arg.type}`);
        }
    }), true);
    // Declairs the 'replace' native function
    env.declareVar("replace", MK_NATIVE_FN((args) => {
        const variable = args.shift().value, old_str = args.shift().value, new_str = args.shift().value;
        return MK_STRING(variable.replace(old_str, new_str));
    }), true);
    env.declareVar("split", MK_NATIVE_FN((args) => {
        const string = args.shift().value, separator = args.shift().value;
        //console.log(typeof(string.split(separator).map(val => MK_STRING(val))))
        return MK_ARRAY(string.split(separator).map(val => MK_STRING(val)));
    }), true);
    //Native fn that joins array indexes together in to a string
    env.declareVar("join", MK_NATIVE_FN((args) => {
        const array = args.shift(), uniter = args.shift(), joined_str = array.values.map(val => {
            if (typeof val === "object" && val !== null && 'value' in val) {
                return String(val.value); // Uses the object's 'value' property
            }
            else {
                return String(val);
            }
        }).join(uniter.value);
        return MK_STRING(joined_str);
    }), true);
    env.declareVar("shift", MK_NATIVE_FN((args) => {
        const arg = args.shift().values;
        //The variable will have it's value redefined to the rest of the array
        args = arg.slice(1);
        //The function will return the removed value
        return MK_ARRAY(arg.shift());
    }), true);
    // Assicronously makes network requests to retrieve resources from a server
    env.declareVar("fetch", MK_NATIVE_FN((args) => {
        const fn_call = args[2];
        const URL = args[0].value;
        // Function that handles the asynchronous request
        fetch(URL)
            .then(async (response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Getting the response data
            const data = await response.json();
            // Transforming the response into an object that the system expects
            const result = new Map(Object.entries(data).map(([key, value]) => [key, value]));
            args[1].properties = result;
            args[1].type = "object";
            console.log(result);
            // If a callback function was provided, execute it
            eval_function(fn_call, []); // Executes the callback function synchronously
        })
            .catch(error => {
            console.error(`Error fetching data: ${error.message}`);
            eval_function(fn_call, []);
        });
        return MK_NULL(); // The operation is asynchronous, but execution continuous
    }), true);
    return env;
}
export default class Environment {
    constructor(parentENV) {
        const global = parentENV ? true : false;
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
    }
    declareVar(varname, value, constant) {
        if (this.variables.has(varname)) {
            throw new Error(`Cannot declare variable ${varname}. As it already is defined.`);
        }
        this.variables.set(varname, value);
        if (constant) {
            this.constants.add(varname);
        }
        return value;
    }
    isConstant(varname) {
        return this.resolve(varname).constants.has(varname);
    }
    mutate_or_lookup_obj(expr, value, property) {
        let previous_val;
        if (expr.object.kind === 'MemberExpr') {
            // Obtain the property expr.object from expr.object
            // Define value as undefined, because it will not be altered
            previous_val = this.mutate_or_lookup_obj(expr.object, undefined, expr.object.property);
        }
        else {
            // Resolves the variable name and gets the value from the environment
            const varname = expr.object.symbol, env = this.resolve(varname);
            previous_val = env.variables.get(varname);
        }
        switch (previous_val.type) {
            case "object": {
                const current_prop = expr.property.symbol, used_prop = property ? property.symbol : current_prop;
                if (value) {
                    previous_val.properties.set(used_prop, value);
                }
                if (current_prop) {
                    previous_val = previous_val.properties.get(current_prop);
                }
                return previous_val;
            }
            case "array": {
                // Evaluates an expression that can consist of both numbers and variables (array[0] and array[identifier])
                const runtime_value = evaluate(expr.property, this);
                if (runtime_value.type != "number") {
                    throw new Error(`Arrays don't have keys: ${expr.property}`);
                }
                const index = runtime_value.value;
                if (value) {
                    previous_val.values[index] = value;
                }
                return previous_val.values[index];
            }
            default:
                throw new Error(`Unable to lookup or mutate: ${previous_val.type}`);
        }
    }
    lookupVar(varname) {
        const env = this.resolve(varname);
        return env.variables.get(varname);
    }
    resolve(varname) {
        if (this.variables.has(varname)) {
            return this;
        }
        if (this.parent == undefined) {
            throw new Error(`Cannot resolve "${varname}". As it does not exist.`);
        }
        return this.parent.resolve(varname);
    }
}
