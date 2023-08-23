import { DecimalPipe } from "@angular/common";

export class PayTran {
    constructor(
        public paymentId: string, 
        public amount: DecimalPipe, 
        public  currency: string,
        public  cardholderNumber: string,
        public  holderName: string,
        public  orderReference: string,
        public  status: string,
        public createdDate: string) {
    }
  }