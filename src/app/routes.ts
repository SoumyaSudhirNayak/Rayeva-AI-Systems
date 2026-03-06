import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { CategoryGenerator } from "./pages/CategoryGenerator";
import { ProposalGenerator } from "./pages/ProposalGenerator";
import { AILogs } from "./pages/AILogs";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "category-generator", Component: CategoryGenerator },
      { path: "proposal-generator", Component: ProposalGenerator },
      { path: "ai-logs", Component: AILogs },
    ],
  },
]);
