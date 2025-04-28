
function redirectToImage(imageUrl) {
    const param = "img";
    const encodedUrl = encodeURIComponent(imageUrl);
    window.location.href = `../?${param}=${encodedUrl}`;
}

function useUrl() {
    const input = document.getElementById("image-url-input");
    const url = input.value;
    redirectToImage(url);
}

async function useFile() {
    const input = document.getElementById("file-input");
    if (!input.files || !input.files[0]) console.log("No files specified.");
    var reader = new FileReader();
    reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result !== 'string') {
            console.log("Target failed to load.");
            return;
        }
        // This doesnot work D: ;-;
        redirectToImage(result);
    };
    reader.readAsDataURL(input.files[0]);
}