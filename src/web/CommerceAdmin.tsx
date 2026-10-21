import { useEffect, useState } from "react";
import { request } from "./forms";
type Row = Record<string, unknown>;
export function CommerceAdmin({ csrf }: { csrf: string }) {
  const [tab, setTab] = useState("catalog"),
    [data, setData] = useState<{
      items?: Row[];
      categories?: Row[];
      services?: Row[];
      checks?: Row;
    }>({}),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<Row | null>(null);
  useEffect(() => {
    let active = true;
    request("/api/admin/commerce/" + tab, undefined, "GET")
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [tab, version]);
  async function save(path: string, body: unknown) {
    setError("");
    try {
      await request("/api/admin/commerce/" + path, body, "PUT", csrf);
      setVersion((v) => v + 1);
      setEditing(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="commerce-admin">
      <h2>Commerce & merchant readiness</h2>
      <div className="button-row">
        {["catalog", "orders", "payments", "readiness"].map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            onClick={() => {
              setTab(t);
              setData({});
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <p role="alert">{error}</p>
      {tab === "catalog" && (
        <>
          <h3>Categories</h3>
          <form
            className="form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void save("categories", {
                id: f.get("id"),
                slug: f.get("id"),
                name: f.get("name"),
                published: f.get("published") === "on",
                position: Number(f.get("position")),
                parent_id: null,
              });
            }}
          >
            <label className="field">
              Category ID / slug
              <input name="id" required pattern="[a-z0-9-]+" maxLength={80} />
            </label>
            <label className="field">
              Name
              <input name="name" required minLength={2} maxLength={100} />
            </label>
            <label className="field">
              Display order
              <input
                name="position"
                type="number"
                min="0"
                max="1000"
                defaultValue="0"
              />
            </label>
            <label>
              <input name="published" type="checkbox" /> Publish (empty
              categories are not shown in the store)
            </label>
            <button className="button">Save category</button>
          </form>
          <ul>
            {data.categories?.map((c) => (
              <li key={String(c.id)}>
                {String(c.id)} — {String(c.name)} (
                {c.published ? "published" : "draft"})
              </li>
            ))}
          </ul>
          <h3>Packages</h3>
          <p>
            Use only business-approved prices. USD integer minor units: 100 =
            USD 1.00. Archive instead of deleting ordered packages.
          </p>
          <button
            onClick={() =>
              setEditing({
                id: crypto.randomUUID(),
                name: "Basic",
                pricing_type: "fixed",
              })
            }
          >
            Add package
          </button>
          {editing && (
            <form
              className="form-panel"
              key={String(editing.id)}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void save("packages/" + editing.id, {
                  service_id: f.get("service_id"),
                  category_id: f.get("category_id"),
                  name: f.get("name"),
                  description: f.get("description"),
                  deliverables: f.get("deliverables"),
                  timeline: f.get("timeline"),
                  revisions: f.get("revisions"),
                  exclusions: f.get("exclusions"),
                  pricing_type: f.get("pricing_type"),
                  amount_minor: f.get("amount_minor")
                    ? Number(f.get("amount_minor"))
                    : null,
                  approved: f.get("approved") === "on",
                  archived: f.get("archived") === "on",
                });
              }}
            >
              <label className="field">
                Service
                <select
                  name="service_id"
                  required
                  defaultValue={String(editing.service_id || "")}
                >
                  <option value="">Choose an existing service</option>
                  {data.services?.map((s) => (
                    <option key={String(s.id)} value={String(s.id)}>
                      {String(s.title)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Category
                <select
                  name="category_id"
                  required
                  defaultValue={String(editing.category_id || "")}
                >
                  <option value="">Choose category</option>
                  {data.categories?.map((s) => (
                    <option key={String(s.id)} value={String(s.id)}>
                      {String(s.name)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Tier
                <select name="name" defaultValue={String(editing.name)}>
                  {["Basic", "Standard", "Premium", "Custom"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Pricing type
                <select
                  name="pricing_type"
                  defaultValue={String(editing.pricing_type)}
                >
                  {["fixed", "tiered", "custom"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                USD price (minor units)
                <input
                  type="number"
                  name="amount_minor"
                  min="1"
                  max="100000000"
                  step="1"
                  defaultValue={String(editing.amount_minor || "")}
                />
              </label>
              {[
                "description",
                "deliverables",
                "timeline",
                "revisions",
                "exclusions",
              ].map((key) => (
                <label className="field" key={key}>
                  {key}
                  <textarea
                    name={key}
                    required
                    defaultValue={String(editing[key] || "")}
                  />
                </label>
              ))}
              <label>
                <input
                  type="checkbox"
                  name="approved"
                  defaultChecked={!!editing.approved}
                />{" "}
                I confirm the business has approved this scope and price.
              </label>
              <label>
                <input
                  type="checkbox"
                  name="archived"
                  defaultChecked={!!editing.archived}
                />{" "}
                Archive
              </label>
              <button className="button">Save package</button>
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </form>
          )}
          {data.items?.map((p) => (
            <article className="panel" key={String(p.id)}>
              <h4>
                {String(p.title)} / {String(p.name)}
              </h4>
              <p>
                {p.amount_minor === null
                  ? "Custom quote"
                  : `USD minor units: ${p.amount_minor}`}{" "}
                — {p.approved ? "approved" : "draft"}{" "}
                {p.archived ? " / archived" : ""}
              </p>
              <button onClick={() => setEditing(p)}>Edit package</button>
            </article>
          ))}
        </>
      )}
      {tab === "readiness" ? (
        <div className="notice">
          <h3>BLOCKED — not merchant ready</h3>
          <p>
            Verification flags record administrative review; they do not
            substitute for authentic documents or provider approval.
          </p>
          <pre>{JSON.stringify(data.checks, null, 2)}</pre>
        </div>
      ) : (
        tab !== "catalog" && (
          <>
            <p>
              Local mock payments are simulations, never confirmed revenue. This
              view shows the most recent 100 records.
            </p>
            {data.items?.map((row) => (
              <article className="panel" key={String(row.id)}>
                <pre>{JSON.stringify(row, null, 2)}</pre>
              </article>
            ))}
          </>
        )
      )}
    </section>
  );
}
