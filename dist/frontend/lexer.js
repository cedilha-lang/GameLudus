// https://github.com/tlaceby/guide-to-interpreters-series
// -----------------------------------------------------------
// ---------------          LEXER          -------------------
// ---  Responsible for producing tokens from the source   ---
// -----------------------------------------------------------
// Represents tokens that my language understands in parsing.
export var TokenType;
(function (TokenType) {
    // Literal Types
    TokenType[TokenType["Number"] = 0] = "Number";
    TokenType[TokenType["Identifier"] = 1] = "Identifier";
    TokenType[TokenType["String"] = 2] = "String";
    // Keywords
    TokenType[TokenType["Var"] = 3] = "Var";
    TokenType[TokenType["Const"] = 4] = "Const";
    TokenType[TokenType["Func"] = 5] = "Func";
    TokenType[TokenType["Return"] = 6] = "Return";
    TokenType[TokenType["If"] = 7] = "If";
    TokenType[TokenType["Elif"] = 8] = "Elif";
    TokenType[TokenType["Else"] = 9] = "Else";
    TokenType[TokenType["For"] = 10] = "For";
    TokenType[TokenType["While"] = 11] = "While";
    TokenType[TokenType["And"] = 12] = "And";
    TokenType[TokenType["Or"] = 13] = "Or";
    TokenType[TokenType["Break"] = 14] = "Break";
    TokenType[TokenType["Continue"] = 15] = "Continue";
    // Grouping * Operators
    TokenType[TokenType["BinaryOperator"] = 16] = "BinaryOperator";
    TokenType[TokenType["UnaryOperator"] = 17] = "UnaryOperator";
    TokenType[TokenType["AssignmentOperator"] = 18] = "AssignmentOperator";
    TokenType[TokenType["Equals"] = 19] = "Equals";
    TokenType[TokenType["Comma"] = 20] = "Comma";
    TokenType[TokenType["Dot"] = 21] = "Dot";
    TokenType[TokenType["Colon"] = 22] = "Colon";
    TokenType[TokenType["OpenParen"] = 23] = "OpenParen";
    TokenType[TokenType["CloseParen"] = 24] = "CloseParen";
    TokenType[TokenType["OpenBrace"] = 25] = "OpenBrace";
    TokenType[TokenType["CloseBrace"] = 26] = "CloseBrace";
    TokenType[TokenType["OpenBracket"] = 27] = "OpenBracket";
    TokenType[TokenType["CloseBracket"] = 28] = "CloseBracket";
    TokenType[TokenType["EOF"] = 29] = "EOF"; // signified the end of file
})(TokenType || (TokenType = {}));
//Constant lookup for keywords and known identifiers + symbols.
const KEYWORDS = {
    var: TokenType.Var,
    const: TokenType.Const,
    func: TokenType.Func,
    return: TokenType.Return,
    if: TokenType.If,
    elif: TokenType.Elif,
    else: TokenType.Else,
    for: TokenType.For,
    while: TokenType.While,
    and: TokenType.And,
    or: TokenType.Or,
    break: TokenType.Break,
    continue: TokenType.Continue
};
//Constant lookup for one character tokens
const CHAR_TOKENS = {
    "(": TokenType.OpenParen,
    ")": TokenType.CloseParen,
    "{": TokenType.OpenBrace,
    "}": TokenType.CloseBrace,
    "[": TokenType.OpenBracket,
    "]": TokenType.CloseBracket,
    // Handle Conditional & Assignment Tokens
    ".": TokenType.Dot,
    ":": TokenType.Colon,
    ",": TokenType.Comma,
};
//Returns true if the character is whitespace like -> [\s, \t]
//  \n isn't considered as it is used for the line counter
export function isSkippable(str) {
    return [" ", "\t", "\r", "\n"].includes(str);
}
// Returns a token of a given type and value
function token(value = "", type, raw = value) {
    return { value, type, raw };
}
function isBinaryOperatorContext(tokens) {
    if (tokens.length === 0) {
        return false;
    }
    const lastToken = tokens[tokens.length - 1].type;
    return (lastToken === TokenType.Number ||
        lastToken === TokenType.Identifier ||
        lastToken === TokenType.CloseParen ||
        lastToken === TokenType.UnaryOperator // If the operator is after a unary like "!", "-" and "+"
    );
}
/**
 * Given a string representing source code: Produce tokens and handles
 * possible unidentified characters.
 *
 * - Returns a array of tokens.
 * - Does not modify the incoming string.
 */
export function tokenize(sourceCode) {
    const tokens = [], src = sourceCode.split("");
    // produce tokens until the EOF is reached
    while (src.length > 0) {
        switch (true) {
            case CHAR_TOKENS[src[0]] !== undefined:
                tokens.push(token(src[0], CHAR_TOKENS[src[0]]));
                src.shift();
                break;
            case src[0] === "+":
                src.shift();
                if (String(src[0]) === '=') {
                    src.shift();
                    tokens.push(token("+=", TokenType.AssignmentOperator));
                }
                else {
                    if (isBinaryOperatorContext(tokens)) {
                        tokens.push(token("+", TokenType.BinaryOperator));
                    }
                    else {
                        tokens.push(token("+", TokenType.UnaryOperator));
                    }
                }
                break;
            case src[0] === "-":
                src.shift();
                if (String(src[0]) === '=') {
                    src.shift();
                    tokens.push(token("-=", TokenType.AssignmentOperator));
                }
                else {
                    if (isBinaryOperatorContext(tokens)) {
                        tokens.push(token("-", TokenType.BinaryOperator));
                    }
                    else {
                        tokens.push(token("-", TokenType.UnaryOperator));
                    }
                }
                break;
            case src[0] === "*":
                src.shift();
                if (String(src[0]) === '=') {
                    src.shift();
                    tokens.push(token("*=", TokenType.AssignmentOperator));
                }
                else {
                    tokens.push(token("*", TokenType.BinaryOperator));
                }
                break;
            case src[0] === "/":
                src.shift();
                if (String(src[0]) === '=') {
                    src.shift();
                    tokens.push(token("/=", TokenType.AssignmentOperator));
                }
                else {
                    tokens.push(token("/", TokenType.BinaryOperator));
                }
                break;
            case src[0] === "%":
                src.shift();
                if (String(src[0]) === '=') {
                    src.shift();
                    tokens.push(token("%=", TokenType.AssignmentOperator));
                }
                else {
                    tokens.push(token("%", TokenType.BinaryOperator));
                }
                break;
            case src[0] === "=":
                src.shift();
                if (src[0] === "=") {
                    src.shift();
                    tokens.push(token("==", TokenType.BinaryOperator));
                }
                else {
                    tokens.push(token("=", TokenType.Equals));
                }
                break;
            case src[0] === "!":
                src.shift();
                if (String(src[0]) === '=') {
                    src.shift();
                    tokens.push(token("!=", TokenType.BinaryOperator));
                }
                else {
                    tokens.push(token("!", TokenType.UnaryOperator));
                }
                break;
            case src[0] === ">":
                src.shift();
                if (String(src[0]) === "=") {
                    src.shift();
                    tokens.push(token(">=", TokenType.BinaryOperator));
                }
                else {
                    tokens.push(token(">", TokenType.BinaryOperator));
                }
                break;
            case src[0] === "<":
                src.shift();
                if (String(src[0]) === "=") {
                    src.shift();
                    tokens.push(token("<=", TokenType.BinaryOperator));
                }
                else {
                    tokens.push(token("<", TokenType.BinaryOperator));
                }
                break;
            //Handle strings with " and ' chars
            case src[0] === "'":
            case src[0] === '"':
                let str_content = "", raw_content = "";
                src.shift(); // Removes the initial delimiter 
                // all escapaple chars in strings "\n", "\r", "\t"
                let isEscaped = false;
                while (src.length > 0) {
                    const key = src.shift(); // Obtains the next character
                    raw_content += key; // Adds to raw content
                    if (key === "\\") {
                        isEscaped = !isEscaped;
                        if (isEscaped) {
                            continue; // Continues to next char
                        }
                    }
                    else if (key === '"' || key === "'") {
                        // Ends the str if it is not an escaped char
                        if (!isEscaped) {
                            break;
                        }
                        isEscaped = false; // Resets the escaped state
                    }
                    else if (isEscaped) {
                        isEscaped = false;
                        if (isSkippable(key)) {
                            str_content += isSkippable(key);
                            continue;
                        }
                        else {
                            str_content += `\\`;
                        }
                    }
                    str_content += key;
                }
                // Adds new string token.
                tokens.push(token(str_content, TokenType.String, raw_content.substring(0, raw_content.length - 1)));
                break;
            // Handle comment token
            // If the current character and the next one form a single line comment symbol
            case src[0] === '#': {
                // Ignore all characters until a newline is reached
                while (src.length > 0 && src[0] !== "\n") {
                    src.shift();
                }
                break;
            }
            // Handle numeric literals - Integers && float nums
            case /\d/.test(src[0]): {
                let num_val = src.shift(), full_stop = false;
                while (src.length > 0) {
                    // Check for decimal point
                    if (src[0] === "." && !full_stop) {
                        full_stop = true;
                        num_val += src.shift(); // Indicate that the value isn't null
                    }
                    // Check for digits
                    else if (/\d/.test(src[0])) {
                        num_val += src.shift();
                    }
                    // Break the loop
                    else {
                        break;
                    }
                }
                // append new numeric token.
                tokens.push(token(num_val, TokenType.Number));
                break;
            }
            // HANDLE MULTICHARACTER KEYWORDS, TOKENS, IDENTIFIERS ETC...
            case /[a-zA-Z_]/.test(src[0]): {
                let ident = "";
                while (src.length > 0 && /[a-zA-Z_]/.test(src[0])) {
                    ident += src.shift();
                }
                // CHECK FOR RESERVED KEYWORDS
                const reserved = KEYWORDS[ident];
                // If value is not undefined then the identifier is
                // reconized keyword
                // if reserved == 'number'?, the second value will be 'reserved', else, 'TokenType.Identifier'(user defined symbol)
                tokens.push(token(ident, (typeof reserved == "number") ? reserved : TokenType.Identifier));
                break;
            }
            case isSkippable(src[0]):
                // Skip uneeded chars.
                src.shift();
                break;
            default:
                // Handle unreconized characters.
                throw new Error(`Unreconized character found in source: ${src[0].charCodeAt(0)} - "${src[0]}"`);
        }
    }
    tokens.push(token("EndOfFile", TokenType.EOF));
    return tokens;
}
