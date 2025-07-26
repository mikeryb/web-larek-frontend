import {
	ICard,
	ICardsData,
	ICartData,
	IOrderData,
	DeliveryInfo,
	ClientInfo,
	IOrder,
} from '../types';
import { IEvents } from './base/events';

export class CardsData implements ICardsData {
	protected _cards: ICard[];
	protected events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
	}

	set cards(cards: ICard[]) {
		this._cards = cards;
		this.events.emit('cards:changed');
	}

	get cards() {
		return this._cards;
	}
}

export class CartData implements ICartData {
	_cards: ICard[] = [];
	protected events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
	}

	toggleCard(card: ICard): void {
		const index = this._cards.findIndex(c => c.id === card.id);
	if (index !== -1) {
		this._cards.splice(index, 1);
	} else {
		this._cards.push(card);
	}
	}

	clearCart(): void {
		this._cards = [];
	}

	getCards(): string[] {
	return this._cards
		.filter(card => card.price !== null)
		.map(card => card.id);
}

	calculateAmount(): number {
		return this._cards.reduce((sum, card) => sum + (card.price ?? 0), 0);
	}

	calculateCount(): number {
		return this._cards.length;
	}

	isInCart(card: ICard): boolean {
	return this._cards.some(c => c.id === card.id);
}
}

export class OrderData implements IOrderData {
	protected payment: string = '';
	protected email: string = '';
	protected phone: string = '';
	protected address: string = '';
	protected _total: number = 0;
	protected items: string[] = [];
	protected events: IEvents;

	constructor(events: IEvents) {
		this.events = events;
	}

	setDeliveryInfo(deliveryInfo: DeliveryInfo): void {
		this.payment = deliveryInfo.payment;
		this.address = deliveryInfo.address;
	}

	setClientInfo(clientInfo: ClientInfo): void {
		this.email = clientInfo.email;
		this.phone = clientInfo.phone;
	}

	clearInfo(): void {
		this.payment = '';
		this.email = '';
		this.phone = '';
		this.address = '';
		this._total = 0;
		this.items = [];
	}

	get orderData(): IOrder {
	return {
		payment: this.payment,
		email: this.email,
		phone: this.phone,
		address: this.address,
		total: this._total,
		items: this.items
	};	
}

set lots(items: string[]) {
	this.items = items;
}

set total(total:number) {
 this._total = total;
}

}
