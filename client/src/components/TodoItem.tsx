import { Badge, Box, Button, Flex, Input, Spinner, Text } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { Todo } from "./TodoList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";
import { useState } from "react";

const TodoItem = ({ todo }: { todo: Todo }) => {
	const queryClient = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [editedBody, setEditedBody] = useState(todo.body);

	const { mutate: updateTodo, isPending: isUpdating } = useMutation({
		mutationKey: ["updateTodo"],
		mutationFn: async () => {
			if (todo.completed) return alert("Todo is already completed");
			const res = await fetch(BASE_URL + `/todos/${todo._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ completed: true }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	const { mutate: deleteTodo, isPending: isDeleting } = useMutation({
		mutationKey: ["deleteTodo"],
		mutationFn: async () => {
			const res = await fetch(BASE_URL + `/todos/${todo._id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});
const { mutate: editTodo, isPending: isEditingPending } = useMutation({
	mutationKey: ["editTodo"],
	mutationFn: async () => {
		const res = await fetch(BASE_URL + `/todos/${todo._id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				body: editedBody,
				completed: todo.completed, // 🔥 thêm dòng này
			}),
		});
		const data = await res.json();
		if (!res.ok) throw new Error(data.error || "Something went wrong");
		return data;
	},
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ["todos"] });
		setIsEditing(false);
	},
});


	return (
		<Flex gap={2} alignItems={"center"}>
			<Flex
				flex={1}
				alignItems={"center"}
				border={"1px"}
				borderColor={"gray.600"}
				p={2}
				borderRadius={"lg"}
				justifyContent={"space-between"}
			>
				{isEditing ? (
					<Flex flex={1} gap={2}>
						<Input
							value={editedBody}
							onChange={(e) => setEditedBody(e.target.value)}
							size='sm'
						/>
						<Button
							size='sm'
							colorScheme='blue'
							onClick={() => editTodo()}
							isLoading={isEditingPending}
						>
							Save
						</Button>
						<Button
							size='sm'
							variant='ghost'
							onClick={() => {
								setIsEditing(false);
								setEditedBody(todo.body);
							}}
						>
							Cancel
						</Button>
					</Flex>
				) : (
					<>
						<Text
							color={todo.completed ? "green.200" : "yellow.100"}
							textDecoration={todo.completed ? "line-through" : "none"}
							mr={2}
						>
							{todo.body}
						</Text>
						{todo.completed ? (
							<Badge ml='1' colorScheme='green'>
								Done
							</Badge>
						) : (
							<Badge ml='1' colorScheme='yellow'>
								In Progress
							</Badge>
						)}
					</>
				)}
			</Flex>
			<Flex gap={2} alignItems={"center"}>
				<Box
					color={"green.500"}
					cursor={"pointer"}
					onClick={() => updateTodo()}
					hidden={todo.completed}
				>
					{!isUpdating ? <FaCheckCircle size={20} /> : <Spinner size={"sm"} />}
				</Box>
				<Box color={"orange.400"} cursor={"pointer"} onClick={() => setIsEditing(true)}>
					<MdEdit size={22} />
				</Box>
				<Box color={"red.500"} cursor={"pointer"} onClick={() => deleteTodo()}>
					{!isDeleting ? <MdDelete size={25} /> : <Spinner size={"sm"} />}
				</Box>
			</Flex>
		</Flex>
	);
};

export default TodoItem;
