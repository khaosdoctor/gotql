import IOptions from "../interfaces/IOptions";

class Logger {
  private debug: boolean;

  constructor (options:IOptions) {
    this.debug = options.debug || false;
  }

  log (message: string) {
    if(this.debug) console.log(message);
  }
}

export default Logger;