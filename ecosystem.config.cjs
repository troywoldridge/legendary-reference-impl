module.exports = {
  apps: [
    {
      name: "legendary-reference-impl",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3010",
      env: {
        NODE_ENV: "production",
        PORT: "3010",
        DATABASE_URL: "postgres://legendary_ref_user:legendary_ref_pass@localhost:5432/legendary_ref"
      },
    },
  ],
};
