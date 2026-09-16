import prisma from "../prismaClient.js"

export async function getTodos(userId, { limit, cursor, status }) {
    const todos = await prisma.todo.findMany({
        where: {
            userId: userId,
            ...(status !== "all" && { completed: status === "done" }),
            ...(cursor !== undefined && { id: { lt: cursor } }),
        },
        orderBy: {
            id: "desc",
        },
        take: limit + 1,
    })

    const hasMore = todos.length > limit
    const pageTodos = hasMore ? todos.slice(0, limit) : todos
    const nextCursor = hasMore
        ? pageTodos[pageTodos.length - 1].id
        : null

    return {
        todos: pageTodos,
        nextCursor,
        hasMore,
    }
}

export async function createTodo(userId, { task }) {
    return prisma.todo.create({
        data: { task, userId }
    })
}

export async function updateTodo(userId, id, { completed }) {
    return prisma.todo.update({
        where: { id, userId },
        data: { completed }
    })
}

export async function deleteTodo(userId, id) {
    await prisma.todo.delete({
        where: { id, userId }
    })
}
