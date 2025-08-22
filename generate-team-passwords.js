// Team Member Password Generator
// Run this script to generate secure passwords for team members

const teamMembers = [
  {
    name: "Alina Atta",
    email: "alina.atta@changemechanics.pk",
    department: "Development",
    role: "user"
  },
  {
    name: "Rameesha Nouman", 
    email: "rameesha.nouman@changemechanics.pk",
    department: "Design",
    role: "user"
  },
  {
    name: "Mehar Alam",
    email: "mehar.alam@changemechanics.pk", 
    department: "Marketing",
    role: "user"
  },
  {
    name: "Umayr Masud",
    email: "umayr.masud@changemechanics.pk",
    department: "Development", 
    role: "user"
  },
  {
    name: "Muzammil Ahmed",
    email: "muzammil.ahmed@changemechanics.pk",
    department: "Development",
    role: "user"
  }
];

// Generate secure password function
function generateSecurePassword() {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Ensure at least one character from each category
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase  
  password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special char
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Generate passwords for all team members
console.log("🔐 TEAM MEMBER PASSWORDS GENERATED");
console.log("=====================================\n");

teamMembers.forEach((member, index) => {
  const password = generateSecurePassword();
  console.log(`${index + 1}. ${member.name}`);
  console.log(`   Email: ${member.email}`);
  console.log(`   Department: ${member.department}`);
  console.log(`   Role: ${member.role}`);
  console.log(`   Password: ${password}`);
  console.log(`   Login URL: https://your-app.vercel.app/`);
  console.log("");
});

console.log("📋 IMPORTANT NOTES:");
console.log("1. Share these passwords securely with each team member");
console.log("2. Ask them to change their password on first login");
console.log("3. Store these passwords in a secure password manager");
console.log("4. Delete this file after use for security");
console.log("\n🚀 Ready to onboard your team!");

// Export for potential use in other scripts
module.exports = {
  teamMembers,
  generateSecurePassword
};
