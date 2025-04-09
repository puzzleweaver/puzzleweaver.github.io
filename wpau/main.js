const { createApp, ref } = Vue

const metersPerInch = 0.0254;
const kilosPerPound = 0.453592

const app = createApp({
    setup() {
        const weight = ref("145");
        const weightUnits = ref("lb");
        const setWeightUnits = () => {
            if (weightUnits.value === "lb") {
                const kilos = weight.value;
                weight.value = kilos / kilosPerPound;
            }
            if (weightUnits.value === "kg") {
                const pounds = weight.value;
                weight.value = pounds * kilosPerPound;
            }
        };

        const height = ref(5);
        const heightInches = ref(0);
        const heightUnits = ref("ft");
        const setHeightUnits = () => {
            if (heightUnits.value === "ft") {
                var meters = height.value;
                var feet = (meters / metersPerInch) / 12;
                var inches = (feet * 12) - Math.floor(feet * 12);
                height.value = Math.floor(feet);
                heightInches.value = inches;
            }
            if (heightUnits.value === "m") {
                const inches = height.value * 12 + heightInches.value;
                height.value = inches * metersPerInch;
            }
        };

        const maximumGeneration = ref(3);

        const getWeightKg = () => weightUnits.value === "lb" ?
            weight.value :
            kilosPerPound * weight.value;

        const getHeightM = () => heightUnits.value === "m" ?
            height.value :
            0.0254 * (height.value + heightInches * value);

        const results = ref("(results will appear here)");

        const calculate = () => {
            const weightString = [weight.value, weightUnits.value].join("");
            const heightString = heightUnits.value === "ft" ?
                [height.value, "' ", heightInches.value, '"'].join("") :
                [height.value, heightUnits.value].join("");
            results.value = `A Pokemon that is ${weightString}, ${heightString}, and a big DORK >:3`;
        };

        return {
            weight,
            weightUnits,
            setWeightUnits,

            height,
            heightInches,
            heightUnits,
            setHeightUnits,

            maximumGeneration,
            calculate,

            results,
        };
    },
});

app.mount('#app');