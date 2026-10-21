import { useState } from "react";
import {
  Check,
  Code2,
  Layers,
  Mic,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const previews = [
  "Product workspace",
  "Intelligent operations",
  "Connected commerce",
];

/** Original interface concepts. Not client work or live business activity. */
export function ProductVisual({
  compact = false,
  variant = 0,
}: {
  compact?: boolean;
  variant?: number;
}) {
  const [selected, setSelected] = useState(variant % 3);
  const [playing, setPlaying] = useState(false);
  return (
    <div
      className={`product-scene ${compact ? "product-scene-compact" : ""} product-theme-${variant % 5}`}
    >
      <div className="scene-orbit" aria-hidden="true" />
      <div className="product-window">
        <div className="window-toolbar">
          <span className="window-dots" aria-hidden="true">
            ● ● ●
          </span>
          <span>codesboxs / studio</span>
          <ShieldCheck size={15} />
        </div>
        <div className="workspace-layout">
          <div className="workspace-rail" aria-hidden="true">
            <Code2 />
            <Layers size={17} />
            <Sparkles size={17} />
            <Code2 size={17} />
            <span>CB</span>
          </div>
          <div className="workspace-main">
            <span className="mock-label">CONCEPT WORKSPACE · SAMPLE DATA</span>
            <h3>{previews[selected]}</h3>
            <div className="workspace-stats">
              <div>
                <span>Workspace</span>
                <strong>
                  {
                    ["Product overview", "AI assistant", "Digital storefront"][
                      selected
                    ]
                  }
                </strong>
              </div>
              <div>
                <span>Environment</span>
                <strong>
                  <i className="sample-dot" /> Sandbox
                </strong>
              </div>
            </div>
            {selected === 0 ? (
              <div className="mock-chart">
                <div>
                  <span>Delivery activity</span>
                  <span>Illustrative data</span>
                </div>
                <svg
                  viewBox="0 0 400 145"
                  role="img"
                  aria-label="Illustrative activity curve, not business performance"
                >
                  <path d="M0 35H400M0 75H400M0 115H400" stroke="#ffffff18" />
                  <path
                    d="M0 120C35 125 45 85 80 95S130 125 160 75 205 90 240 55 285 80 320 35 365 45 400 12V145H0Z"
                    fill="#c8754525"
                  />
                  <path
                    d="M0 120C35 125 45 85 80 95S130 125 160 75 205 90 240 55 285 80 320 35 365 45 400 12"
                    fill="none"
                    stroke="#d99469"
                    strokeWidth="3"
                  />
                </svg>
              </div>
            ) : selected === 1 ? (
              <div className="mock-conversation">
                <p>How do we connect support to our knowledge base?</p>
                <p>
                  <Sparkles size={16} /> Retrieve approved content. Draft a
                  response. Route it for human review.
                </p>
                <div className="workflow-mini">
                  Knowledge → AI draft → Human review
                </div>
              </div>
            ) : (
              <div className="mock-store">
                {[
                  "Ceramic collection",
                  "Everyday essentials",
                  "Studio objects",
                ].map((name, i) => (
                  <div key={name}>
                    <div
                      className={`store-object object-${i}`}
                      aria-hidden="true"
                    />
                    <span>{name}</span>
                    <small>Concept product</small>
                  </div>
                ))}
              </div>
            )}
            <div className="workspace-task">
              <Check size={16} />
              <div>
                <strong>Designed to work together</strong>
                <span>Interface · integration · infrastructure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!compact && (
        <>
          <div className="floating-voice">
            <Mic size={20} />
            <div>
              <strong>Voice agent</strong>
              <span>Visual demonstration</span>
            </div>
            <div
              className={`voice-wave ${playing ? "is-playing" : ""}`}
              aria-hidden="true"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <button
              type="button"
              aria-label={
                playing ? "Pause waveform animation" : "Play waveform animation"
              }
              aria-pressed={playing}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? "Ⅱ" : <Play size={15} />}
            </button>
          </div>
          <div className="floating-build">
            <ShieldCheck size={20} />
            <span>
              Thoughtful design.
              <br />
              <strong>Production-minded engineering.</strong>
            </span>
          </div>
          <div
            className="preview-switcher"
            aria-label="Product concept previews"
          >
            {["Software & SaaS", "AI & automation", "Digital storefront"].map(
              (label, i) => (
                <button
                  type="button"
                  key={label}
                  aria-pressed={selected === i}
                  onClick={() => setSelected(i)}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function ServiceVisual({ index }: { index: number }) {
  const mode = [0, 1, 2, 3, 2, 0, 0, 4, 2, 5][index % 10];
  return (
    <svg
      className={`service-illustration illustration-${mode}`}
      viewBox="0 0 520 260"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`light-${index}`}>
          <stop stopColor="#c87545" stopOpacity=".35" />
          <stop offset="1" stopColor="#c87545" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="520" height="260" fill="#201e1b" />
      <ellipse
        cx={330 - index * 5}
        cy="120"
        rx="240"
        ry="170"
        fill={`url(#light-${index})`}
      />
      {mode === 0 && (
        <g transform="translate(65 28)">
          <rect width="380" height="212" rx="9" fill="#f5f1e9" />
          <path d="M0 25H380" stroke="#d8d1c6" />
          <circle cx="13" cy="13" r="3" fill="#c87545" />
          <path d="M25 13H65M280 13H355" stroke="#b7a68e" strokeWidth="3" />
          <rect x="18" y="44" width="176" height="150" rx="5" fill="#292724" />
          <text x="32" y="77" fill="#e6d5b8" fontSize="13">
            Build something
          </text>
          <text x="32" y="103" fill="#e6d5b8" fontSize="21">
            remarkable.
          </text>
          <rect x="32" y="150" width="90" height="23" rx="3" fill="#c87545" />
          <rect x="210" y="44" width="150" height="90" rx="5" fill="#d8d1c6" />
          <path
            d="M230 112l30-45 30 25 20-17 30 37"
            fill="none"
            stroke="#967653"
            strokeWidth="4"
          />
          <path
            d="M212 155h145M212 171h115M212 187h90"
            stroke="#b7a68e"
            strokeWidth="4"
          />
        </g>
      )}
      {mode === 1 && (
        <g stroke="#b98b65">
          <path
            d="M112 130H350M230 88V46H350M230 172V214H350"
            fill="none"
            strokeDasharray="5 6"
          />
          <rect x="60" y="102" width="80" height="56" rx="12" fill="#302923" />
          <rect x="195" y="88" width="90" height="84" rx="20" fill="#39312a" />
          {[21, 105, 189].map((y) => (
            <rect
              key={y}
              x="350"
              y={y}
              width="100"
              height="50"
              rx="9"
              fill="#302923"
            />
          ))}
          <path
            d="M222 111h35v35h-35zM229 122h4m12 0h4M230 135h18M238 101v-9"
            stroke="#e6d5b8"
            strokeWidth="3"
            fill="none"
          />
          <text x="77" y="135" fontSize="11" fill="#e6d5b8" stroke="none">
            INPUT
          </text>
          {[51, 135, 219].map((y) => (
            <path
              key={y}
              d={`M370 ${y - 8}h55m-55 8h35`}
              stroke="#e6d5b8"
              strokeWidth="3"
            />
          ))}
        </g>
      )}
      {mode === 2 && (
        <g transform="translate(60 28)">
          <rect
            width="400"
            height="212"
            rx="9"
            fill="#242320"
            stroke="#705943"
          />
          <rect width="72" height="212" rx="9" fill="#181715" />
          <path
            d="M17 28h38M17 58h31M17 78h24M17 98h29"
            stroke="#a18d76"
            strokeWidth="4"
          />
          <text x="90" y="34" fontSize="12" fill="#e6d5b8">
            Workspace overview
          </text>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${90 + i * 98} 53)`}>
              <rect width="86" height="48" rx="5" fill="#39312a" />
              <path d="M12 15h35M12 31h55" stroke="#bf9879" strokeWidth="4" />
            </g>
          ))}
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect
                x="90"
                y={116 + i * 20}
                width="282"
                height="14"
                rx="3"
                fill={i % 2 ? "#35302a" : "#2d2924"}
              />
              <circle cx="101" cy={123 + i * 20} r="3" fill="#c87545" />
              <path
                d={`M114 ${123 + i * 20}h130`}
                stroke="#a18d76"
                strokeWidth="2"
              />
            </g>
          ))}
        </g>
      )}
      {mode === 3 && (
        <g>
          <rect
            x="147"
            y="12"
            width="112"
            height="239"
            rx="23"
            fill="#171614"
            stroke="#a18d76"
            strokeWidth="2"
          />
          <rect x="156" y="21" width="94" height="221" rx="17" fill="#e6d5b8" />
          <rect x="179" y="20" width="48" height="13" rx="6" fill="#171614" />
          <text x="168" y="63" fontSize="12" fill="#292724">
            Your next move.
          </text>
          <rect x="166" y="78" width="74" height="67" rx="7" fill="#8b583a" />
          <path
            d="M178 128l12-25 17 12 20-24"
            fill="none"
            stroke="#f5f1e9"
            strokeWidth="3"
          />
          <path
            d="M168 166h63M168 181h48M168 196h59"
            stroke="#967653"
            strokeWidth="4"
          />
          <rect
            x="281"
            y="60"
            width="96"
            height="168"
            rx="19"
            fill="#292724"
            stroke="#a18d76"
          />
          <circle cx="329" cy="123" r="27" fill="#c87545" />
          <path
            d="M316 124l9 9 17-21"
            fill="none"
            stroke="#f5f1e9"
            strokeWidth="3"
          />
          <path d="M299 178h59M299 194h43" stroke="#a18d76" strokeWidth="4" />
        </g>
      )}
      {mode === 5 && (
        <g>
          <path
            d="M120 130H400M175 64v132M345 64v132"
            stroke="#967653"
            strokeDasharray="4 6"
          />
          <path
            d="M260 41l65 36-65 37-65-37zM195 77v70l65 37 65-37V77M260 114v70"
            fill="#39312a"
            stroke="#d3ab86"
            strokeWidth="2"
          />
          {[
            [120, 130],
            [400, 130],
            [175, 64],
            [345, 196],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect
                x={x - 29}
                y={y - 20}
                width="58"
                height="40"
                rx="8"
                fill="#302923"
                stroke="#967653"
              />
              <path
                d={`M${x - 10} ${y}h20M${x} ${y - 10}v20`}
                stroke="#e6d5b8"
                strokeWidth="2"
              />
            </g>
          ))}
        </g>
      )}
      {mode === 4 && (
        <g>
          <rect
            x="71"
            y="43"
            width="170"
            height="177"
            rx="9"
            fill="#e6d5b8"
            transform="rotate(-7 155 130)"
          />
          <text x="100" y="104" fontSize="45" fill="#292724" fontFamily="serif">
            Aa
          </text>
          <path d="M101 137h110M101 153h83" stroke="#967653" strokeWidth="4" />
          <rect
            x="264"
            y="55"
            width="170"
            height="150"
            rx="9"
            fill="#292724"
            stroke="#705943"
          />
          <path
            d="M293 159l30-67 24 44 24-44 31 67"
            fill="none"
            stroke="#c87545"
            strokeWidth="7"
          />
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={289 + i * 37}
              cy="220"
              r="12"
              fill={["#e6d5b8", "#c87545", "#8b583a", "#d8d1c6"][i]}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
