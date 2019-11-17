function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function callbackFunc() {
    document.body.style.backgroundColor = '#' + randomIntFromInterval(0, 0xFFFFFF).toString(16);
}

class Callback {
    #bytes = new Uint8Array([0,97,115,109,1,0,0,0,1,137,128,128,128,0,2,96,1,127,0,96,0,1,127,2,148,128,128,128,0,1,3,101,110,118,12,99,97,108,108,98,97,99,107,70,117,110,99,0,0,3,130,128,128,128,0,1,1,4,132,128,128,128,0,1,112,0,0,5,131,128,128,128,0,1,0,1,6,129,128,128,128,0,0,7,153,128,128,128,0,2,6,109,101,109,111,114,121,2,0,12,99,97,108,108,98,97,99,107,84,101,115,116,0,1,10,144,128,128,128,0,1,138,128,128,128,0,1,1,127,32,0,16,0,32,0,11]);

    async init() {
        const results = await WebAssembly.instantiate(this.#bytes, {
            env: {
                callbackFunc,
            }
        });
        this.callbackTest = results.instance.exports.callbackTest;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const cb = new Callback();
    await cb.init();

    document.onclick = cb.callbackTest;
});