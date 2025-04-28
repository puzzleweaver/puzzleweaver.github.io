/**
 * Domain-specific representation of a color.
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
     * Returns a subjective "brightness" of the color between 0 and 1.
     */
    getLuminance() {
        return Math.sqrt(0.299 * this.red * this.red +
            0.587 * this.green * this.green +
            0.114 * this.blue * this.blue) / 255;
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
 * Utilities for fetching and processing raw image data.
 */
class ImageImporter {
    constructor(url) {
        this.url = url;
    }
    /**
     * Creates a new ImageImporter from the image url in the query parameters
     */
    static fromQueryParams() {
        const params = new URLSearchParams(document.location.search);
        const imgParam = params.get("img");
        if (imgParam === null)
            return undefined;
        const imgUrl = decodeURIComponent(imgParam);
        return new ImageImporter(imgUrl);
    }
    /**
     * Get the image's data in a preprocessed form.
     * @returns Promise that resolves to [width, height, getColor(x, y)].
     */
    getImageData() {
        return new Promise((resolve, _) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext('2d');
            var image = new Image;
            image.crossOrigin = "anonymous";
            image.onload = function () {
                ctx.drawImage(image, 0, 0);
                resolve([
                    image.width,
                    image.height,
                    (x, y) => PixelColor.fromImageData(ctx.getImageData(x, y, 1, 1).data),
                ]);
            };
            image.src = this.url;
        });
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
    static async fromQueryParams() {
        return new Promise((resolve, reject) => {
            const importer = ImageImporter.fromQueryParams();
            if (importer === undefined) {
                reject("No Url Provided.");
                return;
            }
            resolve(PixelImage.fromImporter(importer));
        });
    }
    static async fromImporter(importer) {
        const [width, height, getColor] = await importer.getImageData();
        const colors = Array(width).fill(0).map((_, x) => Array(height).fill(0).map((_, y) => getColor(x, y)));
        return new PixelImage(colors, width, height).cropped();
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
     * Counts how many times each color appears in the image.
     */
    collectColors() {
        var _a;
        // this mess is working around javascripts BUSTED maps.
        const indexByColor = {};
        const collectedColors = [];
        function getIndex(color) {
            const key = color.toString();
            if (indexByColor[key] === undefined) {
                indexByColor[key] = collectedColors.length;
                collectedColors.push(color);
            }
            return indexByColor[key];
        }
        // iterate over each pixel to count them by color.
        const counts = [];
        for (const colorColumn of this.colors) {
            for (const color of colorColumn) {
                const index = getIndex(color);
                counts[index] = ((_a = counts[index]) !== null && _a !== void 0 ? _a : 0) + 1;
            }
        }
        return [
            collectedColors,
            counts,
        ];
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
