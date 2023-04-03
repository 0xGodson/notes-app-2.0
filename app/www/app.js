const express = require("express");
const session = require("express-session");
const uuid = require("uuid").v4;
const cors = require("cors");
const app = express();
var crypto = require("crypto");

const visit = require("./bot");

const notes = new Map();
var allPosts = Object.create(null);

const URL = "http://127.0.0.1";

// Clear the runtime DB every 1 hrs
setInterval(() => {
  notes.clear();
  allPosts = Object.create(null);
  console.log("[🧹] DB cleared 😏");
}, 3600000);

const getPostByID = (id) => {
  if (allPosts[id]) {
    return allPosts[id];
  } else {
    return "404";
  }
};

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src fonts.gstatic.com fonts.googleapis.com 'self' 'unsafe-inline';font-src fonts.gstatic.com 'self'; script-src 'self'; base-uri 'self'; frame-src 'self'; frame-ancestors 'self';  object-src 'none';"
  );
  next();
});

// enable CORS for requests from localhost
app.use(
  cors({
    origin: [URL], // CORS 👊
    credentials: true,
    allowedHeaders: ["Content-Type", "mode"],
  })
);

app.use(
  session({
    secret: crypto.randomBytes(20).toString("hex"),
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false, maxAge: 600000 },
  })
);

// middleware to create a new session if it doesn't exist
const createSessionIfNotExists = (req, res, next) => {
  if (!req.session.sessionId) {
    req.session.sessionId = uuid();
    req.session.notes = [];
  }
  next();
};

app.use(express.static("static"));
app.use(express.json());
app.use(createSessionIfNotExists);

app.set("view engine", "ejs");

app.get("/notes", (req, res) => {
  if (!req.session.sessionId) {
    return res.redirect("/notes");
  } else {
    return res.render("index", { notes: notes.get(req.session.sessionId) });
  }
});

app.get("/create", (req, res) => {
  if (!req.session.sessionId) {
    return res.redirect("/notes");
  } else {
    return res.render("create");
  }
});

// route to create a new note
app.post("/create", (req, res) => {
  const note = req.body.note;
  const title = req.body.title;
  if (
    !note ||
    !title ||
    typeof note !== "string" ||
    typeof title !== "string"
  ) {
    return res.json({ status: "Note Title or Note Content is Empty" });
  } else {
    const sessionId = req.session.sessionId;
    const sessionNotes = notes.get(sessionId) || [];
    noteId = uuid();
    sessionNotes.push({
      noteId,
      title: title,
      note: note,
    });

    allPosts[noteId] = {
      title,
      note,
    };

    notes.set(sessionId, sessionNotes);
    return res.json({ status: "success" });
  }
});

app.get("/note/:id", (req, res) => {
  // TODO: Congifure CORS and setup an allowList
  let mode = req.headers["mode"];
  if (mode === "read") {
    res.setHeader("content-type", "text/plain"); // no xss
    res.send(getPostByID(req.params.id).note);
  } else {
    return res.render("note", { title: getPostByID(req.params.id).title });
  }
});

app.get("/visit", async (req, res) => {
  let url = req.query.url;
  if (!url) {
    return res.json({
      status: "false",
      message: `Usage: ${URL}/visit?url=https://your_super_cool_site`,
    });
  }

  if (typeof url === "string" && url.startsWith("http")) {
    visitStatus = await visit(url);
    if (visitStatus) {
      res.json({
        status: "true",
        message: "Wow 😄, Super C00L site 😎! thanks for sharing!👏",
      });
    } else {
      res.json({ status: "false", message: "Not impressed, TRY AGAIN 🤨" });
    }
  } else {
    return res.json({
      status: "false",
      message: "Only HTTP or HTTPS sites are allowed",
    });
  }
});

// DEBUG Endpoints
// TODO: Remove this before moving to prod
app.get("/debug/52abd8b5-3add-4866-92fc-75d2b1ec1938/:id", (req, res) => {
  let mode = req.headers["mode"];
  if (mode === "read") {
    res.send(getPostByID(req.params.id).note);
  } else {
    return res.status(404).send("404");
  }
});

app.get("*", (req, res) => {
  res.setHeader("content-type", "text/plain"); // no xss)
  res.status = 404;
  try {
    return res.send("404 - " + encodeURI(req.path));
  } catch {
    return res.send("404");
  }
});

app.listen(3000, () => {
  console.log(`[🔥] Server started on port 3000 (forwarded to 80) ⚡️ 🚀`);
});
