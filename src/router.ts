import { createRouter, createWebHashHistory } from "vue-router";
import Trip from "./components/Trip/Trip.vue";
import ArrivalDeparture from "./components/ArrivalDeparture/ArrivalDeparture.vue";

const router = createRouter({
  history: createWebHashHistory("/Fahrplan/"),
  routes: [
    {
      path: "/arrdep",
      component: ArrivalDeparture,
    },
    {
      path: "/trip",
      component: Trip,
    },
  ],
});

export default router;
