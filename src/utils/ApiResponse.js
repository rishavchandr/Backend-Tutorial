class ApiResponse {
    constructor(statusCode,data,message="success"){
        this.statusCode = statusCode
        this.data = data
        this.message = 
        this.success = statusCode < 400
    }
}

export {ApiResponse}