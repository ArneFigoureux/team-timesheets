import { IRegistrationsStore, RegistrationStore } from "./TimesheetsStore";
import { IConfigStore, ConfigStore } from "./ConfigStore";
import { IUserStore, UserStore } from "./UserStore";
import { IViewStore, ViewStore } from "./ViewStore";
import { RouterStore } from "mobx-router";
import { firestorable } from "../Firestorable/Firestorable";
import { IReportStore, ReportStore } from "./ReportStore";

export interface IRootStore {
    readonly user: IUserStore;
    readonly view: IViewStore;
    readonly router: RouterStore;
    readonly timesheets: IRegistrationsStore;
    readonly reports: IReportStore;
    readonly config: IConfigStore;
    readonly getCollection: (name: string) => firebase.firestore.CollectionReference;
}

export class Store implements IRootStore {
    public readonly timesheets: IRegistrationsStore;
    public readonly view: IViewStore;
    public readonly user: IUserStore;
    public readonly config: IConfigStore;
    public readonly router = new RouterStore();
    public readonly reports: IReportStore;

    public readonly getCollection: (name: string) => firebase.firestore.CollectionReference;

    constructor(getCollection: (name: string) => firebase.firestore.CollectionReference) {
        this.getCollection = getCollection;

        this.user = new UserStore(this);
        this.view = new ViewStore(this);
        this.config = new ConfigStore(this, getCollection);
        this.timesheets = new RegistrationStore(this);
        this.reports = new ReportStore(this);
    }
};

const store = (window as any)["store"] = new Store(name => firestorable.firestore.collection(name));

export default store;

