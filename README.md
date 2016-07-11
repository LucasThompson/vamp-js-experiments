# Emscripten Vamp examples with ES6

## Info

This repo contains Javascript sample code, using ES6 classes and other features, for visualising features extracted from Vamp plugins in the browser. The Vamp extraction code is C++ compiled to Javascript using Emscripten, and the preliminary work on this is available [here]((https://lucasthompson.github.io/vamp-js-example-es6/zero-crossings.html)). 

There are only a few simple classes (all within VampUtils.js for simplicity):

* VampFeatureCanvasView - A base class for Canvas elements which render features in JAMs like format
* SpectrogramCanvasView - Draws a Spectrogram to a Canvas element
* ScatterPlotCanvasView - Draws a line graph to a Canvas element using Graph.js
* VampFeatureCanvasViewFactory - A factory for instantiating the appropriate view based on the Output Descriptor for the selected output of the Vamp plugin
* WebAudioVampPluginRunner - Encapsulates the logic for using the Web Audio API to populate and run the Vamp Host, and then render a suitable visualisation. 


### Examples: 
These need to be run in a recent version of Chrome or Firefox, due to no transpiling to ES6.
* [Zero Crossing Counts](https://lucasthompson.github.io/vamp-js-example-es6/zero-crossings.html) - This example uses the ZeroCrossing plugin from the Vamp Plugin SDK examples, and renders a line graph using .
* [Spectrogram](https://lucasthompson.github.io/vamp-js-example-es6/spectrogram.html) - This example uses the PowerSpectrum plugin from the Vamp Plugin SDK examples, and renders a simple black and white spectrogram using a HTML5 Canvas Element.

