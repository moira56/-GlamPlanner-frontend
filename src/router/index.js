import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Home from "../views/Home.vue";
import Gallery from "../views/Galerija.vue";
import Profile from "../views/Profile.vue";
import Planovi from "../views/Planovi.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: Login },
  { path: "/register", name: "register", component: Register },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/Oaplikaciji.vue"),
  },
  {
    path: "/tips",
    name: "tips",
    component: () => import("../views/Savjeti.vue"),
  },
  {
    path: "/events",
    name: "events",
    component: () => import("../views/Događaji.vue"),
  },
  {
    path: "/events/new",
    name: "new-event",
    component: () => import("../views/EventForm.vue"),
    meta: { requiresAdmin: true },
  },
  {
    path: "/events/edit/:id",
    name: "edit-event",
    component: () => import("../views/EventForm.vue"),
    meta: { requiresAdmin: true },
    props: true,
  },
  {
    path: "/events/:id",
    name: "event-details",
    component: () => import("../views/DogađajDetalji.vue"),
    props: true,
  },
  {
    path: "/gallery",
    name: "gallery",
    component: Gallery,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/plans",
    name: "plans",
    component: Planovi,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const publicPages = ["/login", "/register"];
  const authRequired = !publicPages.includes(to.path);
  if (authRequired && !token) {
    return next("/login");
  }

  if ((to.path === "/login" || to.path === "/register") && token) {
    return next("/");
  }

  if (to.meta.requiresAdmin && role !== "admin") {
    return next("/");
  }

  next();
});

export default router;
