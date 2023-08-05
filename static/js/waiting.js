import { TableNumberManger } from "./table_number.js";
import { OrderMealsManger } from "./meals.js";

(async function ($) {
    const potMeatApiUrl = location.origin + '/api/pot_meat/'

    // pop() 取得陣列最後一位
    const tbNumberID = location.href.split('/').pop()
    const tbNumberData = TableNumberManger.getData({tbNumberID: tbNumberID})
    
    let getMeatApiData = async function () {
        try {
            // 獲取 response對象
            let response = await fetch(potMeatApiUrl)
            // 透過json()，取得response內資料
            let data_json = await response.json()
            console.log(data_json)
            return data_json
        }catch (error) {  // 捕獲異常 訊息
            console.log(error)
        }
    }

    let countGrandTotalPrice = function (meals) {
        let total = 0;
        $.each(meals, function () {
            total += (this.quantity * this.detail.price)
        });
        return total
    }

    let drawTableNumber = async function () {
        let data = await tbNumberData;
        $('#tb-number').text(data.tbNumber);
    }
    
    let drawTable = async function (tbNumberID) {
        let mealsData = await OrderMealsManger.getOrderMeals(tbNumberID);
        let meatDict = await getMeatApiData()
        let $tbody = $('#modal-table').find('tbody')
    
        // 添加 點餐資料
        $.each(mealsData, function (i, meal) {
            let totalPrice = meal.quantity * meal.detail.price
            $tbody.append(
                '<tr class="align-middle" data-id="' + meal.detail.id + '" data-price="' + meal.detail.price + '">' +
                '<td class="text-left" title="number">' + (i + 1) + '.</td>' +
                '<td class="text-justify" title="name">' + meal.detail.name + ' ('+ meatDict[meal.detail.meat] +')' + '</td>' +
                '<td class="text-right" title="quantity">x' + meal.quantity + '</td>' +
                '<td class="text-center" title="price"> $ '+ totalPrice + ' </td>' +
                '</tr>'
            );
        });

        // 添加 分隔線
        $tbody.append(
            '<tr>' +
            '<td colspan="100%">' +
                '<div class="my-auto" style="border: 0; border-top: 1px solid rgba(0,0,0,.1)"></div>' +
            '</td>' +
            '</tr>'
        );
    
        // 添加 價格總和 (位於最後一行)
        $tbody.append(
            '<tr>' +
            '<td></td>' +
            '<td class="text-left fw-bold"><strong>總 計</strong></td>' +
            '<td></td>' +
            '<td class="text-center fw-bold text-danger">' +
                '<strong> $ '+ countGrandTotalPrice(mealsData) + ' </strong>' +
            '</td>' +
            '</tr>'
        )
    }
    
    $(document).ready(async function () {
        await drawTableNumber();
        await drawTable(tbNumberID)
        // 顯示 modal
        $('#waiting-modal').modal('show');
    })
    
    // 禁止使用上一頁 (將歷史紀錄推入新狀態，只有/error這網址)
    $(window).on('popstate', function (event) {
        event.preventDefault();
        history.pushState(null, "SHABU 點餐系統 - 訂單已送出", location.href)
    });
})(jQuery)