
import prisma from './utils/prisma';

async function main() {
    const email = 'test.user.1769585601050@example.com';
    console.log(`Searching for user with email: ${email}`);

    const user = await prisma.user.findFirst({
        where: { email },
        include: { workspace: true }
    });

    if (user) {
        console.log('User found!');
        console.log(`Workspace Name: ${user.workspace.name}`);
        console.log(`Workspace ID: ${user.workspace.id}`);
    } else {
        console.log('User not found.');
        // List all users to see if we can find something similar or just debugging
        const users = await prisma.user.findMany({ select: { email: true, workspace: { select: { name: true } } } });
        console.log('Available users:', users);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
