import { createRouter, createWebHistory } from "vue-router";
//import HomeView from "../views/HomeView.vue";
import FieldView from "@/views/FieldView";
import SeedsView from "@/views/SeedsView";
import AboutView from "@/views/AboutView";
import TestView from "@/views/TestView";
const routes = [
  {
    path: "/",
    name: "field",
    component: FieldView,
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
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

  {
    path: "/seeds/charmyDraco",
    redirect: { name: "seeds", params: { id: "normal" } },
  },

  {
    path: "/seeds/moreSuspiciousKlug",
    redirect: { name: "seeds", params: { id: "normal" } },
  },

  {
    path: "/seeds/anndoRingo",
    redirect: { name: "seeds", params: { id: "deleteThree" } },
  },

  {
    path: "/seeds/spaceEcolo",
    redirect: { name: "seeds", params: { id: "deleteThree" } },
  },

  {
    path: "/seeds/whiteMarle",
    redirect: { name: "seeds", params: { id: "paintBlue" } },
  },

  {
    path: "/seeds/midsummerAmanone",
    redirect: { name: "seeds", params: { id: "paintPurple" } },
  },

  {
    path: "/seeds/attariPoobo",
    redirect: { name: "seeds", params: { id: "paintYellow" } },
  },

  {
    path: "/seeds/cureBloomCureEgrette",
    redirect: { name: "seeds", params: { id: "paintRed" } },
  },

  {
    path: "/test",
    name: "test",
    component: TestView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

const DEFAULT_TITLE = "puyosim";
router.afterEach((to) => {
  const title = to.meta.title ? to.meta.title : DEFAULT_TITLE;
  document.title = title;
});
export default router;
