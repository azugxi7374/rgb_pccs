
export function rgb2str(rgbArray) {
    return "#" + rgbArray.map(v => (v + 256).toString(16).slice(1)).join("")
}
export function str2rgb(str) {
    function f(s2) {
        return parseInt(s2, 16)
    }
    return [1, 3, 5].map(i => f(str.slice(i, i + 2)))
}

export function colorDist(rgb1, rgb2) {
    const d2 = [0, 1, 2].map(i => rgb1[i] - rgb2[i]).reduce((res, x) => res + x * x, 0);
    return Math.sqrt(d2);
}

export function norm2PI(a) {
    const pi2 = Math.PI * 2;
    return ((a % pi2) + pi2) % pi2
}

export function colorInDiv(rgb1, rgb2, r) {
    return [0, 1, 2].map(i => {
        return Math.max(0, Math.min(255, Math.round(rgb1[i] * r + rgb2 * (1 - r))));
    });
}

export function rgb2hsv(rgb) {
    const hGroup = [
        "01", // r->y
        "10", // y->g
        "12", // g->c
        "21", // c->b
        "20", // b->m
        "02", // m->r
    ]
    const max = rgb.reduce((a, b) => Math.max(a, b));
    const min = rgb.reduce((a, b) => Math.min(a, b));
    const med = rgb.reduce((a, b) => a + b) - max - min;

    const v = max / 255;
    if (max === min) {
        return [0, 0, v]
    } else {
        const imax = rgb.indexOf(max);
        const imin = (rgb.concat(rgb)).indexOf(min, imax + 1) % 3;
        const imed = 3 - imax - imin;
        const hg = hGroup.indexOf("" + imax + imed)// 0~5
        let hr = (med - min) / (max - min);
        if (hg % 2 === 1) {
            hr = 1 - hr;
        }

        // [0,6)
        const h6 = hg + hr;
        const h = Math.round(h6 / 6 * 360) % 360;
        const s = 1 - min / max;
        return [h, s, v];
    }
}
export function hsv2rgb(hsv) {
    const [h, s, v] = hsv;
    const hGroup = ["01", "10", "12", "21", "20", "02",]
    const hg = Math.floor(h / 60);
    const hr = h / 60 - hg;

    const max = Math.round(v * 255);
    const min = Math.round(max * (1 - s));

    // console.log({ h, hg, hr });
    const imax = hGroup[hg].charAt(0);
    const imed = hGroup[hg].charAt(1);
    const imin = 3 - imax - imed;

    const med = Math.round(
        (hg % 2 === 0) ?
            hr * (max - min) + min : // min -> max
            (1 - hr) * (max - min) + min // max -> min
    );

    const rgb = [0, 0, 0];
    rgb[imax] = max;
    rgb[imin] = min;
    rgb[imed] = med;

    return rgb;
}
