// Team Member Account Setup Script
// This script will help you create team member accounts in Supabase

const teamMembers = [
  {
    name: "Alina Atta",
    email: "alina.atta@changemechanics.pk",
    department: "Development",
    role: "user",
    phone: "+92 300 1234567",
    location: "Lahore, Pakistan",
    bio: "Full-stack developer with expertise in React, Node.js, and cloud technologies.",
    skills: ["React", "Node.js", "TypeScript", "AWS", "Docker"]
  },
  {
    name: "Rameesha Nouman", 
    email: "rameesha.nouman@changemechanics.pk",
    department: "Design",
    role: "user",
    phone: "+92 300 2345678",
    location: "Karachi, Pakistan",
    bio: "UI/UX designer passionate about creating intuitive and beautiful user experiences.",
    skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping", "Design Systems"]
  },
  {
    name: "Mehar Alam",
    email: "mehar.alam@changemechanics.pk", 
    department: "Marketing",
    role: "user",
    phone: "+92 300 3456789",
    location: "Islamabad, Pakistan",
    bio: "Digital marketing specialist with expertise in social media, SEO, and content strategy.",
    skills: ["Social Media Marketing", "SEO", "Content Strategy", "Google Analytics", "Email Marketing"]
  },
  {
    name: "Umayr Masud",
    email: "umayr.masud@changemechanics.pk",
    department: "Development", 
    role: "user",
    phone: "+92 300 4567890",
    location: "Faisalabad, Pakistan",
    bio: "Backend developer specializing in Python, Django, and database design.",
    skills: ["Python", "Django", "PostgreSQL", "REST APIs", "Microservices"]
  },
  {
    name: "Muzammil Ahmed",
    email: "muzammil.ahmed@changemechanics.pk",
    department: "Development",
    role: "user",
    phone: "+92 300 5678901",
    location: "Rawalpindi, Pakistan",
    bio: "Mobile app developer with experience in React Native and Flutter.",
    skills: ["React Native", "Flutter", "JavaScript", "Mobile UI/UX", "App Store Optimization"]
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

// Generate new passwords for all team members
console.log("🔐 NEW TEAM MEMBER PASSWORDS GENERATED");
console.log("========================================\n");

const updatedTeamMembers = teamMembers.map((member, index) => {
  const password = generateSecurePassword();
  return { ...member, password };
});

updatedTeamMembers.forEach((member, index) => {
  console.log(`${index + 1}. ${member.name}`);
  console.log(`   Email: ${member.email}`);
  console.log(`   Password: ${member.password}`);
  console.log(`   Department: ${member.department}`);
  console.log(`   Role: ${member.role}`);
  console.log("");
});

console.log("📋 SETUP INSTRUCTIONS:");
console.log("=======================");
console.log("1. Go to your Supabase Dashboard");
console.log("2. Navigate to Authentication > Users");
console.log("3. Click 'Add User' for each team member");
console.log("4. Use the emails and passwords above");
console.log("5. After creating users, run the SQL script below");
console.log("\n🚀 Ready to create accounts!");

// Export for use in other scripts
module.exports = {
  teamMembers: updatedTeamMembers,
  generateSecurePassword
};
