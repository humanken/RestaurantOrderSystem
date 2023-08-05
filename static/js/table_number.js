
const tbNumberApiUrl = location.origin + '/api/tableNumbers/'
const waitingUrl = location.origin + `/waiting/`
const errorUrl = location.origin + '/error'

export const TableNumberManger = class {

    static getData = async function (params = {}) {
        try {
            let apiUrl = new URL(tbNumberApiUrl)
            apiUrl.search = new URLSearchParams(params).toString()
            let response = await fetch(apiUrl)
            return await response.json()
        }catch (error) {  // 捕獲異常 訊息
            console.log(error)
        }
    }

    static getID = async function (tbNumber, isSend, checkOut) {
        try {
            let data_json = await TableNumberManger.getData({
                tbNumber: tbNumber, isSend: isSend, checkOut: checkOut
            })
            return data_json[0].id
        }catch (error) {  // 捕獲異常 訊息
            console.log(error)
        }
    }

    static checkRedirect = async function (tbNumberID) {
        let data = await TableNumberManger.getData({tbNumberID: tbNumberID});
        if (data.checkOut) {
            window.location.href = errorUrl;
        }
        else {
            if (data.isSend) { window.location.href = waitingUrl + tbNumberID; }
        }
    }

    static add = async function (tbNumber) {
        let params = {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'tbNumber': tbNumber, 'isSend': false, 'checkOut': false})
        }
        try {
            // 獲取 response對象
            let response = await fetch(tbNumberApiUrl, params)
            // 透過json()，取得response內資料
            let data_json = await response.json()
            return data_json[0].id
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
        let params = {
            method: 'delete',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'tbNumberID': tbNumberID})
        }
        try {
            // 獲取 response對象
            let response = await fetch(tbNumberApiUrl, params)
            return await response
        }catch (error) {  // 捕獲異常 訊息
            console.log(`remove table number error: ${error}`)
        }
    }
}