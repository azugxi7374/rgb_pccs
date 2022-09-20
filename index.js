document.addEventListener('DOMContentLoaded', () => {
    init();
});
function init() {
    console.log('aaa')
    // const canvas = document.getElementById('canvas')
    // const ctx = canvas.getContext('2d')
    const container = document.getElementById('container');
    const { canvas } = createPCCSToneView(400, 2);

    // 14
    // 360/ 24 + 360 * i/24

    container.appendChild(canvas);
    /*
    canvas.addEventListener('mousemove', (e) => {
        const [x, y] = [e.offsetX, e.offsetY];
        const imgData = ctx.getImageData(x, y, 1, 1);
        const [r, g, b, a] = imgData.data;
        console.log(r, g, b);
    });

    canvas.addEventListener('mousemove', (e) => {
        const [x, y] = [e.offsetX, e.offsetY];
        const imgData = ctx.getImageData(x, y, 1, 1);
        const [r, g, b, a] = imgData.data;
        console.log(r, g, b);
    });
    */
};

// render, 
function createPCCSToneView(width, ti) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = width * 1;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();

    const r1 = Math.floor(width / 2);
    const [x0, y0] = [r1, r1];
    const r2 = Math.floor(r1 * 3 / 4)
    for (let i = 0; i < 24; i++) {
        const clr = toneMap['v' + (i + 1)]
        const a0_24 = (i + 1 - 14 + 24)
        const a_delta = 0.4;
        const a1_24 = a0_24 - a_delta;
        const a2_24 = a0_24 + a_delta;

        ctx.beginPath();
        ctx.arc(x0, y0, r1, a1_24 * (2 * Math.PI / 24), a2_24 * (2 * Math.PI / 24), false);
        ctx.arc(x0, y0, r2, a2_24 * (2 * Math.PI / 24), a1_24 * (2 * Math.PI / 24), true);

        ctx.fillStyle = clr;

        ctx.fill();
    }

    const tones = 'p ltg g dkg lt sf d dk b s dp v'.split(" ");
    const dx_4 = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3];
    const dy_4 = [0, 1, 2, 3, 0, 1, 2, 3, 0.5, 1.5, 2.5, 1.5];
    for (let i = 0; i < tones.length; i++) {
        // r, d, l, u = r5,r3,r4,r3
        const r3 = r2 * 0.75;
        const r4 = r2 * 0.75;
        const r5 = r2;
        const r6 = r2 / 6;
        const x3 = x0 - r4;
        const y3 = y0 - r3;
        const xx = x3 + (r4 + r5) * (dx_4[i] + 0.5) / 4;
        const yy = y3 + (r3 + r3) * (dy_4[i] + 0.5) / 4;

        ctx.beginPath();
        ctx.arc(xx, yy, r6, 0, 2 * Math.PI);

        ctx.fillStyle = toneMap[`${tones[i]}${ti}`];
        ctx.fill();
        ctx.strokeStyle = "#888888";
    }

    // TODO
    // [path2D, 色, (text,) 当たり判定, 当たったときのview] にする
    // 奇数のときはv以外をdeactive
    // hoverのときはレイヤー使うと良い？

    return {
        canvas,
    }
}


