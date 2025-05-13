import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2Icon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { TaskProps } from './KanbanBoard'

interface TaskItemProps {
	task: TaskProps
	updateTask: (taskId: number, title: string) => void
	deleteTask: (taskId: number) => void
}
export default function TaskItem({
	task,
	updateTask,
	deleteTask,
}: TaskItemProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null)
	const [editMode, setEditMode] = useState(false)

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: task.id,
		data: {
			type: 'Task',
			task,
		},
	})

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies:
	useEffect(() => {
		adjustTextareaHeight()
	}, [task, editMode])

	const adjustTextareaHeight = () => {
		const textarea = textareaRef.current
		if (!textarea) {
			return
		}
		textarea.style.height = `${textarea.scrollHeight}px`
	}

	function toggleEditMode() {
		setEditMode((prev) => !prev)
	}

	if (isDragging) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="h-[72px] min-h-[72px] mx-2 flex items-center text-left opacity-30 rounded-lg ring-2 ring-inset ring-rose-700"
			/>
		)
	}

	if (editMode) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				{...attributes}
				{...listeners}
				className="flex gap-2 m-2 first:mt-0 last:mb-0"
			>
				<div className="flex-1 min-h-18 rounded-lg text-justify ring ring-inset ring-transparent cursor-pointer bg-zinc-900 hover:ring-zinc-600">
					<textarea
						autoFocus
						ref={textareaRef}
						value={task.title}
						onChange={(e) => updateTask(task.id, e.target.value)}
						onBlur={toggleEditMode}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								setEditMode(false)
							}
						}}
						className="w-full p-2 outline-none scrollbar-gray"
					/>
				</div>
				<button type="button">
					<Trash2Icon
						onClick={() => deleteTask(task.id)}
						className="cursor-pointer text-zinc-600 hover:text-red-800"
					/>
				</button>
			</div>
		)
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="flex gap-2 m-2 first:mt-0 last:mb-0"
		>
			<div
				onClick={() => setEditMode(true)}
				key={task.id}
				className="flex-1 min-h-18 min-w-[272px] rounded-lg text-justify ring ring-inset ring-transparent cursor-pointer bg-zinc-900 hover:ring-zinc-600"
			>
				<span className="flex p-2 h-full text-left">{task.title}</span>
			</div>
			<button type="button">
				<Trash2Icon
					onClick={() => deleteTask(task.id)}
					className="cursor-pointer text-zinc-600 hover:text-red-800"
				/>
			</button>
		</div>
	)
}
