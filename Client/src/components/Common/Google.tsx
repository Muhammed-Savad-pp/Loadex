import React from "react";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { transporterGoogleLogin } from "../../services/transporter/transporterApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slice/authSlice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { shipperGoogleLogin } from "../../services/shipper/shipperService";

const Google: React.FC = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate()


    const role = location.pathname.includes("transporter") ? "transporter" : "shipper";

    const handleSuccess = async( credentialResponse: any) => {
        console.log(credentialResponse, 'dadf');


        const token = credentialResponse.credential;

        try {
            
            const userData : any = jwtDecode(token);
            console.log(userData, 'suer');

            if(role == 'transporter'){
                const response: any = await transporterGoogleLogin(userData.name, userData.email);

                console.log(response);

                if(response.success)  {
                    
                    toast.success(response.message)

                    dispatch(loginSuccess({token: response.accessToken, role: response.role}))

                    navigate('/')

                }
            } else if(role == 'shipper') {

                const response : any = await shipperGoogleLogin(userData.name, userData.email)

                console.log(response, 'asdfanshdfj');
                

                if(response.success) {
                    toast.success(response.message)

                    dispatch(loginSuccess({token: response.accessToken, role: response.role}))

                    navigate('/')
                }
                
            }
            

        } catch (error) {
            console.log(error)
        }
    }

    
    const handleError = () => {
        console.log("Google Login Failed");
    };

    return (
        <>
            <GoogleOAuthProvider clientId="922153720133-6gq7e4qbl3jqklabvotm02eg5csb24p6.apps.googleusercontent.com">
            <div className="google-auth-container w-[300px] ml-[125px]">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    theme="outline" // Button theme: "outline" or "filled_blue"
                    size="large" // Button size: "large", "medium", or "small"
                    text="signin_with" // Button text: "signin_with" or "signup_with"
                    shape="pill" // Button shape: "pill", "rectangular", or "circle"
                />
            </div>
            </GoogleOAuthProvider>
        </>
    )
}

export default Google