import * as React from 'react';
import { Route } from 'mobx-router';
import { setNavigationContent, goToRouteWithDate, routeWithDateChanged } from '../actions';
import { App, DateObject } from '../../internal';
import { IRootStore } from '../../stores/root-store';
import { ExportPage } from '../../pages/export';

const path = "/reports";

type ReportRoute = Route<IRootStore, DateObject>;

export const goToReports = (s: Pick<IRootStore, "view" | "router">, date?: DateObject) => {
    goToRouteWithDate(routes.report, s, date, { track: false });
}

const routeChanged = (route: ReportRoute, params: DateObject, s: IRootStore) => {
    setNavigationContent(s, route, false);
    routeWithDateChanged(route, params, s);
};

const routes = {
    report: new Route({
        path: path + '/:year/:month',
        component: <App><ExportPage></ExportPage></App>,
        onEnter: (route: ReportRoute, params: DateObject, s: IRootStore) => {
            routeChanged(route, params, s);
        },
        onParamsChange: routeChanged,
        title: "Export timesheet",
    })
};

export default routes;


