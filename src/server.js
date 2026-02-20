import "./config/env.js";
import { connectionDb } from "./config/db.js";
import app from "./app.js";

connectionDb();

app.listen(3003, () => {
    console.log("app is started on 3003");
});