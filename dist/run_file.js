import Parser from "./frontend/parser.js";
import { createGlobalEnv } from "./runtime/environment.js";
import { evaluate } from "./runtime/interpreter.js";
import fs from "fs";
export async function run(filePath) {
    const parser = new Parser();
    const env = createGlobalEnv();
    const input = fs.readFileSync(filePath, "utf-8");
    const program = parser.produceAST(input);
    const result = evaluate(program, env);

    return result;
}

