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
	adress: string;
	total: number;
	items: string[];
}

export interface ICardsData {
	cards: ICard[];
	preview: string | null;
	getCard(id: string): ICard;
}

export interface ICart {
	cards: ICard[];
	total: number;
	count: number;
}

export interface ICartData {
	addCard(card: ICard): void;
	deleteCard(id: string): void;
	clearCart(): void;
	getCards(): ICard[];
}

export interface IOrderData {
  setDeliveryInfo(deliveryInfo: DeliveryInfo): void;
  setClientInfo(clientInfo: ClientInfo): void;
  clearInfo(): void;
}

export type DeliveryInfo = Pick<IOrder, 'payment' | 'adress'>;

export type ClientInfo = Pick<IOrder, 'email' | 'phone'>;
