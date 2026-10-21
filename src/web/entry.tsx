import { hydrateRoot } from "react-dom/client";
import type { SiteData } from "../shared/content";
import "./styles.css";
import "./luxury.css";
import "./signature.css";
import "./commerce.css";
import "./flagship.css";

const node = document.getElementById("site-data");
const root = document.getElementById("root");
if (node && root) {
  const data = JSON.parse(node.textContent || "{}") as SiteData;
  if (data.path === "/admin") {
    void import("./Admin").then(({ Admin }) => hydrateRoot(root, <Admin />));
  } else {
    void import("./App").then(({ App }) =>
      hydrateRoot(root, <App data={data} />),
    );
  }
}
