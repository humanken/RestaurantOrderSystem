
const orderMealsApiUrl = location.origin + '/api/order/'
export let OrderMealsManger = class {

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
        const meals = await OrderMealsManger.getOrderMeals(tbNumberID);
        let total = 0;
        $.each(meals, function () {
            total += (this.quantity * this.detail.price)
        });
        return total
    };

    static getTotalQuantity = async function (tbNumberID){
        const meals = await OrderMealsManger.getOrderMeals(tbNumberID);
        let total = 0;
        $.each(meals, function () {
            total += this.quantity
        });
        return total
    };

    static getQuantity = async function (tbNumberID, mealID){
        const meals = await OrderMealsManger.getOrderMeals(tbNumberID);
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