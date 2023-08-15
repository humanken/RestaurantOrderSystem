import { TableNumberManager, OrderMealsManager, MenuManager } from "./Manager.js";

(async function ($) {
    const potMeatApiUrl = location.origin + '/api/pot_meat/'

    // pop() 取得陣列最後一位
    const tbNumberID = location.href.split('/').pop()
    const tbNumberData = TableNumberManager.getData({tbNumberID: tbNumberID})

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
    
    let drawTable = async function (mealsData) {
        let meatDict = await MenuManager.getMeatDict();
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
        let mealsData = await OrderMealsManager.getOrderMeals(tbNumberID);
        console.log(`tbNumberID: ${tbNumberID}, data: ${mealsData}`)
        if (mealsData.length === 0) { window.location.href = location.origin + '/error/'; }
        await drawTableNumber();
        await drawTable(mealsData)
        // 顯示 modal
        $('#waiting-modal').modal('show');
    })
    
    // 禁止使用上一頁 (將歷史紀錄推入新狀態，只有/error這網址)
    $(window).on('popstate', function (event) {
        event.preventDefault();
        history.pushState(null, "SHABU 點餐系統 - 訂單已送出", location.href)
    });
})(jQuery)