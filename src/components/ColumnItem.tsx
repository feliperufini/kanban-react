import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlusCircleIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ColumnProps, TaskProps } from './KanbanBoard'
import TaskItem from './TaskItem'

interface ColumnItemProps {
	column: ColumnProps
	updateColumn: (columnId: number, title: string) => void
	deleteColumn: (columnId: number) => void
	columnTasks: TaskProps[]
	createTask: (columnId: number) => void
	updateTask: (taskId: number, title: string) => void
	deleteTask: (taskId: number) => void
}

export default function ColumnItem({
	column,
	updateColumn,
	deleteColumn,
	columnTasks,
	createTask,
	updateTask,
	deleteTask,
}: ColumnItemProps) {
	const [editMode, setEditMode] = useState(false)

	const tasksId = useMemo(() => {
		return columnTasks.map((task) => task.id)
	}, [columnTasks])

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: column.id,
		data: {
			type: 'Column',
			column: column,
		},
	})

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	}

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="flex flex-col w-80 rounded-lg opacity-40 border-2 border-rose-700 bg-zinc-800"
			/>
		)
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className="flex flex-col w-80 h-full rounded-lg bg-zinc-800"
		>
			<div
				{...attributes}
				{...listeners}
				onClick={() => setEditMode(true)}
				className="flex gap-2 m-2 p-3 rounded-lg rounded-b-none bg-zinc-900"
			>
				<span className="h-6 w-6 text-center rounded-full bg-zinc-700">
					{columnTasks.length}
				</span>
				{editMode ? (
					<input
						autoFocus
						type="text"
						value={column.title}
						onChange={(e) => updateColumn(column.id, e.target.value)}
						onBlur={() => setEditMode(false)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								setEditMode(false)
							}
						}}
						className="flex-1 font-bold outline-none"
					/>
				) : (
					<span className="flex-1 font-bold">{column.title}</span>
				)}
				<Trash2Icon
					onClick={() => deleteColumn(column.id)}
					className="cursor-pointer text-zinc-600 hover:text-red-800"
				/>
			</div>

			<div className="flex-1 overflow-y-auto scrollbar-gray">
				<SortableContext items={tasksId}>
					{columnTasks.map((task) => (
						<TaskItem
							key={task.id}
							task={task}
							updateTask={updateTask}
							deleteTask={deleteTask}
						/>
					))}
				</SortableContext>
			</div>

			<div className="p-4">
				<button
					onClick={() => createTask(column.id)}
					type="button"
					className="flex items-center gap-2 bg-zinc-800 outline-none cursor-pointer"
				>
					<PlusCircleIcon />
					Adicionar Tarefa
				</button>
			</div>
		</div>
	)
}
