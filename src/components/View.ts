import { CategoryType, ICard, Type } from '../types';
import { CDN_URL } from '../utils/constants';
import { cloneTemplate, createElement, ensureElement } from '../utils/utils';
import { EventEmitter, IEvents } from './base/events';

const CategoryClassMap: Record<CategoryType, string> = {
	'софт-скил': 'card__category_soft',
	'хард-скил': 'card__category_hard',
	дополнительное: 'card__category_additional',
	другое: 'card__category_other',
	кнопка: 'card__category_button',
};

export class Modal {
	protected _content: HTMLElement;
	protected _closeBtn: HTMLButtonElement;
	protected container: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		this.container = container;
		this._closeBtn = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);
		this._closeBtn.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (event) => event.stopPropagation());
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open() {
		this.container.classList.add('modal_active');
		document.body.classList.add('modal-open');
	}

	close() {
		this.container.classList.remove('modal_active');
		document.body.classList.remove('modal-open');
		this._content.replaceChildren();
	}
}

export class CardCatalog {
	element: HTMLElement;
	button: HTMLButtonElement;
	category: HTMLElement;

	constructor(card: ICard, element: HTMLElement, events: EventEmitter) {
		this.element = element;
		this.button = this.element as HTMLButtonElement;
		this.category = ensureElement('.card__category', this.element);
		ensureElement<HTMLImageElement>('.card__image', this.element).src =
			CDN_URL + card.image;
		ensureElement('.card__title', this.element).textContent = card.title;
		this.category.textContent = card.category;
		const category = card.category as CategoryType;
		this.category.classList.add(CategoryClassMap[category]);
		ensureElement('.card__price', this.element).textContent =
			card.price !== null ? `${card.price} синапсов` : 'Бесценно';
		this.button.addEventListener('click', () => {
			events.emit('card:preview', card);
		});
	}

	static createList(
		cards: ICard[],
		template: HTMLTemplateElement,
		events: EventEmitter
	): HTMLElement[] {
		return cards.map((card) => {
			const clone = cloneTemplate(template) as HTMLElement;
			const instance = new CardCatalog(card, clone, events);
			return instance.element;
		});
	}
}

export class CardPreview {
	element: HTMLElement;
	button: HTMLButtonElement;
	private inCart: boolean;
	category: HTMLElement;
	image: HTMLImageElement;
	title: HTMLElement;
	price: HTMLElement;
	description: HTMLElement;
	private card: ICard;

	constructor(
		element: HTMLElement,
		protected events: EventEmitter
	) {
		this.element = element;
		this.button = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.element
		);
		this.category = ensureElement('.card__category', this.element);
		this.image = ensureElement<HTMLImageElement>('.card__image', this.element);	 
		this.title = ensureElement('.card__title', this.element);
		this.price = ensureElement('.card__price', this.element);
		this.description = ensureElement('.card__text', this.element);		
		
		this.button.addEventListener('click', () => {
		events.emit('card:toggle', this.card);
		});	}

	updateButton(): void {
		this.button.textContent = this.inCart ? 'Убрать из корзины' : 'В корзину';
	}

	set InCart(value: boolean) {
		this.inCart = value;
		this.updateButton();
	}

	render(card:ICard){
		this.card = card;
		this.category.textContent = card.category;
		const category = card.category as CategoryType;
		this.category.classList.add(CategoryClassMap[category]);
		this.image.src = CDN_URL + card.image;
		this.title.textContent = card.title;
		this.price.textContent = card.price !== null ? `${card.price} синапсов` : 'Бесценно';
		this.description.textContent = card.description;
	}
}

export class CardBasket {
	element: HTMLElement;
	button: HTMLButtonElement;
	counter: HTMLElement;

	constructor(
		card: ICard,
		element: HTMLElement,
		index: number,
		protected events: EventEmitter
	) {
		this.element = element;
		this.button = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.element
		);
		this.counter = ensureElement<HTMLElement>(
			'.basket__item-index',
			this.element
		);
		ensureElement('.card__title', this.element).textContent = card.title;
		ensureElement('.card__price', this.element).textContent =
			card.price !== null ? `${card.price} синапсов` : 'Бесценно';
		this.counter.textContent = index.toString();
		this.button.addEventListener('click', () => {
			this.events.emit('card:toggle', card);
		});
	}

	static createList(
		cards: ICard[],
		template: HTMLTemplateElement,
		events: EventEmitter
	): HTMLElement[] {
		if (cards) {
			return cards.map((card, index) => {
				const clone = cloneTemplate(template) as HTMLElement;
				const instance = new CardBasket(card, clone, index + 1, events);
				return instance.element;
			});
		}
	}

	setIndex(index: number) {
		const indexElement = ensureElement('.basket__item-index', this.element);
		indexElement.textContent = String(index);
	}
}

export class ModalCart {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;
	protected items: HTMLElement[];
	container: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		this.container = container;
		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}
		this.items = [];
	}

	set total(total: string) {
		this._total.textContent = total;
	}

	set goods(items: HTMLElement[]) {
		if (items && items.length > 0) {
			this._list.replaceChildren(...items);
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
	}

	setValid(isValid: boolean): void {
		if (this._button) {
			this._button.disabled = !isValid;
		}
	}

	render(items: HTMLElement[]): HTMLElement {
		this.goods = items;
		return this.container;
	}
}

export class ModalOrder {
	element: HTMLFormElement;
	buttonCard: HTMLButtonElement;
	buttonCash: HTMLButtonElement;
	fieldAddress: HTMLInputElement;
	submitBtn: HTMLButtonElement;
	errorMessage: HTMLElement;

	constructor(template: HTMLFormElement, events: EventEmitter) {
		this.element = template;

		this.buttonCard = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.element
		);
		this.buttonCash = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.element
		);
		this.fieldAddress = ensureElement<HTMLInputElement>(
			'input[name="address"]',
			this.element
		);
		this.submitBtn = ensureElement<HTMLButtonElement>(
			'.order__button',
			this.element
		);
		this.errorMessage = ensureElement<HTMLElement>(
			'.form__errors',
			this.element
		);
		this.buttonCard.addEventListener('click', () => {
			this.setActive(this.buttonCard);
			this.setInactive(this.buttonCash);
			events.emit('order:input', {
				value: this.fieldAddress.value,
				payment: this.getPaymentMethod(),
			});
		});
		this.buttonCash.addEventListener('click', () => {
			this.setActive(this.buttonCash);
			this.setInactive(this.buttonCard);
			events.emit('order:input', {
				value: this.fieldAddress.value,
				payment: this.getPaymentMethod(),
			});
		});
		this.fieldAddress.addEventListener('input', () => {
			events.emit('order:input', {
				value: this.fieldAddress.value,
				payment: this.getPaymentMethod(),
			});
		});
		this.submitBtn.addEventListener('click', () => {
			events.emit('order:changed', {
				payment: this.getPaymentMethod(),
				address: this.fieldAddress.value,
			});
		});
	}

	setValid(isValid: boolean): void {
		this.submitBtn.disabled = !isValid;
	}

	showErrors(isValid: boolean): void {
		this.errorMessage.textContent = isValid
			? ''
			: 'Пожалуйста, заполните все поля.';
	}

	setActive(button: HTMLElement): void {
		button.classList.add('button_alt-active');
	}

	setInactive(button: HTMLElement): void {
		button.classList.remove('button_alt-active');
	}

	getPaymentMethod(): string | null {
		if (this.buttonCard.classList.contains('button_alt-active')) {
			return 'card';
		} else if (this.buttonCash.classList.contains('button_alt-active')) {
			return 'cash';
		} else {
			return null;
		}
	}

	clearValues() {
		this.fieldAddress.value = '';
		this.setInactive(this.buttonCard);
		this.setInactive(this.buttonCash);
	}
}

export class ModalContacts {
	element: HTMLFormElement;
	private fieldEmail: HTMLInputElement;
	private fieldPhone: HTMLInputElement;
	private submitBtn: HTMLButtonElement;
	private errorMessage: HTMLElement;

	constructor(template: HTMLFormElement, events: EventEmitter) {
		this.element = template;

		this.fieldEmail = ensureElement<HTMLInputElement>(
			'input[name="email"]',
			this.element
		);
		this.fieldPhone = ensureElement<HTMLInputElement>(
			'input[name="phone"]',
			this.element
		);
		this.submitBtn = ensureElement<HTMLButtonElement>(
			'button[type="submit"]',
			this.element
		);
		this.errorMessage = ensureElement<HTMLElement>(
			'.form__errors',
			this.element
		);

		this.fieldEmail.addEventListener('input', () => {
			events.emit('contacts:input', {
				email: this.fieldEmail.value,
				phone: this.fieldPhone.value,
				field: 'email',
			});
		});

		this.fieldPhone.addEventListener('input', () => {
			events.emit('contacts:input', {
				email: this.fieldEmail.value,
				phone: this.fieldPhone.value,
				field: 'phone',
			});
		});

		this.element.addEventListener('submit', (event) => {
			event.preventDefault();
			events.emit('contacts:submit', {
				email: this.fieldEmail.value,
				phone: this.fieldPhone.value,
			});
		});
	}



	setValid(isValid: boolean): void {
		this.submitBtn.disabled = !isValid;
	}

	showErrors(isValid: boolean): void {
		this.errorMessage.textContent = isValid
			? ''
			: 'Пожалуйста, заполните все поля.';
	}

	clearValues() {
		this.fieldEmail.value = '';
		this.fieldPhone.value = '';
	}
}

export class ModalSuccess {
	element: HTMLElement;
	private total: HTMLElement;
	private submitBtn: HTMLButtonElement;

	constructor(template: HTMLElement, events: EventEmitter) {
		this.element = template;
		this.total = ensureElement<HTMLElement>(
			'.order-success__description',
			this.element
		);
		this.submitBtn = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.element
		);

		this.submitBtn.addEventListener('click', () => {
			events.emit('modal:close');
		});
	}

	setTotal(amount: number): void {
		this.total.textContent = `Списано ${amount} синапсов`;
	}
}

export class MainPage {
	private wrapper: HTMLElement;
	private _catalog: HTMLElement;
	private cart: HTMLElement;
	private cartCounter: HTMLElement;

	constructor( protected events: IEvents) {

		this.wrapper = ensureElement<HTMLElement>('.page__wrapper');
		this._catalog = ensureElement<HTMLElement>('.gallery', this.wrapper);
		this.cart = ensureElement<HTMLElement>('.header__basket', this.wrapper);
		this.cartCounter = ensureElement<HTMLElement>(
			'.header__basket-counter',
			this.wrapper
		);
		this.cart.addEventListener('click', () => {
			events.emit('cart:open');
		});
	}

	set counter(value: number) {
		this.cartCounter.textContent = String(value);
	}

	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}
}
