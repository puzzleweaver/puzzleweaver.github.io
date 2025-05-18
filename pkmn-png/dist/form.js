"use strict";
// @ts-ignore
const { createApp, ref } = Vue;
function mountApp(names) {
    const app = createApp({
        setup() {
            const name = ref("");
            const imageData = ref({});
            const loading = ref(false);
            const loadingFailed = ref(false);
            function onSuccess(data) {
                console.log("Success!");
                console.log(data);
                imageData.value = data.sprites.versions;
                loadingFailed.value = false;
                loading.value = false;
            }
            function onFailed(error) {
                console.log("Failed :(");
                console.log(error);
                imageData.value = [];
                loadingFailed.value = true;
                loading.value = false;
            }
            const requestImages = function () {
                loading.value = true;
                const request = fetch(`https://pokeapi.co/api/v2/pokemon/${name.value}`);
                console.log("Sending request...");
                Promise.all([
                    // either wait one second,
                    new Promise((resolve, _) => setTimeout(resolve, 1000)),
                    // or fetch the result and read its json data.
                    request.then(async (response) => {
                        if (!response.ok)
                            throw Error("Failing status code.");
                        return await response.json();
                    }),
                ])
                    .then(result => onSuccess(result[1]))
                    .catch(e => onFailed(e));
            };
            const randomize = function () {
                name.value = names[Math.floor(Math.random() * names.length)];
                requestImages();
            };
            randomize();
            const generation = ref("4");
            return {
                name,
                generation,
                images: imageData,
                loadImages: requestImages,
                loading,
                loadingFailed,
                randomize,
            };
        },
    });
    app.component('image-card', {
        props: ['heading', 'data'],
        template: "#image-card-template",
        setup(props) {
            const { heading, data } = props;
            const generations = Object.keys(data);
            return {
                generations,
            };
        },
    });
    app.component('single-asset', {
        props: ['url'],
        template: "#single-asset-template",
        setup(props) {
            var _a;
            var url = props.url;
            const valid = typeof url === "string";
            if (valid) {
                var details = url.split("/");
                const indexOfVersion = (_a = details.indexOf("versions")) !== null && _a !== void 0 ? _a : -1;
                details = details.filter((value, index) => index > indexOfVersion && index < details.length - 1).join(", ");
            }
            else {
                url = "img/failed.gif";
                details = "Image failed to load.";
            }
            const expanded = ref(false);
            const style = ref(`position: absolute; visibility: ${expanded.value ? 'visible' : 'hidden'}`);
            const toggleExpanded = () => {
                expanded.value = !expanded.value;
                style.value = `position: absolute; visibility: ${expanded.value ? 'visible' : 'hidden'}`;
            };
            const crossStitchHost = "http://puzzleweaver.github.io/cross-stitch-maker";
            const encodedUrl = encodeURIComponent(url);
            const crossStitchUrl = `${crossStitchHost}?img=${encodedUrl}`;
            const copy = () => {
                navigator.clipboard.writeText(url);
                // alert("Copied the text: " + url);
                // visual feedback: switch text to "copied" for a half second
                const copyButton = document.getElementById(`copy-${url}`);
                copyButton.innerHTML = "copied!";
                setTimeout(() => {
                    copyButton.innerHTML = "copy";
                }, 500);
            };
            return {
                url,
                expanded,
                toggleExpanded,
                details,
                valid,
                crossStitchUrl,
                style,
                copy,
            };
        },
    });
    app.mount("#app");
}
