import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import SeedsView from "@/views/SeedsView";
const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/seeds/:id",
    name: "seeds",
    component: SeedsView,
    meta: {
      title: "ぷよクエ-落ちコンお祈りルート探索くん",
      desc: "ぷよクエの落ちコンしそうなルート探索するアプリです",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
