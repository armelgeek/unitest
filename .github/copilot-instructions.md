## Project snapshot (big picture)
- This is a static Unity WebGL build wrapper: HTML + supporting assets serve a Unity app located in `Build/` (compressed `.br` assets and a loader JS). The single page at `index.html` loads the Unity instance.
- `assets/js/unityBridge.js` is the web <-> Unity communication layer. UI controls in `index.html` call this bridge to send messages into Unity.
- `assets/css/style.css` controls the UI (loading screen, fullscreen button). Fonts and images live under `assets/`.

## When working in this repository
- The codebase is static — no backend or build scripts included. Changes are usually one of:
  - Replace/update the entire `Build` folder with a new Unity WebGL export.
  - Edit or add JavaScript glue code in `assets/js/unityBridge.js` to add message handlers or UI features.
  - Update `index.html` for UX or to include new scripts, or adjust `config` values (like `productVersion`).

## Key files and integration points
- `index.html` — page that initializes Unity and hosts the UI. Important sections:
  - `buildUrl` and `loaderUrl` point to `Build/counting-machine.loader.js` — keep names in sync when updating builds.
  - `config` contains `dataUrl`, `frameworkUrl`, `codeUrl` — Unity-generated blobs (.br in this repo).
  - `createUnityInstance(canvas, config, progressCb)` is used to boot the app.
- `assets/js/unityBridge.js` — sends messages to Unity using the Unity WebGL `SendMessage` API. Usage pattern:
  - Check `if (typeof unityInstance !== 'undefined') { ... }` before sending messages.
  - Calls look like: `unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'SetValue' + value);`.
  - Message format is string-based and prefix-oriented. Example formats seen in repo:
    - `SetValue0123` — sets displayed value
    - `ChangeList544/1352/9871` — sends several goals separated by `/`
    - `LockThousand:1` or `LockThousand:0` — lock/unlock a digit roll
  - Global hook: `window.onUnityMessage = function(message) { ... }` is present to receive messages from Unity (some arbitrary code may rely on this hook).

## Messaging conventions and examples
- Unity message object: The object name in Unity is `WebBridge` and it expects a string method `ReceiveStringMessageFromJs`.
- Messages are convention-based, not JSON: there's a mix of `SetValueNNNN` and `Name:0|1` formats.
- Examples (JS → Unity):
  - Change displayed value: `unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'SetValue0322');`
  - Change goals list: `unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'ChangeList544/1352/9871');`
  - Lock rolls: `unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'LockUnit:1');`
- If you add new message types, follow the existing conventions (prefix and separators) and update both `unityBridge.js` and the Unity code (same GameObject and method) consistently.

## Dev & test workflow (local testing)
- Host files locally with a static server. Unity WebGL artifacts (WASM, JS) require serving via HTTP — they won't load from `file://`. Common choices:
  - Python: `python3 -m http.server 8000` (quick, but may not set Brotli & WASM MIME headers)
  - Node: `npx http-server -c-1` or `npm i -g http-server` (recommended for local dev; easier to set correct mime types)
  - To support `*.br` (Brotli) compressed files, your server must respond with `Content-Encoding: br`; otherwise the Unity loader can't decode them. If your server doesn't support Brotli, either configure it or replace `.br` artifacts with uncompressed export.
- Browser testing notes:
  - Unity builds include loader JS and a `.wasm` file. Serve with correct MIME type: `application/wasm`.
  - `window.unityInstance` becomes available after `createUnityInstance` resolves.
  - Use the browser console to verify messages and to inspect `window.onUnityMessage` or `console.log` calls added to `unityBridge.js`.

## Debugging tips specific to this project
- If messages do not take effect: verify `unityInstance` exists and `SendMessage` target `WebBridge` and method `ReceiveStringMessageFromJs` are correct (Unity object names are case-sensitive).
- For failing load issues: check server response headers for `Content-Encoding` (Brotli) or MIME types for `.wasm`.
- If the loader script path is wrong (404) update `buildUrl` or confirm `Build/counting-machine.loader.js` exists.
- The index uses a `hideFullScreenButton` flag and `canFullscreen` detection; toggling these may help debug fullscreen behavior.

## Patterns, conventions and best fit-for-project edits
- Keep the simple message formats, and preserve `unityBridge.js`’s pattern of sending strings into Unity.
- Keep UI markup and CSS simple — the app depends on `#unity-canvas` and `#unity-container` ids.
- Update `productVersion` in `index.html` when shipping a new build — it's visible in `config` and often used for cache busting or QA.
- Assume a single Unity instance — all messaging uses a global `unityInstance`. Avoid creating multiple instances on the same page.

## Quick snippets to use
- New JS function example that sends a PlaySound message:
  - `function PlaySound(soundId) { if (typeof unityInstance !== 'undefined') { unityInstance.SendMessage('WebBridge', 'ReceiveStringMessageFromJs', 'PlaySound:' + soundId); } }`
- Quick local test server (Node, supports Content-Encoding and .wasm mime-types):
  - `npx http-server --port 8000 -c-1` or `http-server -p 8000 -c-1` (install `http-server` globally to use `http-server` CLI).

## Files to look at when changing behavior
- `index.html` — loader, UI and boot sequence.
- `assets/js/unityBridge.js` — message formats and glue code.
- `Build/` — Unity-generated artifacts: update atomically with new Unity export.

## What not to change lightly
- The message prefix formats (e.g., `SetValue`, `LockThousand:`) since Unity expects them. If you rename message prefixes, coordinate with the Unity project.
- Do not change the Unity GameObject name `WebBridge` or the method `ReceiveStringMessageFromJs` without updating the Unity code accordingly.

If anything above is unclear or you'd like additional examples (e.g., example Unity C# message parser to pair with `unityBridge.js`), tell me which part and I will add a focused example and tests.
