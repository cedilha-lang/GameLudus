import replace_to_regex from "./translator";
//  Module for Italian language
export function translate(code) {
    const replacements = [
        ["funz", 'func'],
        ["nulo", 'null'],
        ["vero", 'true'],
        ["falso", 'false'],
        ["se", 'if'],
        ["altrimenti", 'else'],
        ["altrimentise", 'elif'],
        ["per", 'for'],
        ["mentre", 'while'],
        ["restituire", 'return'],
        ["interrompere", 'break'],
        ["continuare", 'continue'],
        ["e", 'and'],
        ["o", 'or'],
        ["mostrare", 'print'],
        ["randomizza", "random"],
        ["arrotondare", "round"],
        ["pavimento", "floor"],
        ["ora", "timeNow"],
        ["ritardo", "setTimeout"],
        ["lunghezza", "length"],
        ["unire", "join"],
        ["dividere", "split"],
        ["sostituire", "replace"],
        ["pop", "shift"],
        ["prendere", "fetch"],
        ["leggere", "read"],
        ["scrivere", "write"],
        ["creare", "create"],
        ["eliminare", "delete"],
        ["importare", "import"]
    ];
    return replacements.reduce((acc, [replaced, replacement]) => {
        return replace_to_regex.call(acc, replaced, replacement);
    }, code);
}
