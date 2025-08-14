// import { useEffect, useState } from "react";
// import "../styles/pages/exchange.css";

// const BASE_URL = "http://localhost:3000/daily/exchange";

// export default function Exchange() {
//   const [rates, setRates] = useState([]);
//   const [currencyOptions, setCurrencyOptions] = useState([]);
//   const [fromCurrency, setFromCurrency] = useState("USD");
//   const [toCurrency, setToCurrency] = useState("EUR");
//   const [amount, setAmount] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [convertedAmount, setConvertedAmount] = useState(0);

//   // Load filter from localStorage
//   const [filter, setFilter] = useState(() => {
//     return localStorage.getItem("currencyFilter") || "";
//   });

//   // Save filter to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem("currencyFilter", filter);
//   }, [filter]);

//   useEffect(() => {
//     async function fetchRates() {
//       try {
//         const res = await fetch(BASE_URL);
//         if (!res.ok) throw new Error("Failed to fetch exchange rates");
//         const data = await res.json();
//         console.log(data);
//         setRates(data);

//         // Build unique currency list
//         const currencies = Array.from(
//           new Set(
//             data
//               .map((rate) => rate.base_currency)
//               .concat(data.map((rate) => rate.currency_code))
//           )
//         );
//         setCurrencyOptions(currencies);

//         // Default selections
//         setFromCurrency(data[0].base_currency);
//         setToCurrency(data[0].currency_code);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchRates();
//   }, []);

//   if (loading) return <p className="exchange-loading">Loading rates...</p>;
//   if (error) return <p className="exchange-error">{error}</p>;

//   // Convert function
//   const convert = (amount, from, to) => {
//     if (!rates.length) return 0;
//     const fromRate = rates.find(
//       (r) => r.currency_code === from || r.base_currency === from
//     );
//     const toRate = rates.find(
//       (r) => r.currency_code === to || r.base_currency === to
//     );

//     if (!fromRate || !toRate) return 0;

//     // Convert to base currency first
//     const baseAmount =
//       from === fromRate.base_currency
//         ? amount
//         : amount / fromRate.exchange_rate;

//     const converted =
//       to === toRate.base_currency
//         ? baseAmount
//         : baseAmount * toRate.exchange_rate;

//     return converted.toFixed(2);
//   };

//   return (
//     <div className="exchange-container">
//       <div className="converter">
//         <h1 style={{ marginTop: "20px" }}>Currency Converter</h1>
//         <div className="converter-row">
//           <input
//             type="number"
//             value={amount || ""}
//             onChange={(e) => setAmount(Number(e.target.value))}
//           />
//           <select
//             value={fromCurrency}
//             onChange={(e) => setFromCurrency(e.target.value)}
//           >
//             {currencyOptions.map((c) => (
//               <option key={c} value={c}>
//                 {c}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="equals">=</div>
//         <div className="converter-row">
//           <input
//             type="number"
//             value={amount ? convert(amount, fromCurrency, toCurrency) : ""}
//             readOnly
//           />
//           <select
//             value={toCurrency}
//             onChange={(e) => setToCurrency(e.target.value)}
//           >
//             {currencyOptions.map((c) => (
//               <option key={c} value={c}>
//                 {c}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <h2 className="exchange-title">Exchange Rates Table</h2>

//       {/* Filter input */}
//       <input
//         type="text"
//         placeholder="Filter currency..."
//         value={filter}
//         onChange={(e) => setFilter(e.target.value)}
//         style={{ marginBottom: "10px", padding: "5px" }}
//       />

//       <table className="exchange-table">
//         <thead>
//           <tr>
//             <th>Currency</th>
//             <th>Rate</th>
//             <th>Base</th>
//             <th>Last Updated</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rates
//             .filter(
//               (rate) =>
//                 rate.currency_code
//                   .toLowerCase()
//                   .includes(filter.toLowerCase()) ||
//                 rate.base_currency.toLowerCase().includes(filter.toLowerCase())
//             )
//             .map((rate) => (
//               <tr key={rate.currency_code}>
//                 <td>{rate.currency_code}</td>
//                 <td>{rate.exchange_rate}</td>
//                 <td>{rate.base_currency}</td>
//                 <td>{new Date(rate.last_updated).toLocaleString()}</td>
//               </tr>
//             ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import "../styles/pages/exchange.css";

const BASE_URL = "http://localhost:3000/daily/exchange";

export default function Exchange() {
  const [rates, setRates] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [filter, setFilter] = useState(() => {
    return localStorage.getItem("currencyFilter") || "";
  });

  // Favourites state
  const [favourites, setFavourites] = useState(() => {
    const saved = localStorage.getItem("favourites");
    return saved ? JSON.parse(saved) : [];
  });

  // Save filter & favourites
  useEffect(() => {
    localStorage.setItem("currencyFilter", filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error("Failed to fetch exchange rates");
        const data = await res.json();
        setRates(data);

        // Build unique currency list
        const currencies = Array.from(
          new Set(
            data
              .map((rate) => rate.base_currency)
              .concat(data.map((rate) => rate.currency_code))
          )
        );
        setCurrencyOptions(currencies);

        // Default selections
        setFromCurrency(data[0].base_currency);
        setToCurrency(data[0].currency_code);
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

  // Convert function
  const convert = (amount, from, to) => {
    if (!rates.length) return 0;
    const fromRate = rates.find(
      (r) => r.currency_code === from || r.base_currency === from
    );
    const toRate = rates.find(
      (r) => r.currency_code === to || r.base_currency === to
    );

    if (!fromRate || !toRate) return 0;

    const baseAmount =
      from === fromRate.base_currency
        ? amount
        : amount / fromRate.exchange_rate;

    const converted =
      to === toRate.base_currency
        ? baseAmount
        : baseAmount * toRate.exchange_rate;

    return converted.toFixed(2);
  };

  // Add to favourites
  const addFavourite = (currencyCode) => {
    if (!favourites.includes(currencyCode)) {
      setFavourites([...favourites, currencyCode]);
    }
  };

  // Remove from favourites
  const removeFavourite = (currencyCode) => {
    setFavourites(favourites.filter((c) => c !== currencyCode));
  };

  return (
    <div className="exchange-container">
      {/* Converter */}
      <div className="converter">
        <h1 style={{ marginTop: "20px" }}>Currency Converter</h1>
        <div className="converter-row">
          <input
            className="converter-input"
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          >
            {currencyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="equals">=</div>
        <div className="converter-row">
          <input
            className="converter-input"
            type="number"
            value={amount ? convert(amount, fromCurrency, toCurrency) : ""}
            readOnly
          />
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            {currencyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Favourites Table */}
      {favourites.length > 0 && (
        <>
          <h2 className="exchange-title">⭐ Favourite Currencies</h2>
          <table className="exchange-table">
            <thead>
              <tr>
                <th>Currency</th>
                <th>Rate</th>
                <th>Base</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rates
                .filter((rate) => favourites.includes(rate.currency_code))
                .map((rate) => (
                  <tr key={rate.currency_code}>
                    <td>{rate.currency_code}</td>
                    <td>{rate.exchange_rate}</td>
                    <td>{rate.base_currency}</td>
                    <td>{new Date(rate.last_updated).toLocaleString()}</td>
                    <td>
                      <button
                        onClick={() => removeFavourite(rate.currency_code)}
                      >
                        ❌ Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}

      {/* Main Table */}
      <h2 className="exchange-title">Exchange Rates Table</h2>
      <input
        type="text"
        placeholder="Filter currency..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px" }}
      />

      <table className="exchange-table">
        <thead>
          <tr>
            <th>Currency</th>
            <th>Rate</th>
            <th>Base</th>
            <th>Last Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rates
            .filter(
              (rate) =>
                rate.currency_code
                  .toLowerCase()
                  .includes(filter.toLowerCase()) ||
                rate.base_currency.toLowerCase().includes(filter.toLowerCase())
            )
            .map((rate) => (
              <tr key={rate.currency_code}>
                <td>{rate.currency_code}</td>
                <td>{rate.exchange_rate}</td>
                <td>{rate.base_currency}</td>
                <td>{new Date(rate.last_updated).toLocaleString()}</td>
                <td>
                  <button onClick={() => addFavourite(rate.currency_code)}>
                    ⭐ Add
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
