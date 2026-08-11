//import axios from 'axios'
import {http} from './http'

export interface LoginValues{
    mobile:string,
    code:string,
}

//後端登錄響應的契約 
interface LoginResponse{
    data:{
        token:string
    }
}


export async function LoginRequest(values:LoginValues):Promise<string>{
    const response = await http.post<LoginResponse>(
        '/auth',
        values,
    )
    //response
    /**
     * {
  data: {
    data: {
      token: "abc123"
    }
  },
  status: 200,
  headers: {...},
  config: {...},
  request: {...}
}
     */
    return response.data.data.token;

    
}