import mongoose from 'mongoose';
import Menu from '../models/Menu';
import RolePermission from '../models/RolePermission';

const uri = "mongodb://localhost:27017/promanage"; // Default local URI

async function run() {
  await mongoose.connect(uri);
  const menuExists = await Menu.findOne({ path: '/users' });
  if (!menuExists) {
    const menu = await Menu.create({
      name: 'Users',
      path: '/users',
      icon: 'Users',
      order: 3
    });
    const roles = ['ADMIN', 'PM', 'MEMBER', 'VIEWER'];
    const perms = roles.map(role => ({
      role,
      menu_id: menu._id,
      can_read: role === 'ADMIN',
      can_create: role === 'ADMIN',
      can_update: role === 'ADMIN',
      can_delete: role === 'ADMIN',
    }));
    await RolePermission.insertMany(perms);
    console.log("Seeded Users Menu for ADMIN only");
  } else {
    console.log("Users menu already exists");
  }
  await mongoose.disconnect();
}
run();
