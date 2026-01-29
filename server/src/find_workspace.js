
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'test.user.1769585601050@example.com';
    console.log(`Searching for user with email: ${email}`);

    // We need to check if we can actually query.
    // The schema has User related to Workspace.

    try {
        const user = await prisma.user.findFirst({
            where: { email: email },
            include: { workspace: true }
        });

        if (user) {
            console.log('User found!');
            console.log(`Workspace Name: ${user.workspace.name}`);
            console.log(`Workspace ID: ${user.workspace.id}`);
        } else {
            console.log('User not found.');
            // Fallback: list all workspaces
            const workspaces = await prisma.workspace.findMany();
            console.log('All Workspaces:', workspaces.map(w => w.name));
        }
    } catch (err) {
        console.error('Error querying database:', err);
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
