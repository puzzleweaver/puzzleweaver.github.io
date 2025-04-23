
// @ts-ignore
const { createApp, ref } = Vue;

const app = createApp({
    setup() {
        const name = ref('bellsprout');
        const imageData = ref({});
        const loading = ref(false);
        const loadingFailed = ref(false);

        function onSuccess(data: any) {
            console.log("Success!");
            console.log(data);

            imageData.value = data.sprites.versions;
            loadingFailed.value = false;
            loading.value = false;
        }

        function onFailed(error: any) {
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
                request.then(async (response: Response) => {
                    if (!response.ok) throw Error("Failing status code.");
                    return await response.json();
                }),
            ])
                .then(result => onSuccess(result[1]))
                .catch(e => onFailed(e));
        };

        const generation = ref("4");

        return {
            name,
            generation,

            images: imageData,
            loadImages: requestImages,

            loading,
            loadingFailed,
        };
    },
});

app.component(
    'image-card',
    {
        props: ['heading', 'data'],
        template: "#image-card-template",
        setup(props: { heading: any, data: any }) {
            const { heading, data } = props;
            const generations = Object.keys(data);
            console.log(`Headed ${heading}`);

            return {
                generations,
            };
        },
    },
);

app.component(
    'single-asset',
    {
        props: ['url'],
        template: "#single-asset-template",
        setup(props: { url: any }) {
            var url = props.url;
            const valid = typeof url === "string";
            if (valid) {
                var details = url.split("/");
                const indexOfVersion = details.indexOf("versions") ?? -1;
                details = details.filter((value: any, index: number) =>
                    index > indexOfVersion && index < details.length - 1,
                ).join(", ");
            } else {
                url = "img/failed.gif";
                details = "Image failed to load.";
            }

            const expanded = ref(false);
            const style = ref(`position: absolute; visibility: ${expanded.value ? 'visible' : 'hidden'}`);
            const toggleExpanded = () => {
                expanded.value = !expanded.value;
                style.value = `position: absolute; visibility: ${expanded.value ? 'visible' : 'hidden'}`
            }

            const crossStitchHost = "http://puzzleweaver.github.io/cross-stitch-maker";
            const encodedUrl = encodeURIComponent(url);
            const crossStitchUrl = `${crossStitchHost}?img=${encodedUrl}`

            return {
                url,
                expanded,
                toggleExpanded,
                details,
                valid,
                crossStitchUrl,
                style,
            };
        },
    },
);

app.component(

);

app.mount("#app");