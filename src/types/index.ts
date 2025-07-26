
export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

export interface IOrder {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface IOrderResult {
	id: string;
	total: number
}

export interface ICardsData {
	cards: ICard[];
}

export interface ICart {
	cards: ICard[];
}

export interface ICartData {
	toggleCard(card: ICard): void;
	clearCart(): void;
	getCards(): string[];
	calculateAmount(): number;
	calculateCount(): number;
	isInCart(card: ICard): boolean;
}

export interface IOrderData {
  setDeliveryInfo(deliveryInfo: DeliveryInfo): void;
  setClientInfo(clientInfo: ClientInfo): void;
  clearInfo(): void;
}

export type DeliveryInfo = Pick<IOrder, 'payment' | 'address'>;

export type ClientInfo = Pick<IOrder, 'email' | 'phone'>;

export type Type = 'catalog' | 'preview' | 'basket';

export type CategoryType =
  | 'софт-скил'
  | 'хард-скил'
  | 'дополнительное'
  | 'другое'
  | 'кнопка';