import User from "./User/models/UsersModel.js"; // Adjust the path if needed
import bcrypt from "bcrypt";

const createAdminUser = async () => {
  const adminEmail = "admin@gmail.com"; // <-- Set your admin email here
  const adminPassword = "admin123"; // <-- Set your admin password here

  const existingAdmin = await User.findOne({ email: adminEmail, role: "admin" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = new User({
      fullName: "Admin",
      email: adminEmail,
      phone: "0000000000",
      password: hashedPassword,
      role: "admin",
      position: null,
    });
    await adminUser.save();
    console.log("Admin user created!");
  } else {
    console.log("Admin user already exists.");
  }
};

// Call this function after MongoDB connection is established
export { createAdminUser };