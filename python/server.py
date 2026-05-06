"""
ruyipage HTTP服务
为Electron main进程提供HTTP接口，封装ruyipage的所有操作。
启动: python server.py [--port 7788]
"""

import json
import argparse
import uuid
import base64
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# 会话存储
sessions: dict = {}


def _get_session(session_id: str):
    if session_id not in sessions:
        raise KeyError(f"Session not found: {session_id}")
    return sessions[session_id]


def _ok(data=None):
    return {"status": "ok", **({"data": data} if data is not None else {})}


def _err(msg: str):
    return {"status": "error", "error": msg}


# ─── API 处理函数 ───────────────────────────────────────────────────────────────

def api_launch(params: dict):
    from ruyipage import FirefoxOptions, launch

    opts = FirefoxOptions()
    if params.get("exe_path"):
        opts.set_browser_path(params["exe_path"])
    if params.get("profile"):
        opts.set_user_dir(params["profile"])
    if params.get("fpfile"):
        opts.set_fpfile(params["fpfile"])
    if params.get("proxy"):
        opts.set_proxy(params["proxy"])
    if params.get("headless"):
        opts.headless(True)
    if params.get("human_algorithm"):
        opts.set_human_algorithm(params["human_algorithm"])

    page = launch(opts)
    session_id = str(uuid.uuid4())
    sessions[session_id] = page
    return _ok({"sessionId": session_id})


def api_navigate(params: dict):
    page = _get_session(params["sessionId"])
    page.get(params["url"])
    return _ok({"url": page.url, "title": page.title})


def api_find_element(params: dict):
    page = _get_session(params["sessionId"])
    ele = page.ele(params["selector"])
    if ele is None:
        return _err("Element not found")
    return _ok({"text": ele.text, "tag": ele.tag})


def api_click(params: dict):
    page = _get_session(params["sessionId"])
    page.ele(params["selector"]).click_self()
    return _ok()


def api_input(params: dict):
    page = _get_session(params["sessionId"])
    page.ele(params["selector"]).input(params["text"])
    return _ok()


def api_screenshot(params: dict):
    page = _get_session(params["sessionId"])
    png_bytes = page.get_screenshot()
    b64 = base64.b64encode(png_bytes).decode()
    return _ok({"image": b64, "type": "png"})


def api_get_cookies(params: dict):
    page = _get_session(params["sessionId"])
    cookies = page.get_cookies()
    return _ok({"cookies": cookies})


def api_set_cookies(params: dict):
    page = _get_session(params["sessionId"])
    for cookie in params.get("cookies", []):
        page.set_cookies(cookie)
    return _ok()


def api_page_info(params: dict):
    page = _get_session(params["sessionId"])
    return _ok({"url": page.url, "title": page.title})


def api_close(params: dict):
    session_id = params["sessionId"]
    page = _get_session(session_id)
    page.quit()
    del sessions[session_id]
    return _ok()


def api_list_sessions(_params: dict):
    result = []
    for sid, page in sessions.items():
        try:
            result.append({"sessionId": sid, "url": page.url, "title": page.title})
        except Exception:
            result.append({"sessionId": sid, "url": "", "title": ""})
    return _ok({"sessions": result})


def api_execute_script(params: dict):
    page = _get_session(params["sessionId"])
    result = page.run_js(params["script"])
    return _ok({"result": result})


def api_set_proxy(params: dict):
    page = _get_session(params["sessionId"])
    page.set_proxy(params["proxy"])
    return _ok()


def api_set_geolocation(params: dict):
    page = _get_session(params["sessionId"])
    page.emulation.set_geolocation(params["lat"], params["lon"])
    return _ok()


HANDLERS = {
    "launch": api_launch,
    "navigate": api_navigate,
    "find_element": api_find_element,
    "click": api_click,
    "input": api_input,
    "screenshot": api_screenshot,
    "get_cookies": api_get_cookies,
    "set_cookies": api_set_cookies,
    "page_info": api_page_info,
    "close": api_close,
    "list_sessions": api_list_sessions,
    "execute_script": api_execute_script,
    "set_proxy": api_set_proxy,
    "set_geolocation": api_set_geolocation,
}

# ─── HTTP 服务 ─────────────────────────────────────────────────────────────────

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"[HTTP] {fmt % args}")

    def _send_json(self, data: dict, status: int = 200):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._send_json({"status": "ok", "sessions": len(sessions)})
        else:
            self._send_json({"error": "Not found"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path  # e.g. /api/launch

        if not path.startswith("/api/"):
            self._send_json({"error": "Not found"}, 404)
            return

        method = path[len("/api/"):]
        if method not in HANDLERS:
            self._send_json({"error": f"Unknown method: {method}"}, 404)
            return

        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            params = json.loads(body) if body else {}
        except json.JSONDecodeError:
            self._send_json({"error": "Invalid JSON"}, 400)
            return

        try:
            result = HANDLERS[method](params)
            self._send_json(result)
        except KeyError as e:
            self._send_json({"error": str(e)}, 404)
        except Exception as e:
            self._send_json({"error": str(e)}, 500)


def main():
    parser = argparse.ArgumentParser(description="ruyipage HTTP bridge server")
    parser.add_argument("--port", type=int, default=7788)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    server = HTTPServer((args.host, args.port), Handler)
    print(f"ruyipage server listening on http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")


if __name__ == "__main__":
    main()
