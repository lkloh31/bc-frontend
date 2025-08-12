import { useEffect, useState } from "react";
import "../styles/pages/exchange.css";

export default function Exchange() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch("http://localhost:3000/daily/exchange");
        if (!res.ok) throw new Error("Failed to fetch exchange rates");
        const data = await res.json();
        setRates(data);
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
