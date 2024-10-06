import css from './multi-palette.css' assert { type: 'css' };
document.adoptedStyleSheets?.push(css);

/*! Shade/blend hex colors (for more info, see: https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js) )*/
const pSBCr = (d) => {
    let i = parseInt, m = Math.round;
    let n = d.length, x = {};
    if (n > 9) {
        [r, g, b, a] = d = d.split(","), n = d.length;
        if (n < 3 || n > 4) return null;
        x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4)), x.g = i(g), x.b = i(b), x.a = a ? parseFloat(a) : -1
    } else {
        if (n == 8 || n == 6 || n < 4) return null;
        if (n < 6) d = "#" + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : "");
        d = i(d.slice(1), 16);
        if (n == 9 || n == 5) x.r = d >> 24 & 255, x.g = d >> 16 & 255, x.b = d >> 8 & 255, x.a = m((d & 255) / 0.255) / 1000;
        else x.r = d >> 16, x.g = d >> 8 & 255, x.b = d & 255, x.a = -1
    } return x
};
const pSBC = (p, c0, c1, l) => {
    let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof (c1) == "string";
    if (typeof (p) != "number" || p < -1 || p > 1 || typeof (c0) != "string" || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;

    h = c0.length > 9, h = a ? c1.length > 9 ? true : c1 == "c" ? !h : false : h, f = pSBCr(c0), P = p < 0, t = c1 && c1 != "c" ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }, p = P ? p * -1 : p, P = 1 - p;
    if (!f || !t) return null;
    if (l) r = m(P * f.r + p * t.r), g = m(P * f.g + p * t.g), b = m(P * f.b + p * t.b);
    else r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5), g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5), b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5);
    a = f.a, t = t.a, f = a >= 0 || t >= 0, a = f ? a < 0 ? t : t < 0 ? a : a * P + t * p : 0;
    if (h) return "rgb" + (f ? "a(" : "(") + r + "," + g + "," + b + (f ? "," + m(a * 1000) / 1000 : "") + ")";
    else return "#" + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2)
}

const STORAGE_KEY = 'selectedPaletteIndex';

var buttonElements;
var paletteIndex;
var currentPalette;
var changeFuncs = [];

const RGB_Log_Shade = (p, c) => {
    var i = parseInt, r = Math.round, [a, b, c, d] = c.split(","), P = p < 0, t = P ? 0 : p * 255 ** 2, P = P ? 1 + p : 1 - p;
    return "rgb" + (d ? "a(" : "(") + r((P * i(a[3] == "a" ? a.slice(5) : a.slice(4)) ** 2 + t) ** 0.5) + "," + r((P * i(b) ** 2 + t) ** 0.5) + "," + r((P * i(c) ** 2 + t) ** 0.5) + (d ? "," + d : ")");
}
const brightness = (c) => {
    let f = pSBCr(c);
    return Math.max(f.r, f.g, f.b) / 255;
}
function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}
function rgbToHex(rgb) {
    var r = Math.max(0, Math.min(255, parseInt(rgb.r, 16))).toString(16),
        g = Math.max(0, Math.min(255, parseInt(rgb.g, 16))).toString(16),
        b = Math.max(0, Math.min(255, parseInt(rgb.b, 16))).toString(16);
    return '#' + padZero(r) + padZero(g) + padZero(b);
}
function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}
const colorVariants = (c, varientPercent = 0.15) => {
    //TODO Currently, bright colors 1st color varients are very visually different
    const out = [];
    out.push(c);
    let lighter = pSBC(varientPercent, c, false, true);
    let darker = pSBC(-1 * varientPercent, c, false, true);
    if (brightness(c) < 0.5) {
        out.push(lighter);
        out.push(darker);
    } else {
        out.push(darker);
        out.push(lighter);
    }
    return out;
}
// function objToArr(o) {
//     return [o.r, o.g, o.b]
// }
// function lightnessShift(c, percent_of_255) {
//     const totalLight = percent_of_255 * 255;
//     // Pretty sure the * and / 255 cancel here. Just remove after.
//     // percent of current color that each component is:
//     c.r += 0.00001;
//     c.g += 0.00001;
//     c.b += 0.00001;
//     const bright = (c.r + c.g + c.b);
//     const   pr = c.r/bright,
//             pg = c.g/bright,
//             pb = c.b/bright;
//             console.log(c, pr, pg, pb)
//     return rgbToHex({
//         r: c.r + (pr * totalLight),
//         g: c.g + (pg * totalLight),
//         b: c.b + (pb * totalLight),
//     });
// }
// const colorVariantsNEW=(c, varientPercent=0.15)=>{
//     //TODO Currently, bright colors 1st color varients are very visually different
//     const out = [];
//     out.push(c);
//     const baseColor = pSBCr(c);
//     let lighter = lightnessShift(baseColor, varientPercent); //pSBC(varientPercent, c, false, true);
//     let darker = lightnessShift(baseColor, -1*varientPercent); //pSBC(-1*varientPercent, c, false, true);
//     if (brightness(c) < 0.5) {
//         out.push(lighter);
//         out.push(darker);
//     } else {
//         out.push(darker);
//         out.push(lighter);
//     }
//     return out;
// }
class BasePalette {
    constructor(paletteName, base, element1, accent1, accent2, text, textAccent1) {
        if (Array.isArray(paletteName)) {
            this.paletteName = paletteName[0];
            this.base = paletteName[1];
            this.element1 = paletteName[2];
            this.accent1 = paletteName[3];
            this.accent2 = paletteName[4];
            this.text = paletteName[5];
            this.textAccent1 = paletteName[6];
        } else {
            this.paletteName = paletteName;
            this.base = base;
            this.element1 = element1;
            this.accent1 = accent1;
            this.accent2 = accent2;
            this.text = text;
            this.textAccent1 = textAccent1;
        }
    }
}
class ColorPalette {
    constructor(basePalette) {
        this.paletteName = basePalette.paletteName;
        this.base = colorVariants(basePalette.base);

        this.background = basePalette.base;
        this.element1 = colorVariants(basePalette.element1);

        this.accent1 = colorVariants(basePalette.accent1);
        this.accent2 = colorVariants(basePalette.accent2, 0.2);

        this.text = colorVariants(basePalette.text);
        this.textInverse = invertColor(basePalette.text);
        this.textAccent1 = basePalette.textAccent1;
    }
}
var colorPalettes = __PALETTES__; //todo load this from external file? or from online library of available palettes?
var defaultPaletteIndicies = __DEFAULT_PALLETE_INDICIES__;
colorPalettes = colorPalettes.map(p => new BasePalette(p));

function bindPaletteSwapButtons(btnElements) {
    if (!btnElements) {
        buttonElements = document.getElementsByClassName('swap_palette');
    } else {
        buttonElements = btnElements;
    }
    for (let i = 0; i < buttonElements.length; i++) {
        buttonElements[i].addEventListener('click', swapPalette);
    }
}

function loadStoredPalette() {
    let stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
        paletteIndex = parseInt(stored, 10);
    } else {
        let mql = window.matchMedia('(prefers-color-scheme: dark)');
        if (mql.matches) {
            paletteIndex = defaultPaletteIndicies['dark'];
        } else {
            paletteIndex = defaultPaletteIndicies['light'];
        }

        window.localStorage.setItem(STORAGE_KEY, paletteIndex);
    }
    displayPalette(paletteIndex);
}

function swapPalette() {
    paletteIndex += 1;
    if (paletteIndex >= colorPalettes.length) {
        paletteIndex = 0;
    }
    displayPalette(paletteIndex);
    window.localStorage.setItem(STORAGE_KEY, paletteIndex);
    for (const func of changeFuncs) {
        func(currentPalette);
    }
}

function onPaletteChange(func) {
    changeFuncs.push(func);
}

function displayPalette(paletteID) {
    const style = document.documentElement.style;
    let p = new ColorPalette(colorPalettes[paletteID]);
    style.setProperty('--color-base', p.base[0]);
    style.setProperty('--color-base-1', p.base[1]);
    style.setProperty('--color-base-2', p.base[2]);
    style.setProperty('--color-background', p.background);
    style.setProperty('--color-element', p.element1[0]);
    style.setProperty('--color-element-1', p.element1[1]);
    style.setProperty('--color-element-2', p.element1[2]);
    style.setProperty('--color-accent-1', p.accent1[0]);
    style.setProperty('--color-accent-1-1', p.accent1[1]);
    style.setProperty('--color-accent-1-2', p.accent1[2]);
    style.setProperty('--color-accent-2', p.accent2[0]);
    style.setProperty('--color-accent-2-1', p.accent2[1]);
    style.setProperty('--color-accent-2-2', p.accent2[2]);
    style.setProperty('--color-text', p.text[0]);
    style.setProperty('--color-text-1', p.text[1]);
    style.setProperty('--color-text-2', p.text[2]);
    style.setProperty('--color-text-inverse', p.textInverse);
    style.setProperty('--color-text-accent-1', p.textAccent1);
    // for (let i=0; i<buttonElements.length; i++) {
    //     buttonElements[i].textContent = p.paletteName;
    // }
    recolorImages(p);
    currentPalette = p;
    return p;
}

function createStyleSheet(id, media) {
    var el = document.createElement('style');
    // WebKit hack
    el.appendChild(document.createTextNode(''));
    // el.type  = 'text/css';
    el.rel = 'stylesheet';
    el.media = media || 'screen';
    el.id = id;
    document.head.appendChild(el);
    return el.sheet;
}

/**
 * 
 * @param {ColorPalette} newPalette 
 */
function recolorImages(newPalette) {
    const icon_after = document.getElementsByClassName('icon_after');
    const icon = document.getElementsByClassName('icon');

    let operation;
    if (brightness(newPalette.text[0]) >= 0.5) {
        operation = (el) => el.classList.add('invert');
        document.documentElement.style.setProperty('--multi-palette-invert', '100%'); // inverts dark things
    } else {
        operation = (el) => el.classList.remove('invert');
        document.documentElement.style.setProperty('--multi-palette-invert', '0%');
    }
    let operationAccent;
    if (brightness(newPalette.textAccent1) >= 0.5) {
        operationAccent = (el) => el.classList.add('invert');
    } else {
        operationAccent = (el) => el.classList.remove('invert');
    }

    const apply = (elem) => {
        if (elem.matches('#navbar .button') || elem.matches('#navbar .button *') || elem.matches('.icon.base'))
            operation(elem);
        else
            operationAccent(elem);
    }
    for (let i = 0; i < icon_after.length; i++) {
        apply(icon_after[i]);
    }
    for (let i = 0; i < icon.length; i++) {
        apply(icon[i]);
    }
}

loadStoredPalette();
document.addEventListener('DOMContentLoaded', () => {
    recolorImages(currentPalette);
    bindPaletteSwapButtons();
    displayPalette(paletteIndex);
});


const registerPalette = (paletteName, base, element1, accent1, accent2, text, textInverse) => colorPalettes.push(new BasePalette(paletteName, base, element1, accent1, accent2, text, textInverse))

function setPalette(index) {
    if (index >= colorPalettes.length)
        return -1;
    displayPalette(index);
    window.localStorage.setItem(STORAGE_KEY, index);
    for (const func of changeFuncs) {
        func(currentPalette);
    }

}

export { onPaletteChange, currentPalette, paletteIndex as currentPaletteIndex, registerPalette, setPalette, };//refreshPalette
