var vamp = VampJS();

class VampFeatureCanvasView {
  constructor(width, height, JAMS) {
    var canvasElement = document.createElement('canvas');
    canvasElement.width = width;
    canvasElement.height = height;
    document.body.appendChild(canvasElement);
    this.ctx = canvasElement.getContext('2d');
    this.JAMS = JAMS;
  }

  draw() {
    var message = "Cannot display Vamp Feature.";
    var width = (0.5 * this.ctx.canvas.width) - 0.5 * this.ctx.measureText(message).width;
    this.ctx.fillText(message, width, 0.5 * this.ctx.canvas.height);
  }
}

class SpectrogramCanvasView extends VampFeatureCanvasView {
  constructor(width, height, JAMS) {
    super(width, height, JAMS);
    var canvasScale = this.ctx.canvas.width / JAMS.time.length;
    this.ctx.scale(canvasScale, 1);
  }

  draw() {
    for (var s = 0; s < this.JAMS.time.length; ++s) {
      this.drawSpectrogram(this.JAMS.value[s]);
    }
  }

  drawSpectrogram(array) {
    var minDecibels = -100;
    var maxDecibels = -30;
    var rangeScaleFactor = 1.0 / (maxDecibels - minDecibels);

    for (var i = 0; i < array.length; i++) {
      // scale
      var value = array[i] / array.length;
      // re-map range
      var dbMag = (isFinite(value) && value > 0.0) ? 20.0 * Math.log10(value) : minDecibels;
      var scaledValue = 255 * (dbMag - minDecibels) * rangeScaleFactor;
      // clip to uint8 range
      if (scaledValue < 0)
        scaledValue = 0;
      if (scaledValue > 255)
        scaledValue = 255;
      scaledValue = Math.floor(scaledValue);
      // draw line
      this.ctx.fillStyle = 'rgb(c, c, c)'.replace(/c/g, 255 - scaledValue);
      this.ctx.fillRect(0, 512 - i, 1, 1);
    }
    this.ctx.translate(1, 0);
  }
}

class ScatterPlotCanvasView extends VampFeatureCanvasView {
  constructor(width, height, JAMS, plotLabel) {
    super(width, height, JAMS);
    this.label = plotLabel;
    this.data = [];
    for (var i = 0; i < this.JAMS.time.length; ++i) {
      this.data.push({
        x: this.JAMS.time[i],
        y: this.JAMS.value[i][0]
      });
    }
  }

  draw() {
    Chart.Line(this.ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: this.label,
          data: this.data,
          fill: false
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom'
          }]
        }
      }
    });
  }
}

class VampFeatureCanvasViewFactory {
  static create(outputDescriptor, JAMS) {
    var is3D = outputDescriptor.hasFixedBinCount && outputDescriptor.binCount > 1;
    var is1D = outputDescriptor.hasFixedBinCount && outputDescriptor.binCount == 1 && !outputDescriptor.hasDuration;

    if (is3D)
      return new SpectrogramCanvasView(1024, 512, JAMS);
    if (is1D)
      return new ScatterPlotCanvasView(1024, 512, JAMS, outputDescriptor.name);
    return new VampFeatureCanvasView(1024, 512, JAMS);
  }
}

class WebAudioVampPluginRunner {
  constructor(audioFileURI, pluginInitCallback, pluginOutputNumber = 0) {
    this.pluginInitCallback = pluginInitCallback;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();
    this.request = new XMLHttpRequest();
    this.request.open('GET', audioFileURI, true);
    this.request.responseType = 'arraybuffer';
    this.request.onload = () => { this.doAudioProcessing() };
    this.song = false;
    this.pluginOutputNumber = pluginOutputNumber;
  }

  start() {
    this.request.send();
  }

  doAudioProcessing() {
    var audioData = this.request.response;
    this.audioCtx.decodeAudioData(audioData).then((renderedBuffer) => {
      var stream = vamp.createRawDataAudioStream(renderedBuffer.length, renderedBuffer.numberOfChannels, renderedBuffer.sampleRate);

      for (var c = 0; c < renderedBuffer.numberOfChannels; ++c) {
        var cBuffer = renderedBuffer.getChannelData(c);
        for (var n = 0; n < renderedBuffer.length; ++n) {
          stream.setSample(n, c, cBuffer[n]);
        }
      }

      var vampPlugin = this.pluginInitCallback(renderedBuffer.sampleRate);
      var outputDescriptors = vampPlugin.getOutputDescriptors();
      var host = new vamp.VampHost(vampPlugin);
      var feature = JSON.parse(host.run(stream, vamp.createJsonFeatureSetFormatter(this.pluginOutputNumber)));
      host.delete(); // clean up emscripten objects
      this.song = this.audioCtx.createBufferSource();
      this.song.buffer = renderedBuffer;
      this.song.connect(this.audioCtx.destination);

      var featureView = VampFeatureCanvasViewFactory.create(outputDescriptors.get(this.pluginOutputNumber), feature.feature[0].data[0]);
      featureView.draw();
    }).catch(function (err) {
      console.log('Rendering failed: ' + err);
    });
  }

  playSong() {
    if (this.song)
      this.song.start();
  }
}