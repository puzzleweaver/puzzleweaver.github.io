import { PixelColor } from "./color.js";
/**
 * Utilities for fetching and processing raw image data.
 */
export class UrlHandler {
    /**
     * Gets the url from the img query parameter.
     *
     * **Redirects to ./select-image if it doesn't exist.**
     */
    static getQueryParam(param) {
        const params = new URLSearchParams(document.location.search);
        const ret = params.get(param);
        if (ret === null) {
            window.location.href = "./select-image";
            throw Error("Image failed to load.");
        }
        return ret;
    }
    /**
     * Get an image's data in a preprocessed form.
     * @returns Promise that resolves to [width, height, getColor(x, y)].
     */
    static getImageData(url) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext('2d');
            var image = new Image();
            image.crossOrigin = "anonymous";
            image.onload = function () {
                ctx.drawImage(image, 0, 0);
                resolve([
                    image.width,
                    image.height,
                    (x, y) => PixelColor.fromImageData(ctx.getImageData(x, y, 1, 1).data),
                ]);
            };
            image.onerror = (e) => {
                reject(e);
            };
            image.src = url;
        });
    }
    /**
     * Converts an html element to an image url.
     */
    static async elementToUrl(elementId) {
        // @ts-ignore
        const promise = html2canvas(document.getElementById(elementId), { allowTaint: true });
        return promise.then((canvas) => canvas.toDataURL());
    }
}
/**
 * Domain-specific representation of an image.
 */
export class PixelImage {
    constructor(data, width, height) {
        this.colors = data;
        this.width = width;
        this.height = height;
    }
    static async fromUrl(url) {
        const [width, height, getColor] = await UrlHandler.getImageData(url);
        const colors = Array(width).fill(0).map((_, x) => Array(height).fill(0).map((_, y) => getColor(x, y)));
        return new PixelImage(colors, width, height).cropped();
    }
    static async fromBase64(base64) {
        var image = new Image();
        image.src = base64;
        image.crossOrigin = "";
        document.body.appendChild(image);
        throw Error("Unimplemented.");
    }
    adjust(tweak1, tweak2, tweak3) {
        return new PixelImage(this.colors.map((column) => column.map(pixel => pixel.adjust(tweak1, tweak2, tweak3))), this.width, this.height);
    }
    /**
     * returns the non-transparent bounds of the image.
     * @returns [minX, maxX, minY, maxY], all ints.
     */
    getBounds() {
        // initialize to extreme values
        const ret = [
            this.width + 1, -1,
            this.height + 1, -1,
        ];
        // iterate over pixels, skipping empty ones, to find the bounds.
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.colors[x][y].isEmpty())
                    continue;
                if (x < ret[0])
                    ret[0] = x;
                if (x > ret[1])
                    ret[1] = x;
                if (y < ret[2])
                    ret[2] = y;
                if (y > ret[3])
                    ret[3] = y;
            }
        }
        // return that result, but add 1 to the maxes so that the ranges are inclusive.
        return [ret[0], ret[1] + 1, ret[2], ret[3] + 1];
    }
    /**
     * Returns a version of this image, but with the transparent borders trimmed down to a single pixel.
     */
    cropped() {
        const bounds = this.getBounds();
        const x0 = bounds[0] - 1, y0 = bounds[2] - 1;
        const croppedWidth = bounds[1] - bounds[0] + 2;
        const croppedHeight = bounds[3] - bounds[2] + 2;
        const croppedColors = Array(croppedWidth).fill(0).map((_, x) => Array(croppedHeight).fill(0).map((_, y) => { var _a, _b; return (_b = ((_a = this.colors[x0 + x]) !== null && _a !== void 0 ? _a : [])[y0 + y]) !== null && _b !== void 0 ? _b : PixelColor.empty(); }));
        return new PixelImage(croppedColors, croppedWidth, croppedHeight);
    }
    /**
     * Returns the number of nonempty pixels.
     */
    countStitches() {
        var count = 0;
        for (const colorColumn of this.colors) {
            for (const color of colorColumn) {
                if (!color.isEmpty())
                    count++;
            }
        }
        return count;
    }
    /**
     * gets the list of all colors present in the image.
     */
    getColors() {
        const indexedColors = {};
        for (const colorColumn of this.colors) {
            for (const color of colorColumn) {
                if (color.isEmpty())
                    continue;
                indexedColors[color.toString()] = color;
            }
        }
        return Object.values(indexedColors);
    }
    /**
     * Returns the color of the image, or undefined if the pixel is empty or out of bounds.
     */
    getColor(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return undefined;
        }
        const ret = this.colors[x][y];
        if (ret.isEmpty())
            return undefined;
        return ret;
    }
    /**
     * Using a palette, get the PaletteColor at (x, y).
     *
     * Returns undefined if (x, y) is out of bounds or if the raw color isn't mapped by the palette.
     */
    getPaletteColor(palette, x, y) {
        const rawColor = this.getColor(x, y);
        if (rawColor === undefined)
            return undefined;
        for (const color of palette.colors) {
            if (color.includes(rawColor))
                return color;
        }
        return undefined;
    }
}
/** Populates all image tags with a specified classname with a given asset. */
export class PreviewPopulator {
    static applyToClass(classname, src) {
        const elements = document.getElementsByClassName(classname);
        const patternPreviews = elements;
        for (const preview of patternPreviews) {
            preview.src = src;
        }
    }
    static applyCanvas(prefix) {
        const element = document.getElementById(prefix);
        const canvas = document.getElementById(`${prefix}-canvas`);
        element.src = canvas.toDataURL();
    }
}
/**
 * A single object to keep track of the app state.
 */
export class AppState {
    constructor(disambiguationMethod, pageOrientation) {
        this.disambiguationMethod = disambiguationMethod;
        this.pageOrientation = pageOrientation;
    }
    copyWith(params) {
        var _a, _b;
        return new AppState((_a = params.disambiguationMethod) !== null && _a !== void 0 ? _a : this.disambiguationMethod, (_b = params.pageOrientation) !== null && _b !== void 0 ? _b : this.pageOrientation);
    }
}
