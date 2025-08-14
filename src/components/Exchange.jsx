import { useEffect, useState } from "react";
import "../styles/pages/exchange.css";
import Converter from "./Converter";

const BASE_URL = "http://localhost:3000/daily/exchange";

export default function Exchange() {
  const [rates, setRates] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [fromCurrency, setFromCurrency] = useState();
  const [toCurrency, setToCurrency] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error("Failed to fetch exchange rates");

        const data = await res.json(); // data is now an array
        console.log(data);

        setRates(data);

        // Safely get currency options from the first record
        const firstRate = data[0];
        const uniqueCurrencies = Array.from(
          new Set([
            firstRate.base_currency,
            ...data.map((r) => r.currency_code),
          ])
        );
        setCurrencyOptions(uniqueCurrencies);
        setFromCurrency(firstRate.base_currency);
        setToCurrency(firstRate.currency_code);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, []);

  if (loading) return <p className="exchange-loading">Loading rates...</p>;
  if (error) return <p className="exchange-error">{error}</p>;

  return (
    <div className="exchange-container">
      <div className="converter">
        <h1>Converter</h1>
        {/* Pass currencyOptions into the Converter */}
        <Converter
          currencyOptions={currencyOptions}
          selectedCurrency={fromCurrency}
        />
        <div className="equals">=</div>
        <Converter
          currencyOptions={currencyOptions}
          selectedCurrency={toCurrency}
        />
      </div>
      <h2 className="exchange-title">Exchange Rates</h2>
      <table className="exchange-table">
        <thead>
          <tr>
            <th>Currency</th>
            <th>Rate</th>
            <th>Base</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate) => (
            <tr key={rate.currency_code}>
              <td>{rate.currency_code}</td>
              <td>{rate.exchange_rate}</td>
              <td>{rate.base_currency}</td>
              <td>{new Date(rate.last_updated).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
