import { AppApi } from './components/AppApi';
import './scss/styles.scss';
import { CDN_URL, API_URL } from './utils/constants';
import { CardsData, CartData, OrderData } from './components/Model';
import { EventEmitter } from './components/base/events';
import { ICard, ICart } from './types';
import { cloneTemplate, ensureElement } from './utils/utils';
import {
	CardBasket,
	CardCatalog,
	CardPreview,
	MainPage,
	Modal,
	ModalCart,
	ModalContacts,
	ModalOrder,
	ModalSuccess,
} from './components/View';

const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);

// Загружаем карточки с сервера на главную страницу
api
	.getItems()
	.then((items: ICard[]) => {
		cardsData.cards = items;
	})
	.catch((err) => {
		console.error(err);
	});

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Модель данных приложения
const cardsData = new CardsData(events);
const cartData = new CartData(events);
const orderData = new OrderData(events);

// Глобальные контейнеры
const page = new MainPage(events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса

const preview = new CardPreview(cloneTemplate(cardPreviewTemplate), events);
const cart = new ModalCart(cloneTemplate(basketTemplate), events);
const order = new ModalOrder(cloneTemplate(orderTemplate), events);
const contacts = new ModalContacts(cloneTemplate(contactsTemplate), events);
const success = new ModalSuccess(cloneTemplate(successTemplate), events);

events.on('cards:changed', () => {
	page.catalog = CardCatalog.createList(
		cardsData.cards,
		cardCatalogTemplate,
		events
	);
});

events.on('preview:changed', (card: ICard) => {
	preview.render(card);
	modal.content = preview.element;
	modal.open();
});

events.on('card:preview', (card: ICard) => {
	cardsData.preview = card;
	preview.InCart = cartData.isInCart(cardsData.preview);
});

events.on('cart:changed', () => {
	cart.goods = CardBasket.createList(
		cartData._cards,
		cardBasketTemplate,
		events
	);
	cart.total = cartData.calculateAmount().toString();
	cart.setValid(cartData.calculateAmount() > 0);
	page.counter = cartData.calculateCount();
	preview.InCart = cartData.isInCart(cardsData.preview);
});

events.on('cart:open', () => {
	modal.content = cart.container;
	cart.setValid(cartData.calculateAmount() > 0);
	modal.open();
});

events.on('modal:open', () => {
	modal.open();
});

events.on('modal:close', () => {
	modal.close();
});

events.on('card:toggle', (card: ICard) => {
	cartData.toggleCard(card);
});

events.on('order:open', () => {
	modal.content = order.element;
	modal.open();
});

events.on(
	'order:input',
	(data: { value: string; payment: 'card' | 'cash' }) => {
		order.showErrors(data.value != '');
		order.setValid(data.value != '' && data.payment != null);
	}
);

events.on(
	'order:changed',
	(data: { payment: 'card' | 'cash'; address: string }) => {
		orderData.setDeliveryInfo(data);
	}
);

events.on('contacts:open', () => {
	order.clearValues();
	modal.content = contacts.element;
	modal.open();
});

events.on(
	'contacts:input',
	(data: { email: string; phone: string; field: string }) => {
		contacts.setValid(data.email != '' && data.phone != '');
		contacts.showErrors(data.email != '' && data.phone != '');
	}
);

events.on('contacts:submit', (data: { email: string; phone: string }) => {
	orderData.total = cartData.calculateAmount();
	orderData.lots = cartData.getCards();
	orderData.setClientInfo(data);
});

events.on('order:send', () => {
	api
		.postOrder(orderData.orderData)
		.then(() => {
			success.setTotal(cartData.calculateAmount());
			modal.content = success.element;
			cartData.clearCart();
			page.counter = 0;
				contacts.clearValues();
		})
		.catch((err) => {console.log(err);
				contacts.clearValues();
});
});
