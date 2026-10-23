"""Фикстуры: локальный сервер и независимый браузер для каждого теста."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
from shutil import which
from threading import Thread

import pytest
from playwright.sync_api import Error as PlaywrightError, sync_playwright

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class QuietHandler(SimpleHTTPRequestHandler):
    """Не выводим запросы статических файлов в консоль тестов."""

    def log_message(self, format, *args):
        pass


@pytest.fixture(scope="session")
def base_url():
    """Поднимает настоящий HTTP-сервер на свободном локальном порту."""
    handler = partial(QuietHandler, directory=str(PROJECT_ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


@pytest.fixture(scope="session")
def browser():
    """Chromium запускается один раз для ускорения тестов."""
    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch(headless=True)
        except PlaywrightError as exc:
            # В учебной среде установлен системный Chromium, но Playwright Browser
            # может отсутствовать. На машине студента install chromium решает вопрос.
            system_chromium = which("chromium") or which("chromium-browser")
            if not system_chromium:
                raise exc
            browser = playwright.chromium.launch(
                executable_path=system_chromium,
                headless=True,
                args=["--no-sandbox"],
            )
        try:
            yield browser
        finally:
            browser.close()


@pytest.fixture()
def page(browser, base_url):
    """Каждый тест получает новый контекст с чистым localStorage."""
    context = browser.new_context(viewport={"width": 1440, "height": 900}, locale="ru-RU")
    page = context.new_page()
    if os.environ.get("PAMYAT_TEST_EMBEDDED") == "1":
        # Только для ограниченных учебных сред, где Chrome policy блокирует
        # вообще все HTTP-адреса. Обычная команда pytest использует реальный HTTP.
        mount_embedded_app(page)
    else:
        page.goto(base_url, wait_until="load")
    try:
        yield page
    finally:
        context.close()


def mount_embedded_app(page, stored=None, path=""):
    """Локальный fallback для среды с URLBlocklist=*. Не заменяет E2E HTTP."""
    page.set_content((PROJECT_ROOT / "index.html").read_text(encoding="utf-8"))
    page.evaluate("""stored => {
      const data = stored || {};
      Object.defineProperty(window, 'localStorage', { configurable: true, value: {
        getItem: k => Object.prototype.hasOwnProperty.call(data,k) ? data[k] : null,
        setItem: (k,v) => { data[k] = String(v); },
        removeItem: k => { delete data[k]; },
        clear: () => { Object.keys(data).forEach(k => delete data[k]); }
      }});
    }""", stored)
    for sheet in ("styles.css", "mvp.css"):
        page.add_style_tag(content=(PROJECT_ROOT / sheet).read_text(encoding="utf-8"))
    if path:
        page.evaluate("hash => { window.location.hash = hash; }", path)
    page.add_script_tag(content=(PROJECT_ROOT / "storage.js").read_text(encoding="utf-8"))
    page.add_script_tag(content=(PROJECT_ROOT / "app.js").read_text(encoding="utf-8"))


def restart_app(page):
    """F5 при обычном HTTP; повторная загрузка кода при embed-mode."""
    if os.environ.get("PAMYAT_TEST_EMBEDDED") != "1":
        page.reload(wait_until="load")
        return
    # Симуляция перезапуска окна без изменения поведения приложения;
    # localStorage-shim в этом окружении передается в новый JS context.
    key = "pamyat-doma-mvp-v1"
    stored = {key: page.evaluate("key => localStorage.getItem(key)", key)}
    path = page.evaluate("() => location.hash")
    page.goto("about:blank")
    mount_embedded_app(page, stored=stored, path=path)
