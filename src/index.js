import { createColorCircle, createRGBBar, createRGBView, createPCCSToneView } from './components'

document.addEventListener('DOMContentLoaded', () => {
    init();
});
function init() {
    const container = document.getElementById('container');

    const components = [];
    let state = { rgb: [255, 255, 0], tmpRGB: null };
    const updateState = (updFunc) => {
        state = updFunc(state);
        components.forEach(render => render(state));
    }

    const { canvas, render: renderPCCS } = createPCCSToneView(300, updateState);
    const { elem: rgbView, render: renderCaption } = createRGBView(300, updateState);
    const { elem: circle, render: renderCircle } = createColorCircle(300, updateState);
    const { elem: rgbBar, render: renderRGBBar } = createRGBBar(300, updateState);

    components.push(renderPCCS);
    components.push(renderCaption);
    components.push(renderCircle);
    components.push(renderRGBBar);

    updateState((s) => s);

    container.appendChild(rgbView);
    container.appendChild(canvas);
    container.appendChild(circle);
    container.appendChild(rgbBar);
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

// test
/*
const smax = 0xffffff + 1;
let stop = false;
const sampleRate = 0.01;
for (let s = 0; s < smax && !stop; s++) {
    if (sampleRate < Math.random()) {
        continue;
    }
    const str = "#" + (smax + s).toString(16).slice(1);
    try {
        const rgb = str2rgb(str);
        const hsv = rgb2hsv(rgb);
        const rgb2 = hsv2rgb(hsv);

        if (3 < colorDist(rgb, rgb2)) {
            console.error({ rgb, rgb2 });
            stop = true;
        }
    } catch (error) {
        console.error(error);
        console.log({ str });
        stop = true;
    }
}
*/