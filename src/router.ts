import {createRouter, createWebHistory} from "vue-router";
import Arrival from "./components/ArrivalDeparture/Arrival.vue";
import Departure from "./components/ArrivalDeparture/Departure.vue";
import ArrivalDepartureOverview from "./components/ArrivalDeparture/ArrivalDepartureOverview.vue";

const routes = [
    {
        path: '/arrdep',
        component: ArrivalDepartureOverview,
        children: [
            {
                path: '/arr',
                component: Arrival
            },
            {
                path: '/dep',
                component: Departure
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;