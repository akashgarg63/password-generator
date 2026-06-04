import { useCallback, useState, useEffect, useRef } from "react";
import "./app.jsx";
import "./index.css"

function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let mouse = { x: null, y: null };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener("mouseleave", () => {
      mouse.x = null;
      mouse.y = null;
    });

    const COUNT = 72;
    const CONNECT_DIST = 140;
    const MOUSE_DIST = 180;

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.8,
      hue: Math.random() > 0.5 ? 210 : 270, // blue or purple
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse repel
        if (mouse.x !== null) {
          const dx = p.x - mouse.x,
            dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const force = ((MOUSE_DIST - dist) / MOUSE_DIST) * 0.012;
            p.vx += dx * force;
            p.vy += dy * force;
            // clamp speed
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 2) {
              p.vx = (p.vx / speed) * 2;
              p.vy = (p.vy / speed) * 2;
            }
          }
        }
      });

      // Draw connections
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${particles[i].hue}, 80%, 70%, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
        // Mouse connections
        if (mouse.x !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            const alpha = (1 - dist / MOUSE_DIST) * 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `hsla(210, 90%, 75%, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, 0.7)`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}

function App() {
  const [length, setLength] = useState(12);
  const [numberAllowed, setNumberAllowed] = useState(false);
  const [charAllowed, setCharAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState("Weak");
  const [animating, setAnimating] = useState(false);

  const passwordRef = useRef(null);

  const getStrength = useCallback(
    (pass) => {
      if (pass.length >= 16 && numberAllowed && charAllowed) return "Strong";
      if (pass.length >= 10 && (numberAllowed || charAllowed)) return "Medium";
      return "Weak";
    },
    [numberAllowed, charAllowed],
  );

  const passwordGenerator = useCallback(() => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    let pass = "";
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    if (numberAllowed) str += "0123456789";
    if (charAllowed) str += "!@#$%^&*()_+~";

    for (let i = 0; i < length; i++) {
      const char = Math.floor(Math.random() * str.length);
      pass += str.charAt(char);
    }

    setPassword(pass);
    setStrength(getStrength(pass));
  }, [length, numberAllowed, charAllowed, getStrength]);

  useEffect(() => {
    passwordGenerator();
  }, [length, numberAllowed, charAllowed, passwordGenerator]);

  const copyToClipboard = useCallback(() => {
    passwordRef.current?.select();
    window.navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const strengthColor = {
    Weak: "#ff4d4d",
    Medium: "#f5a623",
    Strong: "#00e676",
  };

  const strengthWidth = {
    Weak: "33%",
    Medium: "66%",
    Strong: "100%",
  };

  return (
    <div className="page-wrapper">
      <ParticleBackground />

      <div className="card">
        {/* Header */}
        <div className="card-header">
          <div className="lock-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="5"
                y="11"
                width="14"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M8 11V7a4 4 0 0 1 8 0v4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <h1 className="title">Password Generator</h1>
          <p className="subtitle">Create secure, random passwords instantly</p>
        </div>

        {/* Password Display */}
        <div className="password-section">
          <div className={`password-box ${animating ? "flash" : ""}`}>
            <input
              type="text"
              value={password}
              readOnly
              ref={passwordRef}
              className="password-input"
              spellCheck={false}
            />
            <button
              onClick={copyToClipboard}
              className={`copy-btn ${copied ? "copied" : ""}`}
              title="Copy to clipboard"
            >
              {copied ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="9"
                    y="9"
                    width="13"
                    height="13"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              )}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>

          {/* Strength Bar */}
          <div className="strength-row">
            <span className="strength-label">Strength</span>
            <div className="strength-bar-track">
              <div
                className="strength-bar-fill"
                style={{
                  width: strengthWidth[strength],
                  background: strengthColor[strength],
                }}
              />
            </div>
            <span
              className="strength-tag"
              style={{ color: strengthColor[strength] }}
            >
              {strength}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          {/* Length Slider */}
          <div className="control-group">
            <div className="control-header">
              <label className="control-label">Password Length</label>
              <span className="length-badge">{length}</span>
            </div>
            <div className="slider-wrapper">
              <input
                type="range"
                min={6}
                max={32}
                value={length}
                className="slider"
                onChange={(e) => setLength(parseInt(e.target.value))}
                style={{ "--pct": `${((length - 6) / 26) * 100}%` }}
              />
              <div className="slider-ticks">
                {[6, 12, 20, 32].map((t) => (
                  <span key={t} className="tick-label">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="toggles-row">
            <label className={`toggle-card ${numberAllowed ? "active" : ""}`}>
              <input
                type="checkbox"
                checked={numberAllowed}
                onChange={() => setNumberAllowed((p) => !p)}
                hidden
              />
              <div className="toggle-icon">123</div>
              <div className="toggle-info">
                <span className="toggle-name">Numbers</span>
                <span className="toggle-desc">0–9</span>
              </div>
              <div className="toggle-switch">
                <div className="toggle-thumb" />
              </div>
            </label>

            <label className={`toggle-card ${charAllowed ? "active" : ""}`}>
              <input
                type="checkbox"
                checked={charAllowed}
                onChange={() => setCharAllowed((p) => !p)}
                hidden
              />
              <div className="toggle-icon">!@#</div>
              <div className="toggle-info">
                <span className="toggle-name">Symbols</span>
                <span className="toggle-desc">!@#$%^</span>
              </div>
              <div className="toggle-switch">
                <div className="toggle-thumb" />
              </div>
            </label>
          </div>
        </div>

        {/* Regenerate Button */}
        <button className="generate-btn" onClick={passwordGenerator}>
          <svg
            className="spin-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 4v6h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 20v-6h-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Generate New Password
        </button>
      </div>
    </div>
  );
}

export default App;
