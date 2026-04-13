import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";
import "../styles/splash.css";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [navigate]);

  return (
    <main className="splash-shell">
      <section className="splash-panel">
        <div className="splash-badge">Work Immersion System</div>
        <h1>Teacher and Student Portal</h1>
        <p>Loading your workspace...</p>

        <Loader label="Preparing your portal" />
      </section>
    </main>
  );
};

export default Splash;
