import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CurrencyService {
  constructor(private readonly httpService: HttpService) {}

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    if (fromCurrency === toCurrency) return amount;

    const exchangeRates = await this.fetchExchangeRates(fromCurrency);
    const rate = exchangeRates[toCurrency];

    return amount * rate;
  }

  private async fetchExchangeRates(baseCurrency: string): Promise<any> {
    const response = await this.httpService
      .get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
      .toPromise();
    return response.data.rates;
  }
}
