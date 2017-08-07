import { Route, Redirect } from "react-router";
import TelemetryPage from "../pages/telemetry";
import MonitorsTab from "../pages/telemetry/monitorsTab";

const telemetryRoutes = [
  {
    type: Redirect,
    from: "/telemetry",
    to: "/telemetry/monitors"
  },
  {
    type: Route,
    path: "telemetry",
    component: TelemetryPage,
    category: "system",
    isInSidebar: true,
    children: [
      {
        type: Route,
        path: "monitors",
        component: MonitorsTab,
        isInSidebar: true
      }
    ]
  }
];

module.exports = telemetryRoutes;
