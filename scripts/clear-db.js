const { PrismaClient } = require("../src/generated/prisma");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neonConfig } = require("@neondatabase/serverless");
const { WebSocket } = require("ws");

neonConfig.webSocketConstructor = WebSocket;

const connectionString = process.env.POSTGRES_PRISMA_URL;
if (!connectionString) {
  console.error("POSTGRES_PRISMA_URL not set");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.feedbackResponse.deleteMany();
  await prisma.feedbackSubmission.deleteMany();
  await prisma.reviewToken.deleteMany();
  console.log("All data cleared.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e.message);
    prisma.$disconnect();
    process.exit(1);
  });
