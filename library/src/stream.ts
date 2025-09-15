import { Readable } from "stream";
import { Response } from "./messages/service_pb";

export class ResponseStream<TResponse> extends Readable {

    constructor(private readonly transform: (data: Response) => TResponse) {
        super();
    }

   public write(response: Response) {
    this.push(this.transform(response));
   }
  
}