import app from "./app";

const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("PORT environment variable is not set");
}

app.listen(Number(PORT), () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

