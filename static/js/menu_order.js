
const menuApiUrl = location.origin + '/api/menu/'
const potTypeApiUrl = location.origin + '/api/pot_type/'
const potMeatApiUrl = location.origin + '/api/pot_meat/'

// 使用 異步函數，不用一直(.then)
let getApiData = async function (url, params= null) {
    try {
        // 獲取 response對象
        let response = await fetch(
            (!params) ? url : url + `?${params}`)
        // 透過json()，取得response內資料
        let data_json = await response.json()
        console.log(data_json)
        return data_json
    }catch (error) {  // 捕獲異常 訊息
        console.log(error)
    }
}

const potTypeDict = getApiData(potTypeApiUrl)
const potMeatDict = getApiData(potMeatApiUrl)

/* 載入導航欄項目 (餐點種類) */
let loadingNavItems = async function () {
    let items = ""
    $.each(await potTypeDict, function (key, value) {
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
    template += '<select class="form-select card-subtitle food-meat my-3 w-50 mx-auto text-center" onchange="selectedMeat(this)">'
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

let loadingContainer = async function () {
    let sections = ``
    // 遍歷火鍋種類，一個火鍋種類一個section
    for (let [key, value] of Object.entries(await potTypeDict)) {
        let data = await getApiData(menuApiUrl, `type=${key}`)
        if (!data.length) { break }
        sections += `<section class="section" id="food-type-${key}" style="padding-top: 3.5rem">`
        // 新增 餐點種類 分隔線
        sections += `<hr><h2 class="text-center food-type">${value}</h2><hr>`
        // 資料重複處理
        let noRepeatData = repeatHandler(data, await potMeatDict)
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

loadingNavItems()
loadingContainer()

/* 當 肉量選擇框 選擇後觸發 -> 更改價格 */
function selectedMeat(obj) {
    // 取得下一個元素(價格元素)為 nextElementSibling
    // 自訂屬性 取得用.dataset
    obj.nextElementSibling.textContent = `$ ${obj.options[obj.selectedIndex].dataset.price}`
}

//監聽是否為返回鍵
window.addEventListener("pageshow", function (event){
    if (window.performance.navigation.type === 2 || window.performance.navigation.type === 0){
        console.log("按返回鍵或使用鏈結，禁止使用下一頁");
        history.pushState(null, document.title, location.href);
    }
},false);