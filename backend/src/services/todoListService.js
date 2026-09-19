import prisma from "../prismaClient.js"

export async function getTodoList(userId) {
    return await prisma.todoList.findMany({
        where: {
            userId
        }
    });
}

export async function createTodoList(userId, { name }) {
    return await prisma.todoList.create({
        data: {
            name,
            userId,
        },
    });
}

export async function updateTodoList(id, userId, { name }) {
    return await prisma.todoList.update({
        where: {
            id,
            userId,
        },
        data: { name },
    });
}

export async function deleteTodoList(userId, id) {
    await prisma.todoList.delete({
        where: {
            id,
            userId
        }
    });
}