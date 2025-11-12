import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Home from "../views/Home.vue";
import Gallery from "../views/Galerija.vue";
import Profile from "../views/Profile.vue";

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const publicPages = ["/login", "/register"];
  const authRequired = !publicPages.includes(to.path);
  const token = localStorage.getItem("token");

  if (authRequired && !token) {
    return next("/login");
  }

  if ((to.path === "/login" || to.path === "/register") && token) {
    return next("/");
  }

  next();
});

export default router;
