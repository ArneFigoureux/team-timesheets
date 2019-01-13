import { IUser } from "../stores/UserStore";

const isAdmin = (user?: IUser) => {
    return user && user.roles.admin;
}

export const canAddTask = (user?: IUser) => isAdmin(user);
export const canEditTask = (user?: IUser) => isAdmin(user);
export const canDeleteTask = (user?: IUser) => isAdmin(user);

export const canAddProject = (user?: IUser) => isAdmin(user);
export const canEditProject = (user?: IUser) => isAdmin(user);
export const canDeleteProject = (user?: IUser) => isAdmin(user);