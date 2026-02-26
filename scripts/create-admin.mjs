import dotenv from "dotenv";
import postgres from "postgres";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

function parseArgs(argv) {
  const parsed = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const trimmed = token.slice(2);
    const eqIndex = trimmed.indexOf("=");

    if (eqIndex > -1) {
      const key = trimmed.slice(0, eqIndex);
      const value = trimmed.slice(eqIndex + 1);
      parsed[key] = value;
      continue;
    }

    const key = trimmed;
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      parsed[key] = next;
      i += 1;
      continue;
    }

    parsed[key] = "";
  }

  return parsed;
}

function printUsage() {
  console.log(
    "Usage: npm run db:create-admin -- --email=<email> --password=<password> [--name=<name>] [--role=admin]"
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const email = (args.email || "").trim().toLowerCase();
  const password = (args.password || "").trim();
  const name = (args.name || "Admin").trim();
  const role = (args.role || "admin").trim();

  if (!email || !password) {
    printUsage();
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing in .env.local");
    process.exit(1);
  }

  const isLocal =
    process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1");

  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
    ssl: isLocal ? false : "require",
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const [admin] = await sql`
      INSERT INTO admin_users (email, password_hash, name, role)
      VALUES (${email}, ${passwordHash}, ${name}, ${role})
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        role = EXCLUDED.role
      RETURNING id, email, name, role
    `;

    console.log(`Admin ready: ${admin.email} (${admin.role})`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error("Failed to create/update admin user:", error);
  process.exit(1);
});
