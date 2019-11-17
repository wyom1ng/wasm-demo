class Fibonacci {
    #bytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 134, 128, 128, 128, 0, 1, 96, 1, 127, 1, 127, 3, 130, 128, 128, 128, 0, 1, 0, 4, 132, 128, 128, 128, 0, 1, 112, 0, 0, 5, 131, 128, 128, 128, 0, 1, 0, 1, 6, 129, 128, 128, 128, 0, 0, 7, 144, 128, 128, 128, 0, 2, 6, 109, 101, 109, 111, 114, 121, 2, 0, 3, 102, 105, 98, 0, 0, 10, 164, 128, 128, 128, 0, 1, 158, 128, 128, 128, 0, 0, 2, 64, 32, 0, 65, 2, 78, 13, 0, 32, 0, 15, 11, 32, 0, 65, 127, 106, 16, 0, 32, 0, 65, 126, 106, 16, 0, 106, 11]);
    #term = new Terminal({
        cols: 200,
        disableStdin: true,
        cursorBlink: true,
    });

    async init() {
        const results = await WebAssembly.instantiate(this.#bytes, {imports: {}});
        this.fibWASM = results.instance.exports.fib;

        this.#term.open(document.getElementById('terminal'));
    }

    fibJS(n) {
        if (n <= 1)
            return n;
        return this.fibJS(n - 1) + this.fibJS(n - 2);
    }

    benchmark(iterations) {
        const jsRes = [];
        const wasmRes = [];

        const jsStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            jsRes.push(this.fibJS(i));
        }
        const jsStop = performance.now();
        const jsDuration = jsStop - jsStart;

        const wasmStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            wasmRes.push(this.fibWASM(i));
        }
        const wasmStop = performance.now();
        const wasmDuration = wasmStop - wasmStart;

        this.#term.writeln('JS:\t\t' + jsDuration);
        this.#term.writeln('WASM:\t\t' + wasmDuration);

        const increase = Math.round(jsDuration / wasmDuration * 100) - 100;
        this.#term.writeln('Increase:\t' + increase + '%');

        this.#term.writeln('');
        this.#term.writeln('JS:\t\t[' + jsRes.join(', ') + ']');
        this.#term.writeln('WASM:\t\t[' + wasmRes.join(', ') + ']');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const fib = new Fibonacci();
    await fib.init();

    fib.benchmark(30);
});