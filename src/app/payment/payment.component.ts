import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbDate, NgbCalendar, NgbDateParserFormatter, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { PaytranService } from '../services/paytran.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';

import { PayTran } from './PayTran';
import { TResponse } from './TResponse';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})

export class PaymentComponent implements OnInit {
  payTransactions!: PayTran[];
  tempArray!: PayTran[];
  allPayTransactions: number = 0;
  pagination: number = 1;
  pageSize: number = 4;
  api: string = 'http://localhost:5141/api/authorize/';
  data!: [];
  statusFilter: string = "";

  hoveredDate: NgbDate | null = null;

	fromDate!: NgbDate | null;
	toDate!: NgbDate | null;

  constructor(private paytranService: PaytranService, private confirmationDialogService: ConfirmationDialogService,
                private http: HttpClient, private calendar: NgbCalendar, public formatter: NgbDateParserFormatter) {
                  this.fromDate = calendar.getToday();
		              this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
  }

  ngOnInit() {
    this.fetchPayTransactions();
  }

  fetchPayTransactions() {
    this.paytranService.getPayTransactions(this.pagination, this.pageSize).subscribe((res: any) => {
      this.payTransactions = res.data;
      this.allPayTransactions = res.totalRecords;
      console.log(res.totalRecords);
    });
  }

  renderPage(event: number) {
    this.pagination = event;
    this.fetchPayTransactions();
  }

  public openConfirmationDialog(paytran: PayTran, action: string) {
    const actionStatus = action === "voids" ? "Voided" : "Captured";
    const actionMessage = action === "voids" ? "void" : "capture";
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to ' + actionMessage + ' transaction - ' + paytran.paymentId + '?')
    .then((confirmed) => {
      console.log('User confirmed:', confirmed);
      if (confirmed) {
        this.postAction(action, paytran.orderReference, paytran.paymentId);
        var foundIndex = this.payTransactions.findIndex(x => x.paymentId == paytran.paymentId);
        console.log('User status no updated:', this.payTransactions[foundIndex]);
        this.payTransactions[foundIndex].status = actionStatus;
        console.log('User status updated:', this.payTransactions[foundIndex]);
      }
      
    })
    .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }

  postAction(action: string, orderReference: string, paymentId: string) {
    const objOrdReference = {orderReference: orderReference};
    let body = JSON.stringify(objOrdReference);
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }

    const promise = new Promise<void>((resolve, reject) => {
      const apiURL = this.api + paymentId + '/' + action;
      console.log('apiURL', apiURL);
      this.http.post<TResponse>(apiURL, body, httpOptions).subscribe({
        next: (res: any) => {
            resolve();
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    });
    return promise;
  }

  doSearch(statusFilter:string) {
    console.log('statusFilter', statusFilter);
    if (statusFilter) {
      this.statusFilter = statusFilter;
      this.tempArray = JSON.parse(JSON.stringify(this.payTransactions));
      this.payTransactions = [];
      this.payTransactions = this.tempArray.filter(tran =>
        tran["status"].toUpperCase().includes(statusFilter.toUpperCase())
      );
    }

    // Date filter
    console.log('Dates', this.fromDate, this.toDate);
    if (this.fromDate && this.toDate) {
      let createdDate: NgbDate = new NgbDate(0,0,0);

      this.tempArray = [];
      this.tempArray = JSON.parse(JSON.stringify(this.payTransactions));
      this.payTransactions = [];
      this.payTransactions = this.tempArray.filter(tran => {
        console.log('ssubstring(5,2)', tran["createdDate"].substring(5,7));
        createdDate.year = +tran["createdDate"].substring(0,4);
        createdDate.month = +tran["createdDate"].substring(5,7);
        createdDate.day = +tran["createdDate"].substring(8,10);

        if ((createdDate.after(this.fromDate) && createdDate.before(this.toDate)) || 
              (createdDate.equals(this.fromDate) && createdDate.before(this.toDate)) ||
                (createdDate.after(this.fromDate) && createdDate.equals(this.toDate))      
              ) {
                return true;
              }
              else {
                return false;
              }
      }
        
      );  
      }
  }

  onDateSelection(date: NgbDate) {
		if (!this.fromDate && !this.toDate) {
			this.fromDate = date;
		} else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
			this.toDate = date;
		} else {
			this.toDate = null;
			this.fromDate = date;
		}
	}

	isHovered(date: NgbDate) {
		return (
			this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
		);
	}

	isInside(date: NgbDate) {
		return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
	}

	isRange(date: NgbDate) {
		return (
			date.equals(this.fromDate) ||
			(this.toDate && date.equals(this.toDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
	}




}
