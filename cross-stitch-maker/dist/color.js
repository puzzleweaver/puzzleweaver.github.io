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
    static fromImageData(data) {
        const [red, green, blue, alpha] = data;
        return new PixelColor(red, green, blue, alpha);
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
        const dr = this.red - other.red, dg = this.green - other.green, db = this.blue - other.blue;
        return dr * dr + dg * dg + db * db;
    }
    isBright() {
        const luminance = Math.sqrt(0.299 * this.red * this.red +
            0.587 * this.green * this.green +
            0.114 * this.blue * this.blue) / 255;
        return luminance > 0.5;
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
        if (ThreadColor._all !== undefined)
            return ThreadColor._all;
        return ThreadColor._all = Object.values(allDmcColors)
            .map((dmcColor) => {
            const rawColor = PixelColor.fromHex(dmcColor.hex);
            if (rawColor === undefined)
                return undefined;
            return new ThreadColor(rawColor, dmcColor.readableName, dmcColor.number);
        })
            .filter((color) => color !== undefined);
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
}
export class PaletteColor {
    constructor(threadColor, rawColors, index) {
        this.threadColor = threadColor;
        this.rawColors = rawColors;
        this.index = index;
    }
    /**
     * Returns the simplest possible paletteColor from a given raw color.
     */
    static fromMatch(rawColor) {
        return new PaletteColor(ThreadColor.fromClosestMatch(rawColor), [rawColor], -1);
    }
    /**
     * Returns a copy of this color with a specified index.
     */
    withIndex(index) {
        return new PaletteColor(this.threadColor, this.rawColors, index);
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
        // // if number overlays...
        // return `${this.index}`;
        if (symbolStyle === "none")
            return "";
        if (symbolStyle === "numbers")
            return `${this.index + 1}`;
        if (symbolStyle === "symbols") {
            const symbols = ["\u23F9", "\u23FA", "\u25D6", "\u25D7", "\u23F4", "\u23F5", "\u23F6", "\u23F7", "\u25C6", "\u25E2", "\u25E3", "\u25E4", "\u25E5", "\u2B1F", "\u2B23", "\u2B2C", "\u2B2E"];
            return symbols[this.index % symbols.length];
        }
        return "";
        // throw Error(`Bad symbol style: ${symbolStyle}`);
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
        const [rawColors, counts] = image.collectColors();
        return new Palette(rawColors.map((rawColor) => PaletteColor.fromMatch(rawColor)));
    }
}
