import { ICollection, Collection, FetchMode, RealtimeMode, CrudStore } from "firestorable";
import { reaction, computed } from "mobx";
import type firebase from "firebase";

import { IRootStore } from "../root-store";
import { IFavoriteRegistrationGroup, IFavoriteRegistration, IFavoriteRegistrationGroupData } from "../../../common/dist";
import * as serializer from '../../../common/serialization/serializer';
import * as deserializer from '../../../common/serialization/deserializer';
import { IUserStore } from "../user-store";

const createQuery = (userStore: IUserStore) =>
    userStore.divisionUser
        ? (ref: firebase.firestore.CollectionReference) => ref.where("userId", "==", userStore.divisionUser?.id).orderBy("name")
        : null;

export class FavoriteStore extends CrudStore<IFavoriteRegistrationGroup, IFavoriteRegistrationGroupData> {
    public favoriteCollection: ICollection<IFavoriteRegistration>;
    private db: firebase.firestore.Firestore;
    private readonly rootStore: IRootStore;

    private disposables: (() => void)[] = [];

    constructor(rootStore: IRootStore, {
        firestore,
    }: {
        firestore: firebase.firestore.Firestore,
    }) {
        super({
            collection: "favorite-groups",
            collectionOptions: {
                fetchMode: FetchMode.once,
                name: "Favorite groups",
                query: createQuery(rootStore.user),
            },
        }, {
            firestore,
        });

        this.rootStore = rootStore;
        this.db = firestore;

        this.favoriteCollection = new Collection(
            this.db,
            "favorites",
            {
                fetchMode: FetchMode.manual,
                realtimeMode: RealtimeMode.off,
                serialize: serializer.convertFavoriteRegistration,
                deserialize: deserializer.convertFavoriteRegistration,
            },
            {
                // logger: console.log
            },
        )

        this.disposables.push(
            reaction(() => rootStore.user.divisionUser, () => {
                this.collection.query = createQuery(rootStore.user);
            })
        );
    }

    @computed
    public get groups() {
        return this.collection.docs
            .filter((doc) => !!doc.data)
            .reduce((data, doc) => {
                data.push({
                    name: "Default",
                    ...doc.data!,
                    id: doc.id,
                });

                return data;
            },
                [] as ({ id: string } & IFavoriteRegistrationGroup)[]
            );
    }

    public saveFavoriteGroup() {
        if (this.activeDocument && this.activeDocumentId) {
            const existingGroup = this.groups.find((group) => (
                group.name === this.activeDocument?.name
                && group.id !== this.activeDocumentId
            ));
            if (existingGroup) {
                // delete the existing favorite registration group
                this.deleteDocument(existingGroup.id);
                // delete existing favorite registrations in this group
                this.getFavoritesByGroupIdAsync(existingGroup.id)
                    .then((favorites) => this.favoriteCollection.deleteAsync(
                        ...favorites.map((favorite) => favorite.id),
                    ),
                    )
            }

            this.updateDocument(
                this.activeDocument,
                this.activeDocumentId,
            );
        }
    }

    public getFavoritesByGroupIdAsync(groupId: string) {

        this.favoriteCollection.query = collRef => collRef
            .where("groupId", "==", groupId);

        return this.favoriteCollection.fetchAsync()
            .then(() => {

                return this.favoriteCollection.docs
                    .sort((a, b) => {
                        // TODO: Use stable sort method
                        return (a.data!.description || "") > (b.data!.description || "")
                            ? 1
                            : -1;
                    });
            });
    }

    public addFavorites(
        favorites: Omit<IFavoriteRegistration, "groupId">[],
        group: { name: string },
    ) {
        const groupId = this.collection.newId();

        this.db.runTransaction(() => {
            if (!this.rootStore.user.divisionUser)
                return Promise.reject("Unauthenticated");

            return Promise.all<string[] | string | undefined>(
                [
                    this.collection.addAsync(
                        {
                            name: group.name,
                            userId: this.rootStore.user.divisionUser.id
                        },
                        groupId,
                    ),
                    this.favoriteCollection.addAsync(
                        favorites.map(f => ({ ...f, groupId }))
                    ),
                ]);
        });

        return groupId;
    }

    public dispose() {
        super.dispose();
        this.disposables.reverse().forEach(d => d());
    }
}
