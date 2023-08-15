import { MenuManager } from "./Manager.js";

(async function ($) {

    /* 載入導航欄項目 (餐點種類) */
    let loadingNavItems = async function () {
        let items = ""
        $.each(await MenuManager.getTypeDict(), function (key, value) {
            items += '<li class="nav-item">' +
                `<a class="nav-link" href="#food-type-${key}">${(value.length >= 6) ? value.slice(0, 4) : value}</a>` +
                '</li>'
        });
        $('#navbarSupportedContent ul').append(items)
    }

    /* 肉量 - 卡片模板 */
    let drawMeatSizeCard = function (food_name, food_details) {
        console.log(`food name: ${food_name}, details: ${food_details}`)
        let template = '<div class="col-md-4 pb-1 pb-md-0">' +
            `<div class='card my-2'>` +
            "<img class='card-img-top' src='/static/images/400X200.gif' alt='Card image cap'>" +
            "<div class='card-body' id='card-body'>"

        // 添加 餐點名稱
        template += `<h3 class='card-title food-name'>${food_name}</h3>`
        // 添加 肉量 選擇框
        template += '<select class="form-select card-subtitle food-meat my-3 w-50 mx-auto text-center">'
        $.each(food_details, function (i, detail) {
            template += ((i === 0) ? `<option selected `: `<option `) +`value="${detail.id}" data-price="${detail.price}">${detail.meat}</option>`
        })
        template += '</select>'
        // 添加 餐點價格 (依據肉量變動)，預設為肉量第一個選擇
        template += `<p class='card-text food-price'>$ ${food_details[0].price}</p>`
        // 添加 加入購物車 按鈕
        template += "<button class='btn btn-danger' id='add-to-cart'>Add to Cart</button></div></div></div>"
        return template
    }

    /* 處理 餐點名稱重複；肉、價格不重複 的資料 */
    let repeatHandler = function (data, meatDict) {
        let handlerData = {}
        $.each(data, function (i, item) {
            let detail = {'id': item.id, 'meat': meatDict[item.meat], 'price': item.price}
            handlerData.hasOwnProperty(item.name) ? handlerData[item.name].push(detail) : handlerData[item.name] = [detail]
        })
        return handlerData
    }

    /* 載入餐點內容 */
    let loadingContainer = async function () {
        let sections = ``
        // 遍歷火鍋種類，一個火鍋種類一個section
        for (let [key, value] of Object.entries(await MenuManager.getTypeDict())) {
            let data = await MenuManager.getMenuData(key);
            if (!data.length) { break }
            sections += `<section class="section" id="food-type-${key}" style="padding-top: 3.5rem">`
            // 新增 餐點種類 分隔線
            sections += `<hr><h2 class="text-center food-type">${value}</h2><hr>`
            // 資料重複處理
            let noRepeatData = repeatHandler(data, await MenuManager.getMeatDict())
            // 添加 card 模板
            sections += '<div class="container"><div class="row text-center">'
            $.each(noRepeatData, function (key, value) {
                sections += drawMeatSizeCard(key, value)
            })
            // 添加 class='container' 結尾
            sections += '</div></div></section>'
        }
        $('#div-content').append(sections)
    }

    await loadingNavItems()
    await loadingContainer()

    /* ----------------------------------- 監聽 --------------------------------------- */
    $('.card select').on('change', function () {
        // 依據選擇的肉，變更價格
        const $selected = $(this).find('option:selected');
        $(this).next('.food-price').text(`$ ${$selected.data('price')}`);
    })

}) (jQuery)


