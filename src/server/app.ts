import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import cors from "cors"
const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

app.use(express.json());

// Auth routes 
app.all('/api/auth/*splat', toNodeHandler(auth));
 

app.get("/", (req, res) => {
    res.send("Welcome to Skill Bridge")
})

export default app