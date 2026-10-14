import {spawn} from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_BIN = "/Applications/Firefox.app/Contents/MacOS/firefox";

const connect = (url) =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => resolve(ws));
    ws.addEventListener("error", (event) => reject(new Error(`websocket ${url}: ${event.message ?? "error"}`)));
  });

const client = (ws, onLog) => {
  let next = 1;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data));
    if (message.method === "log.entryAdded") {
      onLog(message.params.text);
      return;
    }
    const waiter = pending.get(message.id);
    if (waiter === undefined) {
      return;
    }
    pending.delete(message.id);
    if (message.type === "error") {
      waiter.reject(new Error(`${message.error}: ${message.message}`));
    } else {
      waiter.resolve(message.result);
    }
  });
  return (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = next++;
      pending.set(id, {resolve, reject});
      ws.send(JSON.stringify({id, method, params}));
    });
};

export const firefoxVersion = (bin = process.env.FIREFOX_BIN ?? DEFAULT_BIN) => {
  if (!fs.existsSync(bin)) {
    return null;
  }
  const plist = path.join(bin, "..", "..", "Info.plist");
  const m = fs.existsSync(plist) ? fs.readFileSync(plist, "utf8").match(/CFBundleShortVersionString<\/key>\s*<string>([^<]+)/) : null;
  return m === null ? "unknown" : m[1];
};

export const evaluateInFirefox = async (pageUrl, expression, onLog = () => {}, bin = process.env.FIREFOX_BIN ?? DEFAULT_BIN) => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ff-bench-"));
  fs.writeFileSync(
    path.join(profile, "user.js"),
    ['user_pref("remote.active-protocols", 1);', 'user_pref("browser.shell.checkDefaultBrowser", false);', 'user_pref("datareporting.policy.dataSubmissionEnabled", false);'].join("\n")
  );
  const proc = spawn(bin, ["-headless", "-no-remote", "-profile", profile, "--remote-debugging-port", "0", "about:blank"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  const wsUrl = await new Promise((resolve, reject) => {
    let log = "";
    const onData = (chunk) => {
      log += chunk;
      const m = log.match(/WebDriver BiDi listening on (ws:\/\/\S+)/);
      if (m !== null) {
        resolve(m[1]);
      }
    };
    proc.stdout.on("data", onData);
    proc.stderr.on("data", onData);
    proc.on("exit", (code) => reject(new Error(`firefox exited with ${code} before BiDi was up:\n${log}`)));
    setTimeout(() => reject(new Error(`BiDi endpoint not announced in 60s:\n${log}`)), 60_000);
  });
  try {
    const ws = await connect(`${wsUrl}/session`);
    const send = client(ws, onLog);
    await send("session.new", {capabilities: {}});
    await send("session.subscribe", {events: ["log.entryAdded"]});
    const tree = await send("browsingContext.getTree");
    const context = tree.contexts[0].context;
    await send("browsingContext.navigate", {context, url: pageUrl, wait: "complete"});
    const result = await send("script.evaluate", {
      expression,
      target: {context},
      awaitPromise: true,
      resultOwnership: "none",
    });
    if (result.type !== "success") {
      throw new Error(`evaluate failed: ${JSON.stringify(result.exceptionDetails?.text ?? result)}`);
    }
    ws.close();
    return result.result.value;
  } finally {
    proc.kill("SIGKILL");
    fs.rmSync(profile, {recursive: true, force: true});
  }
};
