import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Replace this with the email of the user you want to change
    const userEmail = 'rfridlyand@gmail.com';
    
    // First, check if the user exists
    const user = await prisma.users.findUnique({
      where: { 
        email: userEmail 
      }
    });
    
    if (!user) {
      console.log(`User with email ${userEmail} not found`);
      return;
    }
    
    console.log('Found user:', user);
    
    // Update the user role to 'admin'
    const updatedUser = await prisma.users.update({
      where: { 
        user_id: user.user_id 
      },
      data: { 
        role: 'admin' 
      }
    });
    
    console.log('Successfully updated user role to admin:', updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();