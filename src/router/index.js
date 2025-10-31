import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Home from "../views/Home.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: Login },
  { path: "/register", name: "register", component: Register },
  { path: "/", name: "home", component: Home },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
