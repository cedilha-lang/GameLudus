import Parser from "./frontend/parser.js";
import { createGlobalEnv } from "./runtime/environment.js";
import { evaluate } from "./runtime/interpreter.js";
import { loadTranslateFunction } from "./languages/translator.js";
const args = process.argv.slice(2);
const langArgs = args.filter(arg => arg.startsWith("--")).map(arg => arg.substring(2)); // Remove the "--" from the argument
async function repl() {
    const parser = new Parser(), env = createGlobalEnv();
    console.log("\nRepl v1.0");
    //  Load and apply each translation function in order if a language argument is provided
    const translators = [];
    if (langArgs.length > 0) {
        for (const lang of langArgs) {
            const translateFn = await loadTranslateFunction(lang);
            translators.push(translateFn);
        }
    }
    while (true) {
        let input = prompt("> ");
        // Check for user input or exit keyword.
        if (!input || input.includes("exit")) {
            process.exit(0);
        }
        // Applies the translation if the function is available
        for (const translate of translators) {
            input = translate(input);
        }
        const program = parser.produceAST(input), result = evaluate(program, env);
        console.log(result);
    }
}
repl();
