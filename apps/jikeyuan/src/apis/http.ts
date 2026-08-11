import axios from "axios";
import { getToken} from "../utils/token";

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL

//1.校驗有沒有環境參數
if(rawApiBaseUrl == undefined)
{
    throw new Error("缺少環境參數");
}
//2。正則化
const apiBaseUrl = rawApiBaseUrl.trim()
// 调用函数 / 构造函数 → ()
if(apiBaseUrl.length == 0){
    throw new Error("缺少環境參數");
}
//step2 創建自己的axios
export const http = axios.create({
    baseURL:apiBaseUrl,
    timeout:10_000,
})

// Step 3：在每次请求真正发出前读取最新 Token。
// token可能過期所以每次請求前都帶上
http.interceptors.request.use((config)=>{
    const token = getToken()
    //普通請求
    if(token!== null)
    {
        config.headers.Authorization =`Bearer ${token}`
    }

    return config;
})