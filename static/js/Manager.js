const menuApiUrl = '/api/menu/'
const potTypeApiUrl = '/api/pot_type/'
const potMeatApiUrl = '/api/pot_meat/'
const tbNumberApiUrl = '/api/tableNumbers/'
const tbNumberUserApiUrl = '/api/tableNumbersUser/'
const orderMealsApiUrl = '/api/order/'
const loginUrl = '/login/'
const waitingUrl = `/waiting/`
const errorUrl = '/error/'
const loginApiUrl = '/api/login/'
const reLoginApiUrl = '/api/reLogin/'

let potTypeDict;
let potMeatDict;

export const TableNumberManager = class {

    static getData = async function (params = {}) {
        try {
            let searchParams = new URLSearchParams(params).toString();
            console.log(searchParams)
            let response = await fetch(tbNumberApiUrl + '?' + searchParams)
            return await response.json()
        }catch (error) {  // 捕獲異常 訊息
            console.log(error)
        }
    }

    static getIDFromAllocate = function () {
        let encodeParams = location.search.slice(1)
        let splitParams = atob(encodeParams).split('=')
        if (splitParams.length > 1) {
            history.pushState(null, null, location.origin);
            return splitParams.pop()
        } else {
            window.location.href = errorUrl;
        }
    }

    static getID = async function (tbNumber, isSend, checkOut) {
        try {
            let data_json = await TableNumberManager.getData({
                tbNumber: tbNumber, isSend: isSend, checkOut: checkOut
            })
            return data_json[0].id
        }catch (error) {  // 捕獲異常 訊息
            console.log(error)
        }
    }

    static checkRedirect = async function (tbNumberID) {
        let data = await TableNumberManager.getData({tbNumberID: tbNumberID});
        if (data.checkOut) {
            window.location.href = errorUrl;
        }
        else {
            if (data.isSend) { window.location.href = waitingUrl + tbNumberID; }
        }
    }

    static add = async function (tbNumber) {
        let tokenManager = await new TokenManager().init(true);
        let params = {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenManager.token.access}`
            },
            body: JSON.stringify({'tbNumber': tbNumber})
        }
        console.log('add table number params: ', params)
        try {
            // 獲取 response對象
            let response = await fetch(tbNumberUserApiUrl, params)
            // 透過json()，取得response內資料
            return await response.json()
        }catch (error) {  // 捕獲異常 訊息
            console.log(`add table number error: ${error}`)
        }
    }

    static checkOut = async function (tbNumberID) {
        let params = {
            method: 'patch',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'tbNumberID': tbNumberID, 'checkOut': true})
        }
        try {
            // 獲取 response對象
            let response = await fetch(tbNumberApiUrl, params)
            return await response
        }catch (error) {  // 捕獲異常 訊息
            console.log(`check out table number error: ${error}`)
        }
    }

    static send = async function (tbNumberID){
        let params = {
            method: 'patch',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'tbNumberID': tbNumberID, 'isSend': true})
        }
        try {
            // 獲取 response對象
            let response = await fetch(tbNumberApiUrl, params)
            return await response
        }catch (error) {  // 捕獲異常 訊息
            console.log(`send table number error: ${error}`)
        }
    }

    static remove = async function (tbNumberID) {
        let tokenManager = await new TokenManager().init(true);
        let params = {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenManager.token.access}`
            },
            body: JSON.stringify({'tbNumberID': tbNumberID})
        }
        try {
            // 獲取 response對象
            let response = await fetch(tbNumberUserApiUrl, params)
            return await response
        }catch (error) {  // 捕獲異常 訊息
            console.log(`remove table number error: ${error}`)
        }
    }
}


export const OrderMealsManager = class {

    static getOrderMeals = async function (tbNumberID) {
        try {
            // 獲取 response對象
            let response = await fetch(orderMealsApiUrl + `?tbNumberID=${tbNumberID}`)
            // 透過json()，取得response內資料
            let data_json = await response.json()
            return data_json[tbNumberID].meals
        }catch (error) {  // 捕獲異常 訊息
            console.log(`get order meals error: ${error}`)
        }
    };

    static getGrandTotalPrice = async function (tbNumberID){
        const meals = await OrderMealsManager.getOrderMeals(tbNumberID);
        let total = 0;
        $.each(meals, function () {
            total += (this.quantity * this.detail.price)
        });
        return total
    };

    static getTotalQuantity = async function (tbNumberID){
        const meals = await OrderMealsManager.getOrderMeals(tbNumberID);
        let total = 0;
        $.each(meals, function () {
            total += this.quantity
        });
        return total
    };

    static getQuantity = async function (tbNumberID, mealID){
        const meals = await OrderMealsManager.getOrderMeals(tbNumberID);
        let item = meals.filter(item => item.detail.id.toString() === mealID)
        if (item.length) { return item[0].quantity }
        else { return false }
    };

    static add = async function (tbNumberID, mealID, quantity) {
        let params = {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'tbNumberID': tbNumberID,
                'menuID': mealID,
                'quantity': quantity
            })
        }
        try {
            // 獲取 response對象
            let response = await fetch(orderMealsApiUrl, params)
            return await response
        }catch (error) {  // 捕獲異常 訊息
            console.log(`add order meal error: ${error}`)
        }
    }

    static update = async function (tbNumberID, mealID, quantity) {
        let params = {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'tbNumberID': tbNumberID,
                'menuID': mealID,
                'quantity': quantity
            })
        }
        try {
            // 獲取 response對象
            let response = await fetch(orderMealsApiUrl, params)
            return await response
        }catch (error) {  // 捕獲異常 訊息
            console.log(`update order meal error: ${error}`)
        }
    }

    static remove = async function (tbNumberID, mealID) {
        let params = {
            method: 'delete',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'tbNumberID': tbNumberID, 'menuID': mealID})
        }
        try {
            // 獲取 response對象
            let response = await fetch(orderMealsApiUrl, params)
            return await response
        }catch (error) {  // 捕獲異常 訊息
            console.log(`remove order meal error: ${error}`)
        }
    }

}


export const MenuManager = class {

    /* 取得 菜單 資料 */
    static getMenuData = async function (type) {
        try {
            // 獲取 response對象
            let response = await fetch(menuApiUrl + '?type=' + type)
            return await response.json()
        }catch (error) {  // 捕獲異常 訊息
            console.log(error)
        }
    }

    /* 取得 火鍋種類 資料 */
    static getTypeDict = async function () {
        if (potTypeDict) { return potTypeDict }
        try {
            let response = await fetch(potTypeApiUrl)
            potTypeDict = await response.json()
            return potTypeDict
        }catch (error) {  // 捕獲異常 訊息
            console.log(error)
        }
    }

    /* 取得 火鍋肉量／肉種類 資料 */
    static getMeatDict = async function () {
        if (potMeatDict) { return potMeatDict }
        try {
            let response = await fetch(potMeatApiUrl)
            potMeatDict = await response.json()
            return potMeatDict
        }catch (error) {  // 捕獲異常 訊息
            console.log(error)
        }
    }

}


export const TokenManager = class {

    init = async (isRedirect) => {
        let data = {
            'isLogin': false,
            'token': null
        }
        let sessionToken = this._getFromSession();
        if (!sessionToken) {
            console.log('沒有token資料，請先登入');
            if (isRedirect) { location.href = loginUrl; }
            return data
        }

        if (!await this._isExpired(sessionToken.access)) {
            data.isLogin = true
            data.token = sessionToken
            return data
        }

        if (await this._update(sessionToken.refresh)) {
            data.isLogin = true
            data.token = this._getFromSession();
            return data
        } else {
            console.log('token資料已超時，請重新登入');
            if (isRedirect) { location.href = loginUrl; }
            return data
        }
    }

    static getFromApi = async function (username, password) {
        // 使用post方法向後端請求登入
        try {
            let params = {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    'username': username, 'password': password
                })
            }
            let response = await fetch(loginApiUrl, params);
            return await response.json()
        }catch (error) {
            console.log(`login error: ${error}`);
        }
    }

    static save = function (access, refresh) {
        sessionStorage.setItem('accessToken', access)
        sessionStorage.setItem('refreshToken', refresh)
    }

    _getFromSession = function () {
        let access = sessionStorage.getItem('accessToken')
        let refresh = sessionStorage.getItem('refreshToken')
        if ((!access) || (!refresh)) { return null }
        else {
            return {access: access, refresh: refresh}
        }
    }

    _update = async function (refresh) {
        try {
            let params = {
                method: 'post',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `refresh=${refresh}`
            }
            let response = await fetch(reLoginApiUrl, params);
            let data = await response.json();
            if (data.status) {
                TokenManager.save(data.token.access, data.token.refresh);
                return true
            } else { return false }
        }catch (error) {
            console.log(`refresh error: ${error}`)
            return false
        }
    }

    /* 向後端確認token狀態 (是否過期) */
    _isExpired = async function (accessToken) {
        try {
            // 向後端請求判斷token期限
            let params = {
                method: 'get', headers: {'Authorization': `Bearer ${accessToken}`}
            }
            let response = await fetch(loginApiUrl + '?check=token_exp', params)
            let data = await response.json();
            return !!data.status
        }catch (error) {
            console.log(`check is_expired error: ${error}`);
            return true
        }
    }

}