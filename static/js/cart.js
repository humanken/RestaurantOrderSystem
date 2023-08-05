import { TableNumberManger } from "./table_number.js";
import { OrderMealsManger } from "./meals.js";

(async function ($) {
    const tbNumberID = 2
    await TableNumberManger.checkRedirect(tbNumberID);

    const sendApiUrl = location.origin + '/api/send/'
    const waitingUrl = location.origin + `/waiting/${tbNumberID}`

    const idCartModel = 'cart-model'
    const idCartTable = 'cart-table'
    const clsMealQuantity = 'meal-quantity'
    const clsMealTotal = 'meal-total'
    const clsMealRemove = 'meal-remove'

    let drawTableModel = function () {
    $('body').append(
        '<div class="modal fade" id="' + idCartModel + '" aria-hidden="true" tabindex="-1"' +
        ' aria-labelledby="myModalLabel">' +
        '<div class="modal-dialog" role="document">' +
        '<div class="modal-content">' +
        '<div class="modal-header ms-2 me-3">' +
        '<h4 class="modal-title" id="myModalLabel" style="color: #9A9667;">' +
        '<span class="bi bi-cart-fill"></span><strong> 購物車 </strong>' +
        '</h4>' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
        '<span aria-hidden="true" style="font-size: 2rem;">&times;</span>' +
        '</button>' +
        '</div>' +
        '<div class="modal-body">' +
        '<table class="table table-hover table-responsive" id="' + idCartTable + '"></table>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-primary" id="check-out">前往下一步</button>' +
        '<button type="button" class="btn btn-secondary" data-dismiss="modal">關閉購物車</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'
    );
}

    let drawTable = function (meals, meatDict) {
        const $cartTable = $('#' + idCartTable)
        $cartTable.empty()

        // 沒有點餐資料，顯示alert訊息
        if (!meals.length) {
            $cartTable.append(
                '<div class="alert alert-danger" role="alert" id="emptyMessage">Your cart is empty</div>'
            )
            return
        }

        // 添加 標頭欄位
        $cartTable.append(
            '<tbody>' +
            '<thead class="text-center table-light">' +
            '<tr>' +
            '<th>圖片</th>' +
            '<th>餐點名稱</th>' +
            '<th>單價</th>' +
            '<th>數量</th>' +
            '<th>總價</th>' +
            '<th></th>' +
            '</tr>' +
            '</thead>'
        );

        // 添加 點餐資料
        $.each(meals, function () {
            let totalPrice = this.quantity * this.detail.price;
            $cartTable.append(
                '<tr class="align-middle" data-id="' + this.detail.id + '" data-price="' + this.detail.price + '">' +
                '<td class="text-center" style="width: 6rem;">' +
                '<img width="40px" height="40px" src="/static/images/40X40.gif" alt=""/>' +
                '</td>' +
                '<td class="text-justify food-name">' + this.detail.name + ' ('+ meatDict[this.detail.meat] +')' + '</td>' +
                '<td title="Unit Price" class="text-center">' + this.detail.price + '</td>' +
                '<td class="text-center" title="Quantity">' +
                '<input type="number" min="1" style="width: 70px;" class="text-center ' + clsMealQuantity + '" value="' + this.quantity + '"/>' +
                '</td>' +
                '<td title="Total" class="text-center ' + clsMealTotal + '"> $ ' + totalPrice + ' </td>' +
                '<td title="Remove from Cart" class="text-center" style="width: 30px;">' +
                '<a href="javascript:void(0);"' + ' class="btn btn-xs btn-danger ' + clsMealRemove + '">X</a>' +
                '</td>' +
                '</tr>'
            );
        });

        // 添加 價格總和 (位於最後一行)
        $cartTable.append(
            '<tr style="background-color: rgba(208,204,143,0.85);">' +
            '<td></td>' +
            '<td class="text-center fw-bold"><strong>Total</strong></td>' +
            '<td></td>' +
            '<td></td>' +
            '<td class="text-center fw-bold text-danger">' +
            '<strong id="grand-total-price"></strong>' +
            '</td>' +
            '<td></td>' +
            '</tr>' +
            '</tbody>'
        )
    }

    /* 累計所有餐點金額 */
    let drawGrandTotalPrice = function (grandTotalPrice) {
        $('#grand-total-price').text(` $ ${grandTotalPrice} `)
    }

    /* 更新購物車表格 */
    let updateCartTable = async function () {
        let meals = OrderMealsManger.getOrderMeals(tbNumberID)
        drawTable(await meals, await potMeatDict);
        await updateGrandTotalPrice();
        await setFooterBtnStatus(await meals);
    }

    /* 更新累計金額 */
    let updateGrandTotalPrice = async function () {
        let grandTotalPrice = OrderMealsManger.getGrandTotalPrice(tbNumberID)
        drawGrandTotalPrice(await grandTotalPrice)
    }

    /* 顯示購物車旁邊圖標的餐點總數量 */
    let showQuantity = async function (animate = false) {
        let $numCart = $('#cart .num-cart')
        let total = await OrderMealsManger.getTotalQuantity(tbNumberID)
        $numCart.text(total);
        if (animate) {
            $numCart.toggleClass('animate');
            $numCart.on('transitionend', function () {
                $numCart.toggleClass('animate');
                $numCart.off('transitionend');
            });
        }
    }

    /* 依據購物車餐點數量，控制購物車內底部的按鈕，啟用或禁用 */
    let setFooterBtnStatus = function (meals) {
        const $check_out = $('#check-out')
        if (!meals.length) {
            $check_out.attr('disabled', 'disabled');
        }else {
            $check_out.removeAttr('disabled');
        }
    };

    /* 使用SweetAlert顯示訊息，文檔: https://sweetalert.js.org/guides/ */
    let showAlertMessage = function (title, contentText, icon, btns, isDanger=false, callback) {
        swal({
            title: title,
            text: contentText,
            icon: icon,
            buttons: btns,
            dangerMode: isDanger
        }).then((clickedBtn) => callback(clickedBtn))
    }

    /* 添加到購物車 的 動畫 */
    let addToCartAnimation = function ($addToCartBtn){
        let imgSrc = $addToCartBtn.parent().prevAll('img').attr('src')
        let $image = $(`<img id="add_img" width="50px" height="50px" src="${imgSrc}" alt=""/>`)
            .css({"position":"fixed", "z-index":999});
        $("body").append($image);
        $("#add_img").offset({top: $addToCartBtn.offset().top, left: $addToCartBtn.offset().left})
        let cartPosition = $("#cart").position();
        $image.animate({
            top: cartPosition.top,
            left: cartPosition.left
        }, 500, "linear", function (){
            $image.remove();
        });
    }

    let sendOrderMeals = async function (totalQuantity, totalPrice) {
        let params = {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'tbNumberID': tbNumberID,
                'grandTotalQuantity': totalQuantity,
                'grandTotalPrice': totalPrice
            })
        }
        try {
            return await fetch(sendApiUrl, params)
        }catch (error) {  // 捕獲異常 訊息
            console.log(`send order meal error: ${error}`)
        }
    }

    /* ------------------------------------------- Event -------------------------------------------------------- */
    $('#cart').click(async function () {
        let meals = OrderMealsManger.getOrderMeals(tbNumberID)
        let grandTotalPrice = OrderMealsManger.getGrandTotalPrice(tbNumberID)
        drawTableModel()
        drawTable(await meals, await potMeatDict)
        drawGrandTotalPrice(await grandTotalPrice)
        setFooterBtnStatus(await meals)
        $("#" + idCartModel).modal('show');
    })

    /* 購物車內表格的input更動觸發 */
    $(document).on('input', `.${clsMealQuantity}`, async function () {
        const $tr = $(this).closest('tr')
        const quantity = $(this).val()
        // 更新 餐點總價格
        $tr.find(`.${clsMealTotal}`).text(` $ ${$tr.data('price') * quantity} `)
        await OrderMealsManger.update(tbNumberID, $tr.data('id'), quantity)
        await updateGrandTotalPrice()
        await showQuantity()
    })

    /* 購物車內表格的所有tr內的刪除鍵，觸發 */
    $(document).on('click', `.${clsMealRemove}`, async function () {
        let trLength = $(this).closest('tbody').children('tr').length
        let $tr = $(this).closest('tr')
        let tdLength = $tr.children('td').length
        let foodName = $tr.find('td.food-name').text()

        let removeFinished = async function (isRemove) {
            if (isRemove) {
                await OrderMealsManger.remove(tbNumberID, $tr.data('id'));
                swal('餐點已刪除', {icon: 'success', buttons: false});
                $tr.children('td').animate({ padding: 0 })
                    .wrapInner('<div />').children()
                    .slideUp(function () {
                        $(this).closest('tr').remove();
                        tdLength--
                        if (!tdLength) {
                            if (trLength === 2) { updateCartTable(); }
                            else { updateGrandTotalPrice(); }
                        }
                    });
               setTimeout(function () {
                   showQuantity();
                   swal.close();
               }, 2000);
            }
        }

        showAlertMessage(
            '確定刪除嗎?', `確定要刪除"${foodName}"餐點嗎?`,
            'warning', {cancel: '取消', confirm: '確定'}, true,
            (isClick) => removeFinished(isClick)
        )
    })

    $(document).on('click', '#check-out', function () {
        let $trs = $(this).parent().prevAll('.modal-body').find('tbody').children('tr')
        let totalQuantity = $('.num-cart').text()
        let sendFinished = async function (isSend) {
            if (isSend) {
                swal('訂單已送出', {icon: 'success', buttons: false});
                let totalPrice = $trs.last().text().split(' ')[2]
                sendOrderMeals(totalQuantity, totalPrice)
                await TableNumberManger.send(tbNumberID)
                setTimeout(function () {
                   swal.close();
                   $('#' + idCartModel).modal('hide');
                   window.location.href = waitingUrl
                }, 2000);
            }
        };

        showAlertMessage(
            '確定要送出訂單嗎?', '',
            'warning', {cancel: '取消', confirm: '確定'}, false,
            (isClick) => sendFinished(isClick)
        );
    })

    /* 每個餐點的加入購物車按鈕，觸發 */
    $(document).on('click', '#add-to-cart', async function () {
        let mealID = $(this).prevAll('select').find('option:selected').val()
        let quantity = await OrderMealsManger.getQuantity(tbNumberID, mealID)
        addToCartAnimation($(this));
        if (!quantity) {
            console.log('沒有這筆餐點，新增')
            await OrderMealsManger.add(tbNumberID, mealID, 1)
        } else {
            console.log('有這筆餐點，數量累加並更新')
            await OrderMealsManger.update(tbNumberID, mealID, quantity + 1)
        }
        await showQuantity(true)
    })

    showQuantity()

})(jQuery)
