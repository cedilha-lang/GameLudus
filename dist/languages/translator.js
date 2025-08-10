// It will assign the function on a string. Doesn't matter if it already does not exist
export default function replace_to_regex(replaced, replacement) {
    const pattern = new RegExp(`\\b${replaced}\\b(?=(?:(?:[^"]*"){2})*[^"]*$)`, 'g');
    return this.replace(pattern, replacement);
}
export async function loadTranslateFunction(lang) {
    try {
        const { translate } = await import(`./${lang}.ts`);
        return translate;
    }
    catch (error) {
        console.error(`Error loading translation module for "${lang}": ${error.message}`);
        return null;
    }
}
