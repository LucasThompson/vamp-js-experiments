class VampFeatureCanvasView {
  constructor(width, height, JAMS) {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = width;
    canvasElement.height = height;
    document.body.appendChild(canvasElement);
    this.ctx = canvasElement.getContext('2d');
    this.JAMS = JAMS;
  }

  draw() {
    const message = "Cannot display Vamp Feature.";
    const width = (0.5 * this.ctx.canvas.width) - 0.5 * this.ctx.measureText(message).width;
    this.ctx.fillText(message, width, 0.5 * this.ctx.canvas.height);
  }
}

class SpectrogramCanvasView extends VampFeatureCanvasView {
  constructor(width, height, JAMS) {
    super(width, height, JAMS);
    const canvasScale = this.ctx.canvas.width / JAMS.time.length;
    this.ctx.scale(canvasScale, 1);
  }

  draw() {
    for (let bins of this.JAMS.value) {
      this.drawSpectrogramLine(bins);
    }
  }

  drawSpectrogramLine(bins) {
    const minDecibels = -100;
    const maxDecibels = -30;
    const rangeScaleFactor = 1.0 / (maxDecibels - minDecibels);
    const nBins = bins.length;
    const normalisationFactor = 1 / nBins;

    for (let [i, binValue] of bins.entries()) {
      // scale
      const value = binValue * normalisationFactor;
      // re-map range
      const dbMag = (isFinite(value) && value > 0.0) ? 20.0 * Math.log10(value) : minDecibels;
      let scaledValue = 255 * (dbMag - minDecibels) * rangeScaleFactor;
      // clip to uint8 range
      if (scaledValue < 0)
        scaledValue = 0;
      if (scaledValue > 255)
        scaledValue = 255;
      scaledValue = Math.floor(scaledValue);
      // draw line
      this.ctx.fillStyle = 'rgb(c, c, c)'.replace(/c/g, 255 - scaledValue);
      this.ctx.fillRect(0, nBins - i - 1, 1, 1);
    }
    this.ctx.translate(1, 0);
  }
}

class ScatterPlotCanvasView extends VampFeatureCanvasView {
  constructor(width, height, JAMS, plotLabel) {
    super(width, height, JAMS);
    this.label = plotLabel;
    this.data = [];
    for (let [i, timeStamp] of this.JAMS.time.entries()) {
      this.data.push({
        x: timeStamp,
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
    const is3D = outputDescriptor.hasFixedBinCount && outputDescriptor.binCount > 1;
    const is1D = outputDescriptor.hasFixedBinCount && outputDescriptor.binCount == 1 && !outputDescriptor.hasDuration;

    if (is3D)
      return new SpectrogramCanvasView(1024, 512, JAMS);
    if (is1D)
      return new ScatterPlotCanvasView(1024, 512, JAMS, outputDescriptor.name);
    return new VampFeatureCanvasView(1024, 512, JAMS);
  }
}

class VampPluginFeatureExtractor {
  constructor(audioBuffer, vampJS, vampPlugin, pluginOutputNumber = 0) {
    this.vampJS = vampJS;
    this.audioBuffer = audioBuffer;
    this.pluginOutputNumber = pluginOutputNumber;
    this.vampPlugin = vampPlugin;
    this.vampStream = this.vampJS.createRawDataAudioStream(this.audioBuffer.length, this.audioBuffer.numberOfChannels, this.audioBuffer.sampleRate);
  }

  fillVampBuffer() {
    for (let c = 0; c < this.audioBuffer.numberOfChannels; ++c) {
      const channelBuffer = this.audioBuffer.getChannelData(c);
      for (let n = 0; n < channelBuffer.length; ++n) {
        vampStream.setSample(n, c, channelBuffer[n]);
      }
    }
  }

  extract() {
    const host = new this.vampJS.VampHost(this.vampPlugin);
    this.fillVampBuffer();
    const feature = JSON.parse(host.run(this.vampStream, this.vampJS.createJsonFeatureSetFormatter(this.pluginOutputNumber)));
    const outputDescriptors = this.vampPlugin.getOutputDescriptors();
    const output = {descriptor: outputDescriptors.get(this.pluginOutputNumber), data: feature.feature[0].data[0]};
    host.delete();
    return output;
  }
}