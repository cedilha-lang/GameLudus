import { tokenize, TokenType } from "./lexer.js";
//Frontend for producing a valid AST from sourcode
export default class Parser {
    constructor() {
        this.tokens = [];
    }
    /**
     * Returns the currently available token
     */
    at() {
        return this.tokens[0];
    }
    /**
     * Returns the previous token and then advances the tokens array to the next value.
     */
    eat() {
        const prev = this.tokens.shift();
        return prev;
    }
    /**
    * Returns the previous token and then advances the tokens array to the next value.
    *  Also checks the type of expected token and throws if the values dnot match.
    */
    expect(type, err) {
        const prev = this.tokens.shift();
        if (!prev || prev.type !== type) {
            throw new Error(`${err} ${JSON.stringify(prev)} - Expecting: ${type}`);
        }
        return prev;
    }
    produceAST(sourceCode) {
        this.tokens = tokenize(sourceCode);
        const program = {
            kind: "Program",
            body: [],
        };
        //parse until end of file
        while (this.at().type !== TokenType.EOF) {
            program.body.push(this.parse_stmt());
        }
        return program;
    }
    // Handle complex statement types
    parse_stmt() {
        //skip to parse_expr
        switch (this.at().type) {
            case TokenType.Var:
            case TokenType.Const:
                return this.parse_var_declaration();
            case TokenType.Func:
                return this.parse_func_declaration();
            case TokenType.For:
                return this.parse_for_statement();
            case TokenType.While:
                return this.parse_while_statement();
            case TokenType.If:
                return this.parse_if_statement();
            case TokenType.Return:
                return this.parse_return_statement();
            case TokenType.Break:
                return this.parse_break_statement();
            case TokenType.Continue:
                return this.parse_continue_statement();
            default:
                return this.parse_expr();
        }
    }
    parse_block_statement() {
        this.expect(TokenType.OpenBrace, "Expected opening brace for code block.");
        // Initialize an array to hold statements in the block
        const body = [];
        while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace) {
            const stmt = this.parse_stmt();
            body.push(stmt);
        }
        this.expect(TokenType.CloseBrace, "Expected closing brace for code block.");
        return body;
    }
    parse_for_statement() {
        this.eat(); // eat the "for" keyword
        this.expect(TokenType.OpenParen, "Expected opening parenthesis following \"for\" loop.");
        const init = this.parse_var_declaration();
        this.expect(TokenType.Comma, "Expected comma following variable declaration in \"for\" loop.");
        const condition = this.parse_expr();
        this.expect(TokenType.Comma, "Expected comma following the condition in \"for\" loop.");
        const update = this.parse_expr();
        this.expect(TokenType.CloseParen, "Expected closing parenthesis following \"additive assignment expression\" in \"for\" loop.");
        const body = this.parse_block_statement();
        return { kind: 'ForStmt', init, condition, update, body };
    }
    parse_while_statement() {
        this.eat(); // eat the "while" keyword
        this.expect(TokenType.OpenParen, "Expected opening parenthesis following \"while\" loop.");
        const condition = this.parse_expr();
        this.expect(TokenType.CloseParen, "Expected closing parenthesis following \"additive assignment expression\" in \"for\" loop.");
        const body = this.parse_block_statement();
        return { kind: 'WhileStmt', condition, body };
    }
    parse_if_statement() {
        this.eat(); // eat if keyword
        this.expect(TokenType.OpenParen, "Expected Open Parenthesis following \"if\" statement.");
        // Parse the condition expression for the if statement
        const condition = this.parse_expr();
        this.expect(TokenType.CloseParen, "Expected closing parenthesis following \"if\" statement.");
        // Parse the block of statements that follow the if condition
        const body = this.parse_block_statement();
        // Initialize an array for alternate statements (elif/else)
        let alternate = [];
        // It is possible to have both elif and else
        if (this.at().type === TokenType.Elif) {
            alternate = [this.parse_if_statement()];
        }
        if (this.at().type === TokenType.Else) {
            this.eat(); // eat "else"
            alternate = this.parse_block_statement();
        }
        return { kind: 'IfStmt', body, condition, alternate };
    }
    parse_func_declaration() {
        this.eat(); // eat function keyword
        const name = this.expect(TokenType.Identifier, "Expected function name following \"func\" keyword").value;
        const args = this.parse_args(), params = [];
        // Validate each argument and collect parameter names
        for (const arg of args) {
            if (arg.kind !== "Identifier") {
                // console.log(arg);
                throw new Error("Arguments inside function declaration must be of type string.");
            }
            params.push(arg.symbol);
        }
        const body = this.parse_block_statement();
        return { body, name, parameters: params, kind: "FuncDeclaration" };
    }
    // VAR IDENT;
    // ( VAR | CONST ) IDENT = EXPR;
    parse_var_declaration() {
        const isConstant = this.eat().type === TokenType.Const, identifier = this.expect(TokenType.Identifier, "Expected identifier name following \"var\" or \"const\" keywords.").value;
        this.expect(TokenType.Equals, "No value provided. Must use equals operator in variable declaration.");
        return { kind: "VarDeclaration", value: this.parse_expr(), identifier, constant: isConstant };
    }
    parse_return_statement() {
        this.eat(); //return
        this.expect(TokenType.OpenParen, "Expected Open Parenthesis following \"return\" statement.");
        const expr = this.parse_expr();
        this.expect(TokenType.CloseParen, "Expected closing parenthesis following \"return\" statement.");
        return { kind: "ReturnStmt", value: expr };
    }
    parse_break_statement() {
        this.eat();
        return { kind: "BreakStmt" };
    }
    parse_continue_statement() {
        this.eat();
        return { kind: "ContinueStmt" };
    }
    // Handle expressions
    parse_expr() {
        return this.parse_assignment_expr();
    }
    parse_assignment_expr() {
        let left = this.parse_and_or_expr();
        while (["=", "+=", "-=", "*=", "/=", "%="].includes(this.at().value)) {
            const operator = this.eat().value; //Advance past operator
            const right = this.parse_assignment_expr();
            left = {
                kind: "AssignmentExpr",
                assigne: left,
                value: right,
                operator
            };
        }
        return left;
    }
    /*
       function will continue to parse expressions and combine them using "and" or "or" operators as long as it encounters these operators.
       Allows the parser to handle expressions with more than two logical operators.
    */
    parse_and_or_expr() {
        let expr = this.parse_comparative_expr();
        while (["and", "or"].includes(this.at().value)) {
            const operator = this.eat().value;
            const right = this.parse_comparative_expr();
            expr = { kind: "BinaryExpr", left: expr, right, operator };
        }
        return expr;
    }
    parse_comparative_expr() {
        let left = this.parse_additive_expr();
        while (["==", "!=", "<", ">", "<=", ">="].includes(this.at().value)) {
            const operator = this.eat().value;
            const right = this.parse_additive_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            };
        }
        return left;
    }
    // Handle Addition & Subtraction Operations
    parse_additive_expr() {
        let left = this.parse_multiplicative_expr();
        while (["+", "-"].includes(this.at().value)) {
            const operator = this.eat().value;
            const right = this.parse_multiplicative_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            };
        }
        return left;
    }
    // Handle Multiplication, Division & Modulo Operations
    parse_multiplicative_expr() {
        let left = this.parse_object_expr();
        while (["/", "*", "%"].includes(this.at().value)) {
            const operator = this.eat().value;
            const right = this.parse_unary_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator
            };
        }
        return left;
    }
    parse_object_expr() {
        if (this.at().type !== TokenType.OpenBrace) {
            return this.parse_array_expr();
        }
        this.eat(); // advance past open brace.
        const properties = new Array();
        while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace) {
            const key = this.expect(TokenType.Identifier, "Object literal key exprected").value;
            // Allows shorthand key: pair -> { key, }
            if (this.at().type === TokenType.Comma) {
                this.eat(); // advance past comma
                properties.push({ key, kind: "Property" });
                continue;
            }
            // Allows shorthand key: pair -> { key }
            else if (this.at().type === TokenType.CloseBrace) {
                properties.push({ key, kind: "Property" });
                continue;
            }
            // { key: val }
            this.expect(TokenType.Colon, "Missing Colon following identifier in ObjectExpr");
            const value = this.parse_expr();
            properties.push({ kind: "Property", value, key });
            if (this.at().type !== TokenType.CloseBrace) {
                this.expect(TokenType.Comma, "Expected Comma or closing bracket following property");
            }
        }
        this.expect(TokenType.CloseBrace, "Object literal missing Closing Brace.");
        return { kind: "ObjectLiteral", properties };
    }
    //Handle arrays
    parse_array_expr() {
        // { Prop[] }
        if (this.at().type !== TokenType.OpenBracket) {
            //return this.parse_and_or_expr();
            return this.parse_unary_expr();
        }
        this.eat(); // eat the opening bracket and advance past it
        //Can contein more than one value
        const values = new Array();
        while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBracket) {
            values.push(this.parse_expr());
            if (this.at().type !== TokenType.CloseBracket) {
                this.expect(TokenType.Comma, "Missing Comma or Closing Bracket after \"values\" in array.");
            }
        }
        this.expect(TokenType.CloseBracket, "Unexpected token found in array expression. Expected Closing Bracket."); // closing bracket
        return { kind: "ArrayLiteral", values };
    }
    // Handle not(!) Operations and other unary operators
    parse_unary_expr() {
        if (["!", "-", "+"].includes(this.at().value)) {
            const operator = this.eat().value;
            const argument = this.parse_unary_expr(); // Recursively parse the operand
            return {
                kind: "UnaryExpr",
                argument,
                operator
            };
        }
        return this.parse_call_member_expr(); // If no unary operator, parse as usual
    }
    // foo.x()()
    parse_call_member_expr() {
        const member = this.parse_member_expr();
        if (this.at().type === TokenType.OpenParen) {
            return this.parse_call_expr(member);
        }
        return member;
    }
    parse_call_expr(caller) {
        let call_expr = {
            kind: "CallExpr",
            caller,
            args: this.parse_args()
        };
        if (this.at().type === TokenType.OpenParen) {
            call_expr = this.parse_call_expr(call_expr);
        }
        return call_expr;
    }
    parse_args() {
        this.expect(TokenType.OpenParen, "Expected Open Parenthesis");
        const args = this.at().type === TokenType.CloseParen ? [] : this.parse_args_list();
        this.expect(TokenType.CloseParen, "Missing closing parenthesis inside arguments list");
        return args;
    }
    parse_args_list() {
        const args = [this.parse_assignment_expr()];
        while (this.at().type === TokenType.Comma && this.eat()) {
            args.push(this.parse_assignment_expr());
        }
        return args;
    }
    parse_member_expr() {
        let object = this.parse_primary_expr();
        while (this.at().type === TokenType.Dot || this.at().type === TokenType.OpenBracket) {
            const operator = this.eat();
            let property, computed;
            // non-computed values (obj.expr)
            if (operator.type === TokenType.Dot) {
                computed = false;
                // get identifier
                property = this.parse_primary_expr();
                if (property.kind !== "Identifier") {
                    throw new Error(`Cannot use Dot operator without right hand side being an identifier`);
                }
            }
            else { // this allows obj[computedValue]
                computed = true;
                property = this.parse_expr();
                this.expect(TokenType.CloseBracket, "Missing closing bracket in computed value.");
            }
            object = { kind: "MemberExpr", object, property, computed };
        }
        return object;
    }
    //Orders of prescidence:
    // Assignment
    // Logical
    // AdditiveExpr
    // MultiplicativeExpr
    // Object
    // Array
    // Unary
    // CallMember
    // Call
    // Args
    // ArgsList
    // Member
    // PrimaryExpr
    // Parse Literal Values & Grouping Expressions
    parse_primary_expr() {
        const tk = this.at().type;
        // Determine which token we are currently at and return literal value
        switch (tk) {
            // User defined values.
            case TokenType.Identifier:
                return { kind: "Identifier", symbol: this.eat().value };
            // Constants and Numeric Constants
            case TokenType.Number:
                return {
                    kind: "NumericLiteral",
                    value: parseFloat(this.eat().value)
                };
            case TokenType.String:
                return {
                    kind: "StringLiteral",
                    value: this.eat().value
                };
            // Grouping Expressions
            case TokenType.OpenParen: {
                this.eat(); // eat the opening paren
                const value = this.parse_expr();
                this.expect(TokenType.CloseParen, "Unexpected token found in parentesized expression. Expected closing parentesis."); // closing paren
                return value;
            }
            // Unidentified Tokens and Invalid Code Reached
            default:
                throw new Error(`Unexpected token found during parsing! ${JSON.stringify(this.at())}`);
        }
    }
}
