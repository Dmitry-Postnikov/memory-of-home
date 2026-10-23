"""Автотесты трех ключевых требований MVP «Память дома».

REQ-1 (Поиск): результаты каталога соответствуют запросу; при отсутствии
совпадений показывается пустое состояние.

REQ-2 (Валидация): если название, категория или дата покупки не заполнены,
появляется ошибка, незаполненные поля отмечаются, объект не сохраняется.

REQ-3 (Сохранение/редактирование): введенный объект сохраняется, открывается
в карточке; изменения переживают реальную перезагрузку страницы.
"""

import json

from playwright.sync_api import expect
from conftest import restart_app

STORAGE_KEY = "pamyat-doma-mvp-v1"


def stored_items(page):
    """Читаем настоящий localStorage страницы, не подменяя приложение моками."""
    raw = page.evaluate("key => localStorage.getItem(key)", STORAGE_KEY)
    assert raw, "Приложение должно создать запись в localStorage"
    return json.loads(raw)["items"]


def test_search_shows_only_matching_items_and_empty_state(page):
    """REQ-1: Поиск отбирает только подходящие вещи."""
    # Применяем глобальный поиск так же, как пользователь — через форму.
    search = page.locator("#search-query")
    search.fill("Смеситель на кухне")
    search.press("Enter")

    expect(page.locator("#page-items")).to_be_visible()
    cards = page.locator("#page-items .thing-card")
    expect(cards).to_have_count(1)
    expect(cards.first.locator("h3")).to_contain_text("Смеситель на кухне")
    expect(page.locator("#page-items .search-summary")).to_contain_text("Смеситель на кухне")

    # Несуществующий запрос не должен показывать чужие карточки.
    search.fill("невозможная-вещь-abcdefgh-123")
    search.press("Enter")
    expect(cards).to_have_count(0)
    expect(page.locator("#page-items .empty-state")).to_contain_text("Ничего не найдено")


def test_required_fields_show_error_and_do_not_save(page):
    """REQ-2: При неполной форме нет ни навигации, ни сохранения."""
    initial_count = len(stored_items(page))
    page.locator("#top-add").click()
    expect(page.locator("#page-form")).to_be_visible()

    # Незаполненные все обязательные поля.
    page.locator('#item-form button[type="submit"]').click()
    expect(page.locator("#form-error")).to_be_visible()
    expect(page.locator("#form-error")).to_contain_text("Отсутствуют обязательные")
    for field in ("title", "category", "purchaseDate"):
        expect(page.locator(f"#f-{field}")).to_have_attribute("aria-invalid", "true")
    assert len(stored_items(page)) == initial_count

    # Даже с названием и категорией нельзя сохранить без даты покупки.
    page.locator("#f-title").fill("Тестовая вещь без даты")
    page.locator("#f-category").select_option(label="Бытовая техника")
    page.locator('#item-form button[type="submit"]').click()
    expect(page.locator("#f-purchaseDate")).to_have_attribute("aria-invalid", "true")
    expect(page.locator("#page-form")).to_be_visible()
    assert len(stored_items(page)) == initial_count
    assert not any(it["title"] == "Тестовая вещь без даты" for it in stored_items(page))


def test_create_edit_and_reload_keeps_item(page):
    """REQ-3: Создание, редактирование и сохранение после F5."""
    title = "Увлажнитель воздуха — автотест"
    edited_title = "Увлажнитель воздуха — обновлён"
    initial_count = len(stored_items(page))
    page.locator("#top-add").click()
    page.locator("#f-title").fill(title)
    page.locator("#f-category").select_option(label="Климатическая техника")
    page.locator("#f-room").select_option(label="Спальня")
    page.locator("#f-brand").fill("TestBrand")
    page.locator("#f-purchaseDate").fill("2026-10-12")
    page.locator("#f-notes").fill("Первичная заметка")
    page.locator('#item-form button[type="submit"]').click()

    expect(page.locator("#page-detail")).to_be_visible()
    expect(page.locator("#page-detail .detail-title h1")).to_have_text(title)
    assert len(stored_items(page)) == initial_count + 1
    added = next(it for it in stored_items(page) if it["title"] == title)
    assert added["room"] == "Спальня"
    assert added["purchaseDate"] == "2026-10-12"
    original_id = added["id"]

    # Реальная перезагрузка, а не только повторный рендер SPA.
    restart_app(page)
    expect(page.locator("#page-detail .detail-title h1")).to_have_text(title)

    # Редактируем и сохраняем с той же карточки.
    page.locator("#page-detail button[data-action='edit-item']").first.click()
    expect(page.locator("#page-form")).to_be_visible()
    page.locator("#f-title").fill(edited_title)
    page.locator("#f-notes").fill("Изменено автотестом")
    page.locator('#item-form button[type="submit"]').click()
    expect(page.locator("#page-detail .detail-title h1")).to_have_text(edited_title)

    restart_app(page)
    expect(page.locator("#page-detail .detail-title h1")).to_have_text(edited_title)
    matches = [it for it in stored_items(page) if it["id"] == original_id]
    assert len(matches) == 1, "Редактирование не должно создавать дубли"
    assert matches[0]["title"] == edited_title
    assert matches[0]["notes"] == "Изменено автотестом"
    assert len(stored_items(page)) == initial_count + 1
