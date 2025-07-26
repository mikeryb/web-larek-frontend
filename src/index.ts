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
		page.catalog = CardCatalog.createList(
			cardsData.cards,
			cardCatalogTemplate,
			events
		);
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


const page = new MainPage(events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);


events.on('card:select', (card: ICard) => {
	const newCard = new CardPreview(card,cloneTemplate(cardPreviewTemplate), events)
	newCard.InCart = cartData.isInCart(card);
	modal.content = newCard.element;
	modal.open();
});

events.on('cart:open', () => {
	const cards = CardBasket.createList(cartData._cards, cardBasketTemplate, events);
	const modalCart = new ModalCart(cloneTemplate(basketTemplate), events);
	modalCart.goods = cards;
	modalCart.total = cartData.calculateAmount().toString();
	modalCart.setValid(cartData.calculateAmount() != 0);
	modal.content = modalCart.render(cards);
	modal.open();
});

events.on('cart:changed', (card: ICard) => {
	cartData.toggleCard(card);
	page.counter = cartData.calculateCount();	
});

events.on('order:open', () => {
	orderData.lots = cartData.getCards();
	orderData.total = cartData.calculateAmount();
	modal.content = new ModalOrder(cloneTemplate(orderTemplate), events).element;
	modal.open();
})

events.on('order:input', (data: { value: string, payment: 'card' | 'cash' }) => {
	const content = new ModalOrder(cloneTemplate(orderTemplate), events);
	content.showErrors(data.value != '');
	content.setValid((data.value != '') && (data.payment != null));
	content.paymentMethod = data.payment;
	content.value = data.value;
	modal.content = content.element;
	content.focusAddress();
});

events.on('order:changed', (data: { payment: 'card' | 'cash', address: string }) => {
	orderData.setDeliveryInfo(data);
	const content = new ModalContacts(cloneTemplate(contactsTemplate), events);
	modal.content = content.element;
})

events.on('contacts:input', (data: { email: string, phone: string, field: string }) => {
	const content = new ModalContacts(cloneTemplate(contactsTemplate), events);
	content.setValid((data.email != '') && (data.phone != ''));
	content.showErrors((data.email != '') && (data.phone != ''));
	content.phone = data.phone;
	content.email = data.email;
	modal.content = content.element;	
	content.focusAddress(data.field);
})

events.on('contacts:submit', (data: { email: string, phone: string }) => {
	orderData.setClientInfo(data);
	api.postOrder(orderData.orderData).then( () => {
	const content = new ModalSuccess(cloneTemplate(successTemplate), events);
	content.setTotal(cartData.calculateAmount());
	modal.content = content.element;
	cartData.clearCart();
	page.counter = 0;})
	.catch((err) => console.log(err))
})

events.on('modal:close', () => {
	modal.close();
	modal.content = null;
});