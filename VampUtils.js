class VampPluginFeatureExtractor {
  constructor(vampJS, vampPlugin, pluginOutputNumber = 0) {
    this.vampJS = vampJS;
    this.pluginOutputNumber = pluginOutputNumber;
    this.vampPlugin = vampPlugin;
  }

  extract(audioStream) {
    const host = new this.vampJS.VampHost(this.vampPlugin);
    audioStream.buffer();
    const feature = JSON.parse(host.run(audioStream.vampStream, this.vampJS.createJsonFeatureSetFormatter(this.pluginOutputNumber)));
    const outputDescriptors = this.vampPlugin.getOutputDescriptors();
    const output = {descriptor: outputDescriptors.get(this.pluginOutputNumber), data: feature.feature[0].data[0]};
    host.delete();
    return output;
  }
}

class AudioStream {
  constructor(audioBuffer, vampJS) {
    this.vampStream = vampJS.createRawDataAudioStream(audioBuffer.length, audioBuffer.numberOfChannels, audioBuffer.sampleRate);
    this.numberOfChannels = audioBuffer.numberOfChannels;
    this.audioBuffer = audioBuffer;
  }

  buffer() {
    for (let c = 0; c < this.numberOfChannels; ++c) {
      const channelBuffer = this.audioBuffer.getChannelData(c);
      for (let n = 0; n < channelBuffer.length; ++n) {
        this.vampStream.setSample(n, c, channelBuffer[n]);
      }
    }
  }
}