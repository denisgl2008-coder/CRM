
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const workspaceName = 'Workspace_1769585601050';
    const email = 'test.user.1769585601050@example.com';

    console.log(`Checking for workspace: "${workspaceName}"`);
    const workspaces = await prisma.workspace.findMany({
        where: { name: workspaceName }
    });
    console.log('Workspaces found:', workspaces);

    console.log(`Checking for user: "${email}"`);
    const users = await prisma.user.findMany({
        where: { email: email },
        include: { workspace: true }
    });
    console.log('Users found:', users.map(u => ({ id: u.id, email: u.email, workspace: u.workspace.name, workspaceId: u.workspaceId })));

    console.log('Checking for users in that specific workspace name...');
    const usersInWorkspace = await prisma.user.findMany({
        where: {
            email: email,
            workspace: {
                name: workspaceName
            }
        },
        include: { workspace: true }
    });
    console.log('Users in workspace match:', usersInWorkspace.map(u => ({ id: u.id, email: u.email, workspace: u.workspace.name })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
