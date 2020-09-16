import * as React from 'react';
import { observer } from 'mobx-react-lite';

import { canEditTask, canDeleteTask, canManageTasks } from '../../../rules';
import { SettingsList, IListItemData } from '../../../components/settings-list';
import { useTasks } from '../../../contexts/task-context';
import { useUserStore } from "../../../contexts/user-context";
import { useViewStore } from '../../../contexts/view-context';

export const TaskList = observer((props: React.HTMLProps<HTMLDivElement>) => {
    const { addAsync, tasks, taskId, setTaskId } = useTasks();
    const { authenticatedUser } = useUserStore();
    const { selection, toggleSelection } = useViewStore();

    const selectItem = (id: string | undefined) => {
        if (canEditTask(authenticatedUser) || canDeleteTask(authenticatedUser)) {
            setTaskId(id);
        }
    }

    const saveListItem = (data: IListItemData, id?: string) => {
        setTaskId(undefined);
        if (data.name) {
            addAsync({ name: data.name, icon: data.icon }, id);
        }
    }

    return (
        <SettingsList {...props}
            readonly={!canManageTasks(authenticatedUser)}
            items={tasks}
            onAddItem={saveListItem}
            onToggleSelection={id => toggleSelection(id)}
            onItemClick={selectItem}
            selection={selection}
            activeItemId={taskId}
        />
    );
});

