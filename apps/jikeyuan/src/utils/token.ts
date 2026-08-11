//設置keyname解耦代碼
const TOKEN_STORE_KEY = 'youjie_access_token';

export function getToken():string|null{
    //step1 從localstoreage直接獲取token
    const storedToken = localStorage.getItem(TOKEN_STORE_KEY)
    //step2 進行條件判斷
    if(storedToken == null){
        return null;
    }

    //step3 正則化token,string 都要正則化
    const normalizationToken = storedToken.trim()
    //邊界情況 如果 token只有空格
    if(normalizationToken.length == 0)
    {
        return null
    }

    return  normalizationToken;
}

export function setToken(needSetToken :string): boolean
{   
    //step1:同樣正則化string
    const noralizedToken = needSetToken.trim()
    
    if(noralizedToken.length == null)
    {
        throw new Error("token不合法,值為空")
    }
    localStorage.setItem(
        TOKEN_STORE_KEY,
        noralizedToken
    )

    return true;
}

export function removeToken():void{
    
    localStorage.removeItem(TOKEN_STORE_KEY)
}