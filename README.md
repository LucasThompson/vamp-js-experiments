# Prototyping an audio feature visualisation web app, utilising Emscripten.

### Examples:
These need to be run in a recent version of Chrome or Firefox, due to not transpiling from ES6 to something more widely supported.
* [Zero crossing counts, with WavesJS](https://lucasthompson.github.io/vamp-js-experiments/sv-app-proto.html) - This example uses the ZeroCrossing plugin from the Vamp Plugin SDK examples, visualises a waveform, with a timeline and cursor, and overlays the extracted zero crossing counts - all using WavesJS.
* [Longer audio file load times, no emscripten](https://lucasthompson.github.io/vamp-js-experiments/test-load-large-audio-no-vamp.html) - Download ~10 minute file and decodes the entire audio data into memory, draws waveform with WavesJS. Time to decode is shown on the page.
* [Longer audio file load times, copying to emscripten](https://lucasthompson.github.io/vamp-js-experiments/test-load-large-audio-buffer-vamp.html) - Download ~10 minute file and decodes the entire audio data into memory and then copies to Emscripten using C++ classes from proof-of-concept implementation of VampHost, draws waveform with WavesJS. Time to decode is shown on the page.
