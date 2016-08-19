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