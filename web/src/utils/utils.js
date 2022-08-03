export function debounceInput(cb, timeout = 1000) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            cb.apply(this, args);
        }, timeout);
    };
}