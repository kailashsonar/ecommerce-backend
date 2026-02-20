import "./config/env.js";
import { connectionDb } from "./config/db.js";
import app from "./app.js";

connectionDb();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("app is started on 3003");
});
