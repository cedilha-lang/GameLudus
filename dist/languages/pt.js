import replace_to_regex from "./translator";
//  Module for Portuguese language
export function translate(code) {
    const replacements = [
        ["nulo", 'null'],
        ["verdadeiro", 'true'],
        ["falso", 'false'],
        ["se", 'if'],
        ["senao", 'else'],
        ["senaose", 'elif'],
        ["para", 'for'],
        ["enquanto", 'while'],
        ["retorne", 'return'],
        ["travar", 'break'],
        ["e", 'and'],
        ["ou", 'or'],
        ["mostre", 'print'],
        ["entrada", 'input'],
        ["randomize", "random"],
        ["arredonde", "round"],
        ["piso", "floor"],
        ["hora", "timeNow"],
        ["aguardar", "setTimeout"],
        ["tamanho", "length"],
        ["junte", "join"],
        ["separe", "split"],
        ["substitua", "replace"],
        ["pop", "shift"],
        ["buscar", "fetch"],
        ["Arquivos", "File"],
        ["ler", "read"],
        ["escreva", "write"],
        ["criar", "create"],
        ["deletar", "delete"],
        ["importar", "import"]
    ];
    return replacements.reduce((acc, [replaced, replacement]) => {
        return replace_to_regex.call(acc, replaced, replacement);
    }, code);
}
