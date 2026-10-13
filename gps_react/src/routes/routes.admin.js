import { AdminLayout } from "../layouts";
import {
  UsersAdmin,
  MeetingsAdmin,
  HomesAdmin,
  ActasAdmin,
  SettingsAdmin,
  SuportsAdmin,
  ActaEditorPage,
} from "../pages/Admin";

const routesAdmin = [
  {
    path: "/admin",
    layout: AdminLayout,
    component: HomesAdmin,
    exact: true,
  },

  {
    path: "/meetings",
    layout: AdminLayout,
    component: MeetingsAdmin,
    exact: true,
  },

  {
    path: "/users",
    layout: AdminLayout,
    component: UsersAdmin,
    exact: true,
  },

  {
    path: "/actas",
    layout: AdminLayout,
    component: ActasAdmin, // Assuming you meant to use UsersAdmin here, change if needed
    exact: true,
  },

  {
    path: "/settings",
    layout: AdminLayout,
    component: SettingsAdmin, // Assuming you meant to use UsersAdmin here, change if needed
    exact: true,
  },

  {
    path: "/supports",
    layout: AdminLayout,
    component: SuportsAdmin, // Assuming you meant to use UsersAdmin here, change if needed
    exact: true,
  },

  {
    path: "/actas/:sessionId/editar",
    layout: AdminLayout,
    component: ActaEditorPage, // Assuming you meant to use UsersAdmin here, change if needed
    exact: true,
  },
];

export default routesAdmin;
