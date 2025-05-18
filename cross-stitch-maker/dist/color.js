import { oklab_to_rgb, rgb_to_oklab } from './oklab.js';
import { dmcData as allDmcColors } from "./dmc.js";
/**
 * A color from a raw image, with some domain-specific stuff.
 */
export class PixelColor {
    constructor(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
    static white() {
        return new PixelColor(255, 255, 255, 255);
    }
    static fromImageData(data) {
        var [red, green, blue, alpha] = data;
        return new PixelColor(red, green, blue, alpha)
            .blend(PixelColor.white()); // For Now.
    }
    blend(bg) {
        if (this.alpha < 5)
            return PixelColor.empty();
        else if (this.alpha < 255) {
            // blend into white. TODO user-selected bg color.
            const a = (255 - this.alpha) / 255;
            return new PixelColor(this.red + (bg.red - this.red) * a, this.green + (bg.green - this.green) * a, this.blue + (bg.blue - this.blue) * a, 255);
        }
        return this;
    }
    static fromOklab(ol, alpha) {
        const rgb = oklab_to_rgb(ol);
        return new PixelColor(rgb.r, rgb.g, rgb.b, alpha);
    }
    static fromHex(hex) {
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        return new PixelColor(r, g, b, 255);
    }
    /**
     * Returns a pixel color representing transparent, or a lack of a stitch.
     */
    static empty() {
        return new PixelColor(0, 0, 0, 0);
    }
    /**
     * Returns whether a pixel of this color has a stitch in it.
     */
    isEmpty() {
        return this.alpha === 0;
    }
    /**
     * Returns the perceptual distance between this and another color.
     */
    distanceTo(other) {
        const ol = this.getOklab(), otherOl = other.getOklab();
        const dr = ol.L - otherOl.L, dg = ol.a - otherOl.a, db = ol.b - otherOl.b;
        // const dr = this.red - other.red,
        //     dg = this.green - other.green,
        //     db = this.blue - other.blue;
        return dr * dr + dg * dg + db * db;
    }
    getOklab() {
        return rgb_to_oklab({
            r: this.red,
            g: this.green,
            b: this.blue,
        });
    }
    adjust(tweak1, tweak2, tweak3) {
        const nol = this.getOklab();
        nol.L += tweak1 * 0.01;
        nol.a += tweak2 * 0.01;
        nol.b += tweak3 * 0.01;
        return PixelColor.fromOklab(nol, this.alpha);
    }
    getLuminance() {
        return Math.sqrt(0.299 * this.red * this.red +
            0.587 * this.green * this.green +
            0.114 * this.blue * this.blue);
    }
    isBright() {
        return this.getLuminance() > 128;
    }
    /**
     * Returns the appropriate color to use for an overlay rendered over this color.
     */
    getOverlayColor() {
        return this.isBright() ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.3)";
    }
    /**
     * Returns the string hex value of the color, like "#rrggbbaa".
     */
    toHex() {
        return '#' + [this.red, this.green, this.blue, this.alpha].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    toString() {
        return this.toHex();
    }
}
/**
 * Representation of a DMC thread color (or maybe more general later...)
 *
 */
export class ThreadColor {
    constructor(rawColor, name, flossNumber) {
        this.raw = rawColor;
        this.name = name;
        this.dmcNumber = flossNumber;
    }
    static loadAll() {
        if (ThreadColor.all !== undefined)
            return ThreadColor.all;
        return ThreadColor.all = Object.values(allDmcColors)
            .map((dmcColor) => {
            const rawColor = PixelColor.fromHex(dmcColor.hex);
            if (rawColor === undefined)
                return undefined;
            return new ThreadColor(rawColor, dmcColor.readableName, dmcColor.number);
        })
            .filter((color) => color !== undefined);
    }
    static allByDistanceFrom(raw) {
        const list = ThreadColor.loadAll();
        list.sort((first, second) => {
            const a = raw.distanceTo(first.raw);
            const b = raw.distanceTo(second.raw);
            return a > b ? 1 : -1;
        });
        return list;
    }
    static fromClosestMatch(rawColor) {
        const dmcColors = ThreadColor.loadAll();
        var best = undefined, bestDistance = 255 * 255 * 10;
        for (const dmcColor of dmcColors) {
            const distance = dmcColor.raw.distanceTo(rawColor);
            if (distance < bestDistance) {
                best = dmcColor;
                bestDistance = distance;
            }
        }
        return best;
    }
    toString() {
        return [
            `(${this.raw}`,
            this.dmcNumber,
            `${this.name})`,
        ].join();
    }
}
export class PaletteColor {
    constructor(threadColor, rawColors, index, count) {
        this.threadColor = threadColor;
        this.rawColors = rawColors;
        this.index = index;
        this.count = count;
    }
    /**
     * Returns the simplest possible paletteColor from a given raw color.
     */
    static fromMatch(rawColor) {
        return new PaletteColor(ThreadColor.fromClosestMatch(rawColor), [rawColor], -1, 1);
    }
    /**
     * Returns a copy of this color with a specified index.
     */
    withIndex(newIndex) {
        return new PaletteColor(this.threadColor, this.rawColors, newIndex, this.count);
    }
    /**
     * Returns a copy of this color with a specified count.
     */
    withCount(newCount) {
        return new PaletteColor(this.threadColor, this.rawColors, this.index, newCount);
    }
    withThreadColor(newThreadColor) {
        return new PaletteColor(newThreadColor, this.rawColors, this.index, this.count);
    }
    /**
     * Determines whether a color is represented by this palette color.
     */
    includes(color) {
        return this.rawColors
            .map((rawColor) => rawColor.toString())
            .includes(color.toString());
    }
    /**
     * Returns the overlay text to be draw on this color in the pattern.
     */
    getSymbol(symbolStyle) {
        if (symbolStyle === "none")
            return "";
        if (symbolStyle === "numbers")
            return `${this.index + 1}`;
        if (symbolStyle === "symbols") {
            const symbols = [
                "\u25CB", // circle outline
                // "\u25EF", // big circle outline
                // "\u2605", // star
                "\u2606", // star outline
                "\u2661", // heart outline
                // "\u25B2", // BIG up-pointing triangle
                "\u25B3", // triangle outline
                "+", // plus
                "-", // minus
                "~", // tilde
                "/", // slash
                "\\", // backslash
                "\u2665", // heart
                // "\u2736", // 6-pointed star
                "\u2738", // 8-pointed star
                "\u23F9", // square
                "\u25CF", // circle
                // "\u2B24", // big circle
                "\u25D6", // left half-circle
                // "\u25D7", // right half-circle
                // "\u23F4", // left-pointing triangle
                // "\u23F5", // right-pointing triangle
                // "\u23F6", // up-pointing triangle
                // "\u23F7", // down-pointing triangle
                "\u25C6", // diamond
                "\u25B3", // triangle outline
                "\u25E2", // bottom-right right triangle
                // "\u25E3", // bottom-left right triangle
                // "\u25E4", // top-left right triangle
                // "\u25E5", // top-right right triangle
                "\u2B1F", // pentagon
                // "\u2B2C", // horizontal oval
                // "\u2B2E", // vertical oval
            ];
            return symbols[this.index % symbols.length];
        }
        return "";
        // throw Error(`Bad symbol style: ${symbolStyle}`);
    }
    merge(other) {
        if (other === undefined)
            return this;
        return new PaletteColor(this.threadColor, [...this.rawColors, ...other.rawColors], -2, this.count + other.count);
    }
    toString() {
        return [
            `(${this.threadColor}`,
            `${this.rawColors.join("/")})`,
        ].join(",");
    }
}
export class Palette {
    /**
     * This constructor ignores colors' indices and re-indexes its colors automatically.
     */
    constructor(colors) {
        this.colors = colors.map((color, index) => color.withIndex(index));
    }
    static fromImageMatches(image) {
        const rawColors = image.getColors();
        return new Palette(rawColors.map((rawColor) => PaletteColor.fromMatch(rawColor))).collect();
    }
    collect() {
        const indexedThreadColors = {};
        for (const color of this.colors) {
            const key = JSON.stringify(color.threadColor);
            indexedThreadColors[key] = color.merge(indexedThreadColors[key]);
        }
        return new Palette(Object.values(indexedThreadColors));
    }
}
