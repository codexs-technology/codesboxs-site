import { useEffect, useState } from "react";
import {
  Code2,
  LogOut,
  LayoutDashboard,
  Inbox,
  FileText,
  Layers,
  Users,
  Settings,
  History,
  Mail,
  Briefcase,
} from "lucide-react";
import { leadStatuses } from "../shared/validation";
import { request } from "./forms";
import { CommerceAdmin } from "./CommerceAdmin";

type Row = Record<string, unknown>;
type Session = { email: string; csrfToken: string };
const sections = [
  ["dashboard", "Overview", LayoutDashboard],
  ["contacts", "Contact leads", Inbox],
  ["projects", "Project inquiries", Layers],
  ["subscribers", "Subscribers", Users],
  ["blog", "Articles", FileText],
  ["portfolio", "Portfolio", Layers],
  ["services", "Services", Code2],
  ["jobs", "Careers", Briefcase],
  ["applications", "Applications", Users],
  ["settings", "Site settings", Settings],
  ["audits", "Audit history", History],
  ["emails", "Email delivery", Mail],
] as const;
const contentEntities = ["blog", "portfolio", "services", "jobs"];
const defaultContent: Row = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  status: "draft",
  category: "Engineering",
  author: "CodesBoxs Editorial",
  image: "/images/engineering.svg",
  technologies: "",
  is_concept: true,
  location: "",
  employment_type: "",
};
export function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [entity, setEntity] = useState("dashboard");
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<Row | null>(null);
  const [version, setVersion] = useState(0);
  const [gallery, setGallery] = useState<{
    id: string;
    images: { url: string; alt: string }[];
  } | null>(null);
  useEffect(() => {
    let current = true;
    request("/api/admin/session", undefined, "GET")
      .then((data) => {
        if (current) setSession(data as Session);
      })
      .catch(() => {})
      .finally(() => {
        if (current) setChecking(false);
      });
    return () => {
      current = false;
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    let current = true;
    const url =
      entity === "dashboard"
        ? "/api/admin/dashboard"
        : `/api/admin/${entity}?page=${page}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;
    request(url, undefined, "GET")
      .then((data) => {
        if (!current) return;
        if (entity === "dashboard")
          setCounts(data.counts as Record<string, number>);
        else {
          setRows(data.items as Row[]);
          setTotal(Number(data.total || (data.items as Row[]).length));
        }
      })
      .catch((err) => {
        if (current) setError((err as Error).message);
      })
      .finally(() => {
        if (current) setBusy(false);
      });
    return () => {
      current = false;
    };
  }, [session, entity, page, search, status, version]);
  const mutate = async (url: string, body: unknown, method: string) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await request(url, body, method, session?.csrfToken);
      setVersion((v) => v + 1);
      setMessage("Change saved.");
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  if (checking)
    return (
      <main className="admin-login">
        <h1>Administrator</h1>
        <p role="status">Checking secure session…</p>
      </main>
    );
  if (!session)
    return (
      <main className="admin-login">
        <a href="/" className="brand">
          <span className="brand-mark">
            <Code2 />
          </span>
          codesboxs.
        </a>
        <form
          className="form-panel"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setBusy(true);
            setError("");
            try {
              const result = await request("/api/admin/login", {
                email: form.get("email"),
                password: form.get("password"),
              });
              setSession(result as Session);
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="eyebrow">AUTHORIZED ACCESS ONLY</p>
          <h1>Administrator sign in</h1>
          <label className="field">
            Email
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="muted">
            No public default credentials. Use the documented secure bootstrap
            to provision the first account.
          </p>
        </form>
      </main>
    );
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="brand">
          <span className="brand-mark">
            <Code2 size={20} />
          </span>
          codesboxs.
        </a>
        <p className="eyebrow">CONTROL CENTER</p>
        <nav aria-label="Administration">
          {sections.map(([key, label, Icon]) => (
            <button
              className={entity === key ? "active" : ""}
              key={key}
              onClick={() => {
                setEntity(key);
                setPage(1);
                setSearch("");
                setStatus("");
                setEditor(null);
                setGallery(null);
                setMessage("");
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <p className="muted admin-email">{session.email}</p>
        <button
          className="button button-secondary"
          onClick={async () => {
            if (await mutate("/api/admin/logout", {}, "POST")) setSession(null);
          }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </aside>
      <main className="admin-main" id="main">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">REAL STORED DATA</p>
            <h1>{sections.find(([key]) => key === entity)?.[1]}</h1>
          </div>
          <a href="/" className="text-link">
            View website
          </a>
        </div>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="admin-notice" role="status">
            {message}
          </p>
        )}
        {busy && (
          <p role="status" className="muted">
            Loading or saving…
          </p>
        )}
        {entity === "dashboard" ? (
          <>
            <div className="admin-stats">
              {Object.entries(counts).map(([name, count]) => (
                <button
                  key={name}
                  className="panel"
                  onClick={() => {
                    setEntity(name);
                    setPage(1);
                  }}
                >
                  <span>{name}</span>
                  <strong>{count}</strong>
                  <small>stored records</small>
                </button>
              ))}
            </div>
            <div className="notice">
              Counts come from D1 records. They are not website visitor
              analytics or business performance claims. Check the Email delivery
              tab for actual notification states.
            </div>
            <CommerceAdmin csrf={session.csrfToken} />
          </>
        ) : entity === "settings" ? (
          <form
            className="form-panel"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              await mutate(
                "/api/admin/settings",
                { key: form.get("key"), value: form.get("value") },
                "PUT",
              );
            }}
          >
            <h2>Editable site messages</h2>
            <label className="field">
              Setting
              <select name="key">
                {[
                  "announcement",
                  "contact_note",
                  "footer_note",
                  "business_email",
                  "business_email_verified",
                  "business_phone",
                  "business_phone_verified",
                  "registered_address",
                  "document_address",
                  "address_verified",
                ].map((key) => (
                  <option key={key}>{key}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Value
              <textarea name="value" maxLength={500} rows={4} />
            </label>
            <button className="button" disabled={busy}>
              Save setting
            </button>
            <div className="review-list">
              {rows.map((row) => (
                <div key={String(row.key)}>
                  <dt>{String(row.key)}</dt>
                  <dd>{String(row.value)}</dd>
                </div>
              ))}
            </div>
          </form>
        ) : (
          <>
            <div className="admin-toolbar">
              <label className="field">
                Search
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              {[
                "contacts",
                "projects",
                "applications",
                ...contentEntities,
              ].includes(entity) && (
                <label className="field">
                  Status
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All statuses</option>
                    {(contentEntities.includes(entity)
                      ? ["draft", "published"]
                      : leadStatuses
                    ).map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
              )}
              {contentEntities.includes(entity) && (
                <button
                  className="button"
                  onClick={() => setEditor({ ...defaultContent })}
                >
                  Create{" "}
                  {entity === "jobs"
                    ? "position"
                    : entity === "blog"
                      ? "article"
                      : "entry"}
                </button>
              )}
            </div>
            {gallery && (
              <form
                className="form-panel"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (
                    await mutate(
                      `/api/admin/portfolio/${gallery.id}/images`,
                      gallery.images,
                      "PUT",
                    )
                  )
                    setGallery(null);
                }}
              >
                <h2>Concept gallery</h2>
                <p>
                  Choose original illustrations and describe what each conveys.
                  Saving replaces this project's gallery only.
                </p>
                {gallery.images.map((image, i) => (
                  <div className="form-grid" key={i}>
                    <label className="field">
                      Illustration {i + 1}
                      <select
                        value={image.url}
                        onChange={(e) =>
                          setGallery({
                            ...gallery,
                            images: gallery.images.map((value, index) =>
                              index === i
                                ? { ...value, url: e.target.value }
                                : value,
                            ),
                          })
                        }
                      >
                        {[
                          "hero",
                          "engineering",
                          "ai",
                          "cloud",
                          "dashboard",
                          "mobile",
                          "security",
                          "team",
                        ].map((name) => (
                          <option key={name} value={`/images/${name}.svg`}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Alternative text {i + 1}
                      <input
                        value={image.alt}
                        minLength={5}
                        maxLength={240}
                        required
                        onChange={(e) =>
                          setGallery({
                            ...gallery,
                            images: gallery.images.map((value, index) =>
                              index === i
                                ? { ...value, alt: e.target.value }
                                : value,
                            ),
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() =>
                        setGallery({
                          ...gallery,
                          images: gallery.images.filter(
                            (_, index) => index !== i,
                          ),
                        })
                      }
                    >
                      Remove image {i + 1}
                    </button>
                  </div>
                ))}
                <div className="button-row">
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={gallery.images.length >= 8}
                    onClick={() =>
                      setGallery({
                        ...gallery,
                        images: [
                          ...gallery.images,
                          { url: "/images/dashboard.svg", alt: "" },
                        ],
                      })
                    }
                  >
                    Add illustration
                  </button>
                  <button className="button" disabled={busy}>
                    Save gallery
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setGallery(null)}
                  >
                    Cancel gallery
                  </button>
                </div>
              </form>
            )}
            {editor && (
              <form
                className="form-panel admin-editor"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const id = editor.id;
                  const saved = await mutate(
                    `/api/admin/${entity}${id ? `/${id}` : ""}`,
                    { ...editor, is_concept: true },
                    id ? "PUT" : "POST",
                  );
                  if (saved) setEditor(null);
                }}
              >
                <h2>{editor.id ? "Edit content" : "Create content"}</h2>
                <p className="muted">
                  Body supports plain paragraphs and headings beginning with ##.
                  HTML is never executed. Publishing a job requires
                  owner-verified details. Portfolio entries remain labeled
                  concepts.
                </p>
                <div className="form-grid">
                  {[
                    "title",
                    "slug",
                    "summary",
                    "body",
                    ...(entity === "blog"
                      ? ["category", "author", "image"]
                      : entity === "portfolio"
                        ? ["category", "image", "technologies"]
                        : entity === "jobs"
                          ? ["location", "employment_type"]
                          : []),
                  ].map((key) => (
                    <label
                      className={`field ${["summary", "body"].includes(key) ? "full-width" : ""}`}
                      key={key}
                    >
                      {key.replaceAll("_", " ")}
                      {["body", "summary"].includes(key) ? (
                        <textarea
                          rows={key === "body" ? 10 : 3}
                          value={String(editor[key] || "")}
                          onChange={(e) =>
                            setEditor({ ...editor, [key]: e.target.value })
                          }
                          required
                        />
                      ) : key === "image" ? (
                        <select
                          value={String(editor.image)}
                          onChange={(e) =>
                            setEditor({ ...editor, image: e.target.value })
                          }
                        >
                          {[
                            "engineering",
                            "dashboard",
                            "mobile",
                            "ai",
                            "cloud",
                            "security",
                            "team",
                            "hero",
                          ].map((name) => (
                            <option key={name} value={`/images/${name}.svg`}>
                              {name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={String(editor[key] || "")}
                          onChange={(e) =>
                            setEditor({ ...editor, [key]: e.target.value })
                          }
                          required={key !== "technologies"}
                        />
                      )}
                    </label>
                  ))}
                  <label className="field">
                    Publication status
                    <select
                      value={String(editor.status)}
                      onChange={(e) =>
                        setEditor({ ...editor, status: e.target.value })
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </label>
                </div>
                <div className="button-row">
                  <button className="button" disabled={busy}>
                    Save content
                  </button>
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() => setEditor(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <caption>
                  {sections.find(([key]) => key === entity)?.[1]} · page {page}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Record</th>
                    <th scope="col">Details</th>
                    <th scope="col">Status / actions</th>
                    <th scope="col">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={String(row.id)}>
                      <td>
                        <strong>
                          {String(
                            row.title ||
                              row.name ||
                              row.email ||
                              row.action ||
                              row.subject ||
                              row.id,
                          )}
                        </strong>
                        <small>{String(row.id)}</small>
                      </td>
                      <td>
                        {[
                          "email",
                          "company",
                          "service",
                          "services_json",
                          "timeline",
                          "budget",
                          "description",
                          "cover_letter",
                          "portfolio_url",
                          "entity",
                          "entity_id",
                          "recipient",
                          "last_error",
                          "attempts",
                        ]
                          .filter(
                            (key) => row[key] !== undefined && row[key] !== "",
                          )
                          .map((key) => (
                            <details className="record-detail" key={key}>
                              <summary>{key.replaceAll("_", " ")}</summary>
                              <p>{String(row[key])}</p>
                            </details>
                          ))}
                        {row.summary ? <p>{String(row.summary)}</p> : null}
                      </td>
                      <td>
                        {["contacts", "projects", "applications"].includes(
                          entity,
                        ) ? (
                          <label className="field">
                            Lead status
                            <select
                              aria-label={`Status for ${row.name}`}
                              value={String(row.status)}
                              disabled={busy}
                              onChange={(e) =>
                                void mutate(
                                  `/api/admin/${entity}/${row.id}/status`,
                                  { status: e.target.value },
                                  "PATCH",
                                )
                              }
                            >
                              {leadStatuses.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <span className="tags">
                            <span>{String(row.status || "recorded")}</span>
                          </span>
                        )}
                        {contentEntities.includes(entity) && (
                          <div className="table-actions">
                            {entity === "portfolio" && (
                              <button
                                onClick={async () => {
                                  try {
                                    const result = await request(
                                      `/api/admin/portfolio/${row.id}/images`,
                                      undefined,
                                      "GET",
                                    );
                                    setGallery({
                                      id: String(row.id),
                                      images: result.items as {
                                        url: string;
                                        alt: string;
                                      }[],
                                    });
                                  } catch (error) {
                                    setError((error as Error).message);
                                  }
                                }}
                              >
                                Gallery
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setEditor({
                                  ...defaultContent,
                                  ...row,
                                  is_concept: true,
                                })
                              }
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Delete this content entry? This cannot be undone.",
                                  )
                                )
                                  void mutate(
                                    `/api/admin/${entity}/${row.id}`,
                                    {},
                                    "DELETE",
                                  );
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                      <td>{String(row.created_at || "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows.length && !busy && (
                <p className="empty-state">No matching stored records.</p>
              )}
            </div>
            <div className="pagination">
              <button
                className="button button-secondary"
                disabled={page <= 1 || busy}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>
                Page {page} · {total} records
              </span>
              <button
                className="button button-secondary"
                disabled={page * 20 >= total || busy}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
