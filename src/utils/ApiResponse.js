//When we will send a response we will do so by using this class
//response statusCode indicates whether a specific HTTP request has been successfully completed.
//In companies they provide memos for each statusCode responses like informational responses, successfull responses

class ApiResponse{
    constructor(statusCode, data, message= "Success"){
        this.statusCode= statusCode
        this.data= data
        this.message= message
        this.success= statusCode < 400
    }
}

export { ApiResponse }