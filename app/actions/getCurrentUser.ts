import prisma from '@/app/libs/prismadb'

import getSession from './getSession'

const getCurrentUser = async() => {
    try {
        const session = await getSession();
        if(!session?.user?.email) return null;

        const currentUser = await prisma.user.findUnique({
            where : { email: session.user.email as string }
        })

        if(!currentUser) return null;

        currentUser.hashedPassword = 'xxxxxxx';

        return currentUser;
    } catch (error) {
        // Not doing throw errors, because that's break the application.
        // this is not an api route, this is server action.
        return null;
    }
}

export default getCurrentUser;