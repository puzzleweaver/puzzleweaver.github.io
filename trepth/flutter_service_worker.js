'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"flutter_bootstrap.js": "8da5c249834bd7d17ef7f25a6e0a6d82",
"version.json": "da1bb32d19dafb4ec9ebe3c8dd4c0aa1",
"index.html": "cbf857f29fb5ca7cfe1bdd73782b0cf7",
"/": "cbf857f29fb5ca7cfe1bdd73782b0cf7",
"main.dart.js": "a0201716d4aff919172e067fd14b917d",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c",
"favicon.png": "03d7c2390a35870eb710a138c95f5732",
"icons/Icon-192.png": "0a4848d6840bcc8520d986a023eed7c7",
"icons/Icon-maskable-192.png": "0a4848d6840bcc8520d986a023eed7c7",
"icons/Icon-maskable-512.png": "327b24bc997110e0006493684ca0c47d",
"icons/Icon-512.png": "327b24bc997110e0006493684ca0c47d",
"manifest.json": "76a9676f2dd80525c0a390d0fe3ef715",
"assets/AssetManifest.json": "6d58b160c40e489f0b3d92f51b61d36e",
"assets/NOTICES": "36f3df9031c55f3f4867f8735ba8cf42",
"assets/FontManifest.json": "a7dcf3ab4b93be3f2a43874e914c90fe",
"assets/AssetManifest.bin.json": "634bb4bc2a6e482acc7327b2ae96eb95",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"assets/AssetManifest.bin": "0013304cee5540d4a5f73bd456ed6054",
"assets/fonts/MaterialIcons-Regular.otf": "c0ad29d56cfe3890223c02da3c6e0448",
"assets/assets/ant-2.png": "473be12cd4ea4cd27e6a2e17b35a2449",
"assets/assets/big-termite-1.png": "314485d514e06806f6f8baec0ce68261",
"assets/assets/wasp-2-td.png": "bb1d412a3ecb239c453bbe2e314c8844",
"assets/assets/ant-larva-2-td.png": "99767453a4e20ed66b20bc5982ecd9a8",
"assets/assets/ant-queen-1.png": "b5cade258ee08672dda2b9f5de88a8ea",
"assets/assets/ant-1.png": "1685b03e1d188d63b599c786e6ee8394",
"assets/assets/big-termite-2.png": "ce10cfb83b4a157a9a645d464bc64514",
"assets/assets/icon.png": "6029766b145cc35c72496ce61c9d3f04",
"assets/assets/goal.png": "8f5e74a004659de03c6a737270a0ac9f",
"assets/assets/ant-queen-2.png": "4662ed0f6ea82f1a44e3b7adb6a1016f",
"assets/assets/leaf-tile-1.png": "e8b221c297b8abb857d8b8cf5ec648b0",
"assets/assets/leaf-mask.png": "2ead91d3e9ecbac816801e8dbcc2a6ba",
"assets/assets/termite-2-td.png": "074b87593232de4e10c705c7c52d48d0",
"assets/assets/termite-1.png": "d6008b32a1aee059b65bd6b6eb323484",
"assets/assets/small.ttf": "08cf22ed0231f4566280bda544e22f5d",
"assets/assets/grub-2-td.png": "622fe23d185f5cea9d0f8f876a3bfe54",
"assets/assets/Wood%2520Scratched%2520var1.png": "0262c3af8834c5c779b265b884c178a6",
"assets/assets/Wood%2520Scratched%2520var3.png": "cbc90ca3cc362021b87c38b0ba29e138",
"assets/assets/leaf-tile-2.png": "91cb3be183dd7faa897ccd50e9cf5daf",
"assets/assets/termite-2.png": "045757bc792e4c3c0b92d62788d5ff3a",
"assets/assets/lock.png": "71ba430bd4bf14b314346853d9dff928",
"assets/assets/Wood%2520Scratched%2520var2.png": "127327818f8110f8bece7156cf4b6b6d",
"assets/assets/ant-queen-2-td.png": "82acdeaeab1255e475389f23da640c2f",
"assets/assets/grub-2.png": "17efa8e963df1be97b372bcf87e9c078",
"assets/assets/Rocks.png": "7673d6fd73b99bae0ce3b29e955c56a3",
"assets/assets/tarantula-1-td.png": "6d01d32a1e4a56b1cca59147e5593d68",
"assets/assets/big-termite-3-td.png": "e29357d40fed5d92d7da7590aa456c66",
"assets/assets/dirt-mask.png": "c7097147494d149145c5e518046c6855",
"assets/assets/grub-1.png": "a2e10faa619e2921a0b69014297955c8",
"assets/assets/tarantula-3-td.png": "a2f12d976b4a22259faa841886cad34a",
"assets/assets/big-termite-1-td.png": "12675752ef2b992cbcb0f57254bddfc1",
"assets/assets/beetle-3.png": "60bd82c01ed7fb1ce9a448ac0d026dc2",
"assets/assets/beetle-2.png": "f44978307730f6a1a5e5e42ae71d66c8",
"assets/assets/beetle-2-td.png": "6ec7a532d4d20be021a3dc73bb73f3db",
"assets/assets/wood-bg-2.png": "629b9647a406f4e381a9ec44151977f7",
"assets/assets/scarab-2-td.png": "5073f69a2258f5901550bf0f5adeec9f",
"assets/assets/ant-2-td.png": "7d3a3d29cd5959c669f7dbdc7005a4f6",
"assets/assets/beetle-1.png": "3d05a4b5edd99b3ecd5f5c7e4851c0cb",
"assets/assets/wood-bg-1.png": "1ea1c7eabe7b1a89f89bffe91d1b71d8",
"assets/assets/scarab-2.png": "85658760ae33cdea0a9c7549718bf281",
"assets/assets/grub-1-td.png": "6eee0aa7f34747e041992f70b37a3b21",
"assets/assets/termite-1-td.png": "524b90f0f295b8f1373c8a05cb8bb33c",
"assets/assets/wood-tile-2.png": "abba85a07104d7d6f5aa8fdbef0b54b7",
"assets/assets/scarab-1.png": "27300ed79b7f601fcde3ca4118c5df6d",
"assets/assets/wood-tile-1.png": "2baf2e52ef4e08ff1eb8b1d68d04ece6",
"assets/assets/Termite%2520song.mp3": "e3bf896d7b50be55540bc2f885c31374",
"assets/assets/wood-mask.png": "e4b004403abd1ac96f00616ceb9b2985",
"assets/assets/tarantula-2.png": "c4bf1821a5a4093cbf41c7db890f7559",
"assets/assets/dirt-tile.png": "77de89ef0ed361fb8b3331fbf6b8a768",
"assets/assets/tarantula-3.png": "8e318a2e8e1860c4bc9771bd245da215",
"assets/assets/wasp-1-td.png": "a3410aaa6414ee6585074de256c1d5a2",
"assets/assets/ant-larva-1-td.png": "3343bce5187c4f6f7c0f60314655996d",
"assets/assets/tarantula-1.png": "65d4337e9834af5a4d9ecc8703a7845b",
"assets/assets/termite-3-td.png": "8496217eefbe6d90a95b0ba8979c762d",
"assets/assets/beetle-1-td.png": "e8ecc4bd9620b4fa8bd5c42fb5101c2a",
"assets/assets/ant-larva-1.png": "082d29f28524fd9a11a37d8f69b43410",
"assets/assets/wasp-1.png": "62d6c734e6c870be6df52a5c924cabf5",
"assets/assets/log.png": "8758673bdb518533d4ff2b644938f3b1",
"assets/assets/fruit.png": "2379909fb7474ac6f92bde9c804697f8",
"assets/assets/big-termite-2-td.png": "04e6f60ae47a065c742872969efdfb71",
"assets/assets/ant-larva-2.png": "b6012467af6ea14b3c624bc7e51211a6",
"assets/assets/wasp-2.png": "9fa6bb59511bc03b13add5204dc66f5e",
"assets/assets/scarab-1-td.png": "c70cc12ef87b8387c9ca60d3ad59e7dc",
"assets/assets/ant-1-td.png": "8022105c22755bf2d727efbfbc28746c",
"assets/assets/ant-queen-3-td.png": "8dd29202ab0cf23ebe412b2476776b6f",
"assets/assets/bark-bg.png": "609152f0aaf8ead5a287165f9b620755",
"assets/assets/BG%2520cracks%25203.png": "18da9cf9f03f2be5158df5f7f57373a4",
"assets/assets/ant-queen-1-td.png": "2a625b4aa9599b8e551d0570511810a8",
"assets/assets/ant-3-td.png": "63bbd4669c3e1efbe7ed5aceb4ee8881",
"assets/assets/BG%2520cracks%25202.png": "f575050751b092183696f8df0147f125",
"assets/assets/beetle-3-td.png": "a5ef64c60f15b5210b487ce502d42590",
"assets/assets/tarantula-2-td.png": "9968bd7654a645104c3162fd5783948a",
"assets/assets/BG%2520cracks%25201.png": "fceb00d3ed2c326da1e01b28b1e47fa9",
"canvaskit/skwasm.js": "ede049bc1ed3a36d9fff776ee552e414",
"canvaskit/skwasm.js.symbols": "9fe690d47b904d72c7d020bd303adf16",
"canvaskit/canvaskit.js.symbols": "27361387bc24144b46a745f1afe92b50",
"canvaskit/skwasm.wasm": "1c93738510f202d9ff44d36a4760126b",
"canvaskit/chromium/canvaskit.js.symbols": "f7c5e5502d577306fb6d530b1864ff86",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.wasm": "c054c2c892172308ca5a0bd1d7a7754b",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.wasm": "a37f2b0af4995714de856e21e882325c"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
