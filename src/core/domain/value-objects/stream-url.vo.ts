export class StreamUrl {
  readonly value: string;

  private constructor(url: string) {
    this.value = url;
  }

  static compose(
    host: string,
    username: string,
    password: string,
    streamId: number
  ): StreamUrl {
    const url = `${host}/live/${username}/${password}/${streamId}.m3u8`;
    return new StreamUrl(url);
  }

  toString(): string {
    return this.value;
  }
}
