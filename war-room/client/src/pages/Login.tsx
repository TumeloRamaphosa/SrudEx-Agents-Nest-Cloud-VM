import { FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import studexLogoGold from "@assets/studex-logo-gold.png";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#faf8f4" }}
    >
      <section
        className="w-full max-w-md p-8 sm:p-10"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(166,138,46,0.25)",
          boxShadow: "0 12px 35px rgba(70,55,20,0.08)",
        }}
      >
        <div className="text-center mb-8">
          <img src={studexLogoGold} alt="StudEx Meat" className="w-14 h-14 object-contain mx-auto mb-4" />
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: "italic",
              fontSize: "36px",
              color: "#1a1710",
              lineHeight: 1.1,
            }}
          >
            War Room
          </p>
          <p
            className="mt-3"
            style={{
              fontSize: "9px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#7a6e52",
            }}
          >
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="block mb-2" style={labelStyle}>Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              className="w-full px-3 py-2.5 outline-none"
              style={inputStyle}
            />
          </label>
          <label className="block">
            <span className="block mb-2" style={labelStyle}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="w-full px-3 py-2.5 outline-none"
              style={inputStyle}
            />
          </label>
          {error && (
            <p role="alert" style={{ color: "#c14e3c", fontSize: "12px" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 transition-colors disabled:opacity-60"
            style={{
              background: "#a68a2e",
              color: "#ffffff",
              fontSize: "10px",
              letterSpacing: "3px",
              textTransform: "uppercase",
            }}
          >
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}

const labelStyle = {
  color: "#7a6e52",
  fontSize: "10px",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
};

const inputStyle = {
  background: "#faf8f4",
  border: "1px solid rgba(166,138,46,0.25)",
  color: "#1a1710",
  fontSize: "14px",
};
