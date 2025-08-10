import replace_to_regex from "./translator";
//  Module for Czech language
export function translate(code) {
    const replacements = [
        ["spravny", 'true'],
        ["nespravny", 'false'],
        ["jestli", 'if'],
        ["jinak", 'else'],
        ["pokudne", 'elif'],
        ["pro", 'for'],
        ["zatimco", 'while'],
        ["navrat", 'return'],
        ["zastavit", 'break'],
        ["pokracovat", 'continue'],
        ["a", 'and'],
        ["nebo", 'or'],
        ["ukazat", 'print'],
        ["zadat", 'input'],
        ["nahodne", "random"],
        ["zaokrouhlit", "round"],
        ["zaokrouhlitdolu", "floor"],
        ["cas", "timeNow"],
        ["pockat", "setTimeout"],
        ["delka", "length"],
        ["spojit", "join"],
        ["rozdelit", "split"],
        ["zmenitnacislo", "toNumber"],
        ["nahradit", "replace"],
        ["premistit", "shift"],
        ["vynest", "fetch"],
        ["Soubory", "File"],
        ["cist", "read"],
        ["napsat", "write"],
        ["vytvorit", "create"],
        ["smazat", "delete"],
        ["importovat", "import"]
    ];
    return replacements.reduce((acc, [replaced, replacement]) => {
        return replace_to_regex.call(acc, replaced, replacement);
    }, code);
}
