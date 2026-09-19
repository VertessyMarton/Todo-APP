import prisma from "../prismaClient.js"

export async function getTodos(userId, { limit, cursor, status, listId }) {
    const todos = await prisma.todo.findMany({
        where: {
            list: { userId },
            ...(listId !== undefined && { listId }),
            ...(status !== "all" && { completed: status === "done" }),
            ...(cursor !== undefined && { id: { lt: cursor } }),
        },
        orderBy: {
            id: "desc",
        },
        take: limit + 1,
        include: {
            list: {
                select: { id: true, name: true }
            }
        },
    });

    const hasMore = todos.length > limit
    const pageTodos = hasMore ? todos.slice(0, limit) : todos
    const nextCursor = hasMore
        ? pageTodos[pageTodos.length - 1].id
        : null

    return {
        todos: pageTodos,
        nextCursor,
        hasMore,
    };
}

export async function createTodo(userId, { task, listId }) {
    return prisma.todo.create({
        data: {
            task,
            list: {
                connect: {
                    id: listId,
                    userId,
                },
            },
        },
    });
}

export async function updateTodo(userId, todoId, { completed }) {
    return await prisma.todo.update({
        where: {
            id: todoId,
            list: {
                userId
            },
        },
        data: { completed },
    });
}

export async function deleteTodo(userId, todoId) {
    await prisma.todo.delete({
        where: {
            id: todoId,
            list: {
                userId,
            },
        },
    });
}

export async function moveTodo(userId, id, { listId }) {
    return await prisma.todo.update({
        where: {
            id,
            list: {
                userId
            },
        },
        data: { 
            list: {
                connect: {
                    id: listId,
                    userId
                }
            }
         },
    });
}