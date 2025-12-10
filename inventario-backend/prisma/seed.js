const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

async function main() {
  console.log("🌱 Ejecutando seeds...");

  // Crear roles
  await prisma.rol.upsert({
    where: { nombre: "ADMIN" },
    update: {},
    create: { nombre: "ADMIN" }
  });

  await prisma.rol.upsert({
    where: { nombre: "VENDEDOR" },
    update: {},
    create: { nombre: "VENDEDOR" }
  });

  // Crear admin
  const adminEmail = "admin@admin.com";
  const adminPass = bcrypt.hashSync("Admin123", 10);

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nombre: "Administrador",
      email: adminEmail,
      password_hash: adminPass,
      rol: { connect: { nombre: "ADMIN" } }
    }
  });

  console.log("✔ Usuario admin creado (si no existía)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🌱 Seeds finalizados.");
  });
