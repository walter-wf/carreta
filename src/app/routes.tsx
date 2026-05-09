import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Productor from "./pages/Productor";
import Transportista from "./pages/Transportista";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/productor",
    Component: Productor,
  },
  {
    path: "/transportista",
    Component: Transportista,
  },
]);
