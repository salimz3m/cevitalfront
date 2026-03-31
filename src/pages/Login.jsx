import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;600;700&display=swap');
  :root {
    --red: #e63946; --dark: #080808; --dark2: #111; --dark3: #1a1a1a;
    --ease: cubic-bezier(0.23,1,0.32,1);
  }
  .lp-login-wrap {
    min-height: 100vh; display: flex;
    font-family: 'DM Sans', sans-serif;
    background: var(--dark); color: #fff;
  }
  /* Panneau gauche image */
  .lp-login-left {
    flex: 1; position: relative; overflow: hidden;
    display: none;
  }
  @media(min-width:900px){ .lp-login-left { display: block; } }
  .lp-login-left-img {
    position: absolute; inset: 0;
    background-image: url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80');
    background-size: cover; background-position: center;
  }
  .lp-login-left-img::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(8,8,8,.92) 0%, rgba(8,8,8,.5) 60%, rgba(230,57,70,.15) 100%);
  }
  .lp-login-left-content {
    position: relative; z-index: 1;
    height: 100%; display: flex; flex-direction: column;
    justify-content: space-between; padding: 48px;
  }
  .lp-login-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem; letter-spacing: .1em;
  }
  .lp-login-logo span { color: var(--red); }
  .lp-login-left-bottom h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2.5rem, 5vw, 4rem);
    letter-spacing: .05em; line-height: 1;
    text-transform: uppercase; margin-bottom: 16px;
  }
  .lp-login-left-bottom h2 span {
    -webkit-text-stroke: 1px rgba(255,255,255,.25); color: transparent;
  }
  .lp-login-left-bottom p {
    font-size: .95rem; color: rgba(255,255,255,.55); line-height: 1.7; max-width: 380px;
  }
  .lp-login-left-line {
    width: 48px; height: 2px; background: var(--red); margin-bottom: 20px;
  }
  /* Panneau droit form */
  .lp-login-right {
    width: 100%; max-width: 520px;
    display: flex; align-items: center; justify-content: center;
    padding: 48px 40px;
    background: var(--dark2);
  }
  @media(min-width:900px){ .lp-login-right { border-left: 1px solid rgba(255,255,255,.06); } }
  .lp-login-form-wrap { width: 100%; max-width: 400px; }
  .lp-login-form-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.6rem; letter-spacing: .1em; margin-bottom: 8px;
  }
  .lp-login-form-logo span { color: var(--red); }
  .lp-login-form-sub {
    font-size: .8rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .25em; color: rgba(255,255,255,.3);
    margin-bottom: 48px;
  }
  .lp-login-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem; letter-spacing: .05em; text-transform: uppercase;
    margin-bottom: 8px;
  }
  .lp-login-subtitle {
    font-size: .88rem; color: rgba(255,255,255,.45); margin-bottom: 40px;
  }
  .lp-login-error {
    background: rgba(230,57,70,.1); border: 1px solid rgba(230,57,70,.3);
    color: #ff6b6b; padding: 12px 16px;
    font-size: .82rem; margin-bottom: 24px;
    display: flex; align-items: center; gap: 10px;
  }
  .lp-field { margin-bottom: 24px; }
  .lp-label {
    display: block; font-size: .65rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .25em;
    color: rgba(255,255,255,.35); margin-bottom: 10px;
  }
  .lp-input {
    width: 100%;
    background: var(--dark3); border: 1px solid rgba(255,255,255,.08);
    color: #fff; padding: 14px 18px;
    font-family: 'DM Sans', sans-serif; font-size: .92rem;
    outline: none; transition: border-color .3s;
  }
  .lp-input:focus { border-color: var(--red); }
  .lp-input::placeholder { color: rgba(255,255,255,.2); }
  .lp-submit {
    width: 100%; background: var(--red); color: #fff;
    border: none; padding: 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: .72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: .25em;
    cursor: pointer; transition: all .35s var(--ease);
    display: flex; align-items: center; justify-content: center; gap: 10px;
    margin-top: 32px;
  }
  .lp-submit:hover:not(:disabled) { background: #fff; color: var(--dark); }
  .lp-submit:disabled { opacity: .5; cursor: not-allowed; }
  .lp-back {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: .7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: .2em; color: rgba(255,255,255,.3);
    text-decoration: none; margin-top: 32px;
    transition: color .3s;
  }
  .lp-back:hover { color: rgba(255,255,255,.7); }
`;

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      const redirects = {
        keep_contact: "/dashboard",
        planification: "/planification",
        transport: "/livreur",
        admin: "/dashboard",
      };
      navigate(redirects[data.user.role] || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-login-wrap">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      />

      {/* Gauche */}
      <div className="lp-login-left">
        <div className="lp-login-left-img" />
        <div className="lp-login-left-content">
          <div className="lp-login-logo">
            LOGI<span>PLATFORM</span>
          </div>
          <div className="lp-login-left-bottom">
            <div className="lp-login-left-line" />
            <h2>
              GÉRER.
              <br />
              PLANIFIER.
              <br />
              <span>LIVRER.</span>
            </h2>
            <p>
              Centralisez vos commandes, optimisez vos livraisons et connectez
              vos équipes en temps réel.
            </p>
          </div>
        </div>
      </div>

      {/* Droite */}
      <div className="lp-login-right">
        <div className="lp-login-form-wrap">
          <div className="lp-login-form-logo">
            LOGI<span>PLATFORM</span>
          </div>
          <div className="lp-login-form-sub">
            Gestion Logistique Collaborative
          </div>

          <div className="lp-login-title">Connexion</div>
          <div className="lp-login-subtitle">
            Accédez à votre espace de travail
          </div>

          {error && (
            <div className="lp-login-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="lp-field">
              <label className="lp-label">Adresse Email</label>
              <input
                className="lp-input"
                type="email"
                required
                placeholder="vous@entreprise.dz"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="lp-field">
              <label className="lp-label">Mot de passe</label>
              <input
                className="lp-input"
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button type="submit" className="lp-submit" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Connexion...
                </>
              ) : (
                <>
                  <span>Accéder à la plateforme</span>
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <a
            href="/"
            className="lp-back"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            <i className="fas fa-arrow-left"></i> Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
