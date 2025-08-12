import { useAuth } from "../auth/AuthContext";
import UserWeather from "../components/UserWeather";
import "../styles/pages/daily.css";

export default function DailyDose() {
  const { token } = useAuth();

  return (
    <div className="daily">
      <h1 className="daily__title">Daily dose</h1>

      {/* Guard strip that sits just under the header */}
      <div className="daily__guard" aria-hidden="true" />

      {token ? (
        <section className="daily__section">
          <UserWeather />
        </section>
      ) : (
        <p className="daily__login-msg">
          Please log in to see weather for your saved location.
        </p>
      )}
    </div>
  );
}