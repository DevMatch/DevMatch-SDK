/**
 * Copyright (C) 2023 DevMatch Co. - All Rights Reserved
 **/
export class LoggerPlugin {
    public constructor() {
    }

    public info(message: string, ...args) : void {
      console.log(` > ${message}`)
    }
  
    public warn(message: string, ...args) : void {
      console.log(` > ${message}`)
    }

    public debug(message: string, ...args) : void {
      console.log(` > ${message}`)
    }

    public error(message: string, ...args) : void {
      console.log(` > ${message}`)
    }
  }
  
  