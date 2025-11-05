import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Home from "../views/Home.vue";

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
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
