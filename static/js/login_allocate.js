import { TableNumberManager, TokenManager } from "./Manager.js";

(async function ($) {

    const idLoginBox = 'login';
    const idAllocateBox = 'allocate-table-number';
    const idUsernameInput = 'id-username';
    const idPasswordInput = 'id-password';
    const idTableNumberInput = 'id-table-number';
    const idQRcodeModal = 'modal-qrcode';

    async function login(username, password) {
        // 使用post方法向後端請求登入
        try {
            let data = await TokenManager.getFromApi(username, password)
            if (!data.status) { showErrorMsg(idLoginBox, data.message); }
            else {
                TokenManager.save(data.token.access, data.token.refresh)
                swal({title: '登入成功', icon: 'success', button: false, timer: 2000})
                .then(() => {
                    history.pushState(null, null, location.origin + '/');
                    rotateTo(idAllocateBox);
                })
            }
        }catch (error) {
            console.log(`login error: ${error}`);
        }
    }

    async function isLogin() {
        // 判斷 登入狀態
        let tokenManager = await new TokenManager().init(false)
        return tokenManager.isLogin
    }

    /* 顯示 錯誤訊息 */
    let showErrorMsg = function (boxID, message) {
        const $errorMsg = $(`#${boxID}`).find('div.error-msg');
        $errorMsg.find('.tooltiptext').text(message).css({'visibility': 'visible', 'opacity': 1});
        $errorMsg.css({'border-width': '3px'});
        $errorMsg.find('div[title="password-input"]').attr('style', 'margin-bottom: 0.5rem');
    }

    /* 關閉 錯誤訊息 */
    let closeErrorMsg = function ($errorMsg) {
        const $tooltip = $errorMsg.find('.tooltiptext');
        if ($tooltip.text()) {
            $errorMsg.removeAttr('style');
            $tooltip.removeAttr('style');
            $errorMsg.find('div[title="password-input"]').removeAttr('style');
            setTimeout(function () {
                $tooltip.text('');
            }, 1000);
        }
    }

    /* 翻轉 指定box (login/allocate) */
    let rotateTo = function (boxID) {
        const $login = $('#' + idLoginBox);
        const $allocate = $('#' + idAllocateBox);
        switch (boxID) {
            case idLoginBox:
                $login.css({'transform': 'rotateY(0deg)'});
                $allocate.css({'transform': 'rotateY(180deg)'});
                return
            case idAllocateBox:
                $login.css({'transform': 'rotateY(180deg)'});
                $allocate.css({'transform': 'rotateY(0deg)'});
                return
            default:
                $login.css({'transform': 'rotateY(0deg)'});
                $allocate.css({'transform': 'rotateY(0deg)'});
                return
        }
    }

    /* 製作 QRcode，並顯示 modal */
    let showQRcodeModal = function(url, tableName) {
        const $qrcodeModal = $('#' + idQRcodeModal);
        const $alertModal = $qrcodeModal.find('#modal-alert');
        const $qrcode = $alertModal.find('#qrcode');

        $alertModal.find('.alert-heading').text(`桌號： ${tableName}`);
        $alertModal.find('.alert-link').attr('href', `?${url.split('?')[1]}`);
        $qrcode.empty();
        $qrcode.qrcode(url);
        $qrcodeModal.modal('show');
    }

    /* ----------------------------------------------- 監聽 -------------------------------------------------- */
    $(document).ready(async function() {
        /*
            判斷是否已登入
            *** 已登入 -> 翻轉allocate box;
            *** 未登入 -> 翻轉login box;
        */
        if (await isLogin()) {
            rotateTo(idAllocateBox);
            history.pushState(null, null, location.origin + '/');
        }
        else { rotateTo(idLoginBox); }
    })

    $('.box div.box-content button[name="box-submit"]').on('click', async function(event) {
        /*
            判斷 login btn / allocate btn 哪個點擊
            *** login btn 點擊 -> 向後端請求登入
            *** allocate btn 點擊 -> 向後端新增桌號，顯示QRcode
        */
        event.preventDefault();

        const $box = $(this).closest('.box')
        // 用box id判斷
        if ($box.attr('id') === idLoginBox) {
            let username = $('#' + idUsernameInput).val();
            let password = $('#' + idPasswordInput).val();
            await login(username, password);
        }
        else {
            let $tbNumberInput = $('#' + idTableNumberInput);
            let data = await TableNumberManager.add($tbNumberInput.val());
            $tbNumberInput.val('');
            showQRcodeModal(data.url, data.tbNumber);
            // showQRcodeModal('http://127.0.0.1:8000/?dGJOdW1iZXJJRD01', '5桌');
        }
    });

    $('.show_password input').change(function (){
        // 變更密碼輸入框 type = password / text
        const password = $('#id-password');
        // 若 選中狀態, 則 type 轉成 text, 顯示輸入的密碼
        if ($(this).prop('checked')){
            password.attr('type', 'text');
        }
        else {
            password.attr('type', 'password');
        }
    });

    $('.error-msg .inputBx input').focus(function () {
        // 關閉錯誤訊息
        closeErrorMsg($(this).parent().parent());
    });

})(jQuery)