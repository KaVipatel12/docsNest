import axios from 'axios';
import React, { createContext, useCallback, useEffect, useState } from 'react'

const Auth = createContext(); 

function AuthProvider({children}) {
    const token = localStorage.getItem("token"); 
    const [userData , setUserData] = useState(""); 
    const [userLoading, setUserLoading] = useState(false)
    const APP_URI = process.env.REACT_APP_URL
    const userInfo = useCallback (async () => {

        if(!token){
          setUserLoading(false)
            setUserData(''); 
            return; 
        }
        try{
            setUserLoading(true)
            const response = await axios.get(`${APP_URI}/user/fetchuserdata`,
            {
            headers:{
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${token}`
            }
        })
        setUserData(response.data.msg)
    }catch(error){
        console.log(error)
    }finally{
        setUserLoading(false)
    }
    }, [token, APP_URI])

    useEffect(() => {
        userInfo(); 
    }, [userInfo])
  return (
    <div>
      <Auth.Provider value={{userData , userLoading, userInfo}}>
        {children}
      </Auth.Provider>
    </div>
  )
}

export {AuthProvider , Auth}
