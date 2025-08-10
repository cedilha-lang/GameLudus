export function MK_NUMBER(n = 0) {
    return { value: n, type: "number" };
}
export function MK_STRING(val) {
    //const escaped_val = val.replace(/\n/g, '\n');
    return { value: val, type: typeof (val) };
}
export function MK_BOOL(b = true) {
    return { value: b, type: "boolean" };
}
export function MK_NULL() {
    return { value: null, type: "null" };
}
export function MK_NATIVE_FN(call) {
    return { call, type: "native-fn" };
}
export function MK_OBJECT(obj) {
    return { properties: obj, type: "object" };
}
export function MK_ARRAY(arr) {
    return { values: arr, type: "array" };
}
