import { RouterStore } from "mobx-router";

import { IRegistrationsStore, RegistrationStore } from "../registration-store/registration-store";
import { IConfigStore, ConfigStore } from "../config-store";
import { IUserStore, UserStore } from "../user-store";
import { IViewStore, ViewStore } from "../view-store";
import { IReportStore, ReportStore } from "../report-store/report-store";
import { DashboardStore, IDashboardStore } from "../dashboard-store";
import { IProjectStore, ProjectStore } from "../project-store";
import { FavoriteStore } from "../favorite-store";
import { observable } from "mobx";

export interface IRootStore extends Store { };

export class Store implements IRootStore {
    public readonly timesheets: IRegistrationsStore;
    public readonly view: IViewStore;
    public readonly user: IUserStore;
    public readonly config: IConfigStore;
    public readonly router: RouterStore<IRootStore>;
    public readonly reports: IReportStore;
    public readonly dashboard: IDashboardStore;
    public readonly projects: IProjectStore;
    public readonly favorites: FavoriteStore;

    @observable.ref
    private organisationId: string | undefined = undefined;

    constructor({
        auth,
        firestore,
    }: {
        firestore: firebase.firestore.Firestore,
        auth?: firebase.auth.Auth,
    }) {
        this.user = new UserStore(
            this,
            {
                auth,
                firestore,
            }
        );

        this.view = new ViewStore();
        this.config = new ConfigStore(
            this,
            {
                firestore,
            },
        );
        this.timesheets = new RegistrationStore(
            this,
            {
                firestore,
            },
        );
        this.reports = new ReportStore(
            this,
            {
                firestore,
            },
        );
        this.dashboard = new DashboardStore(
            this,
            {
                firestore,
            },
        );
        this.projects = new ProjectStore(
            this,
            {
                firestore,
            },
        );
        this.favorites = new FavoriteStore(
            this,
            {
                firestore,
            },
        );
        this.router = new RouterStore<IRootStore>(this);
    }

    public setOrganisationId(id: string | undefined) {
        this.organisationId = id;
    }

    public getOrganisationId() {
        return this.organisationId;
    }

    public dispose() {
        // this.config.dispose();
        // this.dashboard.dispose();
        // this.favorites.dispose();
        // this.projects.dispose();
        // this.reports.dispose();
        // this.timesheets.dispose();
        this.user.dispose();
        // this.view.dispose();
    }
};
