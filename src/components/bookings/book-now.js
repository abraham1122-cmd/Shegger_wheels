
import { useRouter } from "next/navigation";
import { isSignedIn } from "@/lib/sessions";


export default function Book_Now_Button({ carId }){

    const router = useRouter();

    function HandleBookNow(){

            const checkoutURL = `chechout?carId=${encodeURIcomponent(carId)}`;

            if(isSignedIn){
                router.push(checkoutURL);
            }

            else{

                `signin?next=${encodeURIComponent(checkoutURL)}`

            }
    }



    return(

        <div>
            <button
            type="submit"
            onClick={HandleBookNow}
            className=""
            >Book-Now</button>
           
        </div>


    )



}
