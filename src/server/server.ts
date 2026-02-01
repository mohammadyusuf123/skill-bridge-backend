import serverless from "serverless-http";
import app from "./app"; // Adjust path if needed

const handler = serverless(app);

export default handler;
