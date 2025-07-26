import { ICard, IOrder, IOrderResult } from "../types";
import { Api, ApiListResponse } from "./base/api";

export interface IAppApi {
  getItems: () => Promise<ICard[]>;
}

export class AppApi extends Api implements IAppApi{
  readonly cdn:string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

  getItems(): Promise<ICard[]> {
    return this.get(`/product/`).then((data: ApiListResponse<ICard>) =>
    data.items.map((item) => item)
    );
  }

  postOrder(data: IOrder): Promise<IOrderResult> {
    return this.post(`/order/`, data).then(
      (data: IOrderResult) => data
    );
  }

}